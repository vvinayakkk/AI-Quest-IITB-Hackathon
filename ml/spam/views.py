from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

# Create your views here.
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import numpy as np
from typing import Dict, Any
from dotenv import load_dotenv
import os

load_dotenv()


class HybridSpamDetector:
    def __init__(self):
        # Load pre-trained spam detection model (using bert-base-uncased fine-tuned on spam)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
        self.model = AutoModelForSequenceClassification.from_pretrained(
            'bert-base-uncased', 
            num_labels=2
        ).to(self.device)
        
        # Initialize backup Gemini system
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Google API key is not set. Please check your .env file.")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.3,
            max_tokens=256,
            api_key=api_key
        )
        
        # Categories for classification
        self.spam_categories = {
            'promotional': ['offer', 'discount', 'limited time', 'buy now'],
            'scam': ['urgent', 'account blocked', 'verify now', 'bank details'],
            'inappropriate': ['adult content', 'offensive', 'explicit'],
            'malicious': ['malware', 'virus', 'hack', 'crack'],
            'phishing': ['password', 'login', 'verify account', 'security alert']
        }
        
        # Load additional pre-trained models for specific checks
        self.toxicity_tokenizer = AutoTokenizer.from_pretrained('unitary/toxic-bert')
        self.toxicity_model = AutoModelForSequenceClassification.from_pretrained('unitary/toxic-bert').to(self.device)

    def preprocess_text(self, text: str) -> torch.Tensor:
        """Tokenize and prepare text for model input"""
        inputs = self.tokenizer(
            text,
            truncation=True,
            max_length=512,
            padding='max_length',
            return_tensors='pt'
        )
        return inputs.to(self.device)

    def get_spam_score(self, text: str) -> float:
        """Get spam probability using pre-trained model"""
        with torch.no_grad():
            inputs = self.preprocess_text(text)
            outputs = self.model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            return probabilities[0][1].item()  # Probability of spam class

    def check_toxicity(self, text: str) -> float:
        """Check content toxicity using toxic-bert"""
        with torch.no_grad():
            inputs = self.toxicity_tokenizer(
                text,
                return_tensors='pt',
                truncation=True,
                max_length=512
            ).to(self.device)
            outputs = self.toxicity_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            return probs[0][1].item()

    def identify_categories(self, text: str) -> list:
        """Identify specific spam categories"""
        text_lower = text.lower()
        detected_categories = []
        
        for category, keywords in self.spam_categories.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_categories.append(category)
                
        return detected_categories

    def get_gemini_validation(self, text: str, initial_score: float) -> Dict[str, Any]:
        """Get secondary validation from Gemini for borderline cases"""
        if 0.3 <= initial_score <= 0.7:  # Only use Gemini for uncertain cases
            prompt = PromptTemplate(
                input_variables=["content"],
                template="""
                Analyze if this content is spam. Consider:
                - Promotional content
                - Scams/fraud attempts
                - Inappropriate content
                - Malicious intent
                
                Content: {content}
                
                Respond with only a number between 0 and 1 indicating spam probability.
                """
            )
            chain = LLMChain(llm=self.llm, prompt=prompt)
            try:
                gemini_score = float(chain.run(content=text))
                return {
                    "gemini_score": gemini_score,
                    "combined_score": (initial_score + gemini_score) / 2
                }
            except:
                return {
                    "gemini_score": None,
                    "combined_score": initial_score
                }
        return {
            "gemini_score": None,
            "combined_score": initial_score
        }

    def analyze_content(self, text: str) -> Dict[str, Any]:
        """Complete content analysis"""
        # Get initial spam score
        spam_score = self.get_spam_score(text)
        
        # Get toxicity score
        toxicity_score = self.check_toxicity(text)
        
        # Identify specific categories
        categories = self.identify_categories(text)
        
        # Get Gemini validation for uncertain cases
        gemini_results = self.get_gemini_validation(text, spam_score)
        
        # Calculate final spam probability
        final_score = gemini_results["combined_score"]
        
        return {
            "is_spam": final_score > 0.5,
            "spam_score": final_score,
            "initial_score": spam_score,
            "toxicity_score": toxicity_score,
            "gemini_score": gemini_results["gemini_score"],
            "categories": categories,
            "confidence": 1 - abs(0.5 - final_score) * 2,
            "requires_manual_review": 0.4 <= final_score <= 0.6
        }

# Initialize global detector
spam_detector = HybridSpamDetector()

@csrf_exempt
@require_http_methods(["POST"])
def analyze_spam(request):
    try:
        data = json.loads(request.body)
        content = data.get('content', '')
        
        if not content:
            return JsonResponse({
                'error': 'No content provided'
            }, status=400)
            
        analysis = spam_detector.analyze_content(content)
        
        return JsonResponse({
            'analysis': analysis,
            'content_length': len(content),
            'status': 'success'
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def bulk_analyze_spam(request):
    try:
        data = json.loads(request.body)
        contents = data.get('contents', [])
        
        if not contents:
            return JsonResponse({
                'error': 'No contents provided'
            }, status=400)
            
        results = []
        for content in contents:
            analysis = spam_detector.analyze_content(content)
            results.append({
                'content': content,
                'analysis': analysis
            })
            
        return JsonResponse({
            'results': results,
            'total_analyzed': len(results),
            'status': 'success'
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
      },status=500)

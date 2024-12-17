import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from openai import OpenAI

class QAView:
    def __init__(self):
        # Gemini Configuration
        self.gemini_api_key = os.getenv('GOOGLE_API_KEY')
        self.gemini_llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.3,
            max_tokens=512,  # Increased to allow more detailed responses
            api_key=self.gemini_api_key
        )
        
        # OpenAI Configuration
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    @csrf_exempt
    def gemini_answer(self, request):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                heading = data.get('heading', '')
                post_content = data.get('postContent', '')

                # Improved Gemini Prompt Template for Markdown-friendly output
                prompt_template = PromptTemplate(
                    input_variables=['heading', 'post_content'],
                    template="""
                    Help a student with their programming question professionally.
                    Provide the answer in Markdown format with:
                    - Clear, structured explanation using headers
                    - Syntax-highlighted code blocks
                    - Code examples when applicable
                    - Concise, informative content

                    ## Question
                    **Heading:** {heading}
                    **Description:** {post_content}

                    ## Solution
                    """
                )

                # Create LLM Chain
                chain = LLMChain(llm=self.gemini_llm, prompt=prompt_template)
                response = chain.run(heading=heading, post_content=post_content)

                return JsonResponse({
                    'answer': response,
                    'source': 'Gemini',
                    'format': 'markdown'
                })

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)

    @csrf_exempt
    def openai_answer(self, request):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                heading = data.get('heading', '')
                post_content = data.get('postContent', '')

                # Modified OpenAI Prompt for Markdown-friendly output
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": """
                            You are a professional programming assistant. 
                            Provide answers in clean Markdown format with:
                            - Structured headers
                            - Syntax-highlighted code blocks
                            - Clear, concise explanations
                            - Inline code and formatting
                            - Relevant examples
                            """
                        },
                        {
                            "role": "user", 
                            "content": f"""
                            ## Question Details
                            **Heading:** {heading}
                            **Description:** {post_content}

                            ## Provide a Solution
                            - Use Markdown formatting
                            - Include a code snippet if relevant
                            - Add explanatory comments
                            - Conclude with best practices or learning tips
                            """
                        }
                    ]
                )

                answer = response.choices[0].message.content

                return JsonResponse({
                    'answer': answer,
                    'source': 'OpenAI',
                    'format': 'markdown'
                })

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)

# Instantiate the view
qa_view = QAView()
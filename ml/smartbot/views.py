import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain


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
        
    @csrf_exempt
    def gemini_answer(self, request):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                heading = data.get('heading', '')
                post_content = data.get('postContent', '')
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

qa_view = QAView()
import os
import pymongo
import gridfs
import json
import io
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import PyPDF2
import docx

class DocumentAnalysisView:
    def __init__(self):
        # MongoDB Connection
        self.mongo_uri = os.getenv('MONGO_URI')
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client['AI-Quest']
        self.documents_collection = self.db['documents']
        self.fs = gridfs.GridFS(self.db)

        # Gemini Configuration
        self.gemini_api_key = os.getenv('GOOGLE_API_KEY')
        self.gemini_llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.3,
            max_tokens=1024,
            api_key=self.gemini_api_key
        )

    def extract_text_from_file(self, file):
        """
        Extract text from various file types
        Supports PDF, DOCX, TXT
        """
        try:
            # Get file extension
            file_ext = os.path.splitext(file.name)[1].lower()
            
            # Convert in-memory file to bytes
            file_content = file.read()
            
            # Reset file pointer
            file.seek(0)
            
            # PDF Extraction
            if file_ext == '.pdf':
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                text = ' '.join([page.extract_text() for page in pdf_reader.pages])
            
            # DOCX Extraction
            elif file_ext == '.docx':
                doc = docx.Document(io.BytesIO(file_content))
                text = ' '.join([para.text for para in doc.paragraphs])
            
            # Plain Text Extraction
            elif file_ext in ['.txt', '.md', '.csv']:
                text = file_content.decode('utf-8')
            
            else:
                return f"Unsupported file type: {file_ext}"

            return text

        except Exception as e:
            return f"Error processing file: {str(e)}"

    @csrf_exempt
    def upload_document(self, request):
        """
        Upload document, extract text, chunk it, and store in MongoDB
        """
        if request.method == 'POST':
            try:
                file = request.FILES.get('document')
                if not file:
                    return JsonResponse({'error': 'No document uploaded'}, status=400)

                # Extract text
                text = self.extract_text_from_file(file)

                # Check if text extraction failed
                if text.startswith("Unsupported file type") or text.startswith("Error processing file"):
                    return JsonResponse({'error': text}, status=400)

                # Text Splitting
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len
                )
                
                # Create document chunks
                chunks = text_splitter.split_text(text)
                
                # Store file in GridFS
                file_id = self.fs.put(file.read(), filename=file.name)
                
                # Prepare document metadata
                document_metadata = {
                    'document_id': str(file_id),
                    'filename': file.name,
                    'total_chunks': len(chunks),
                    'original_text_length': len(text)
                }
                
                # Store document metadata and chunks
                document_record = {
                    'metadata': document_metadata,
                    'chunks': chunks
                }
                
                result = self.documents_collection.insert_one(document_record)

                return JsonResponse({
                    'document_id': str(file_id),
                    'total_chunks': len(chunks)
                })

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

    @csrf_exempt
    def query_document(self, request):
        """
        Query a specific document with a question
        """
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                document_id = data.get('document_id')
                question = data.get('question')

                # Retrieve document
                document = self.documents_collection.find_one({'metadata.document_id': document_id})
                
                if not document:
                    return JsonResponse({'error': 'Document not found'}, status=404)

                # Create Prompt Template for Document Querying
                query_prompt = PromptTemplate(
                    input_variables=['context', 'question'],
                    template="""
                    Context: {context}
                    Question: {question}

                    Provide a structured, professional answer based strictly on the context.
                    Include:
                    - Clear explanation
                    - Relevant details from the document
                    - Professional tone
                    - Highlight key insights
                    """
                )

                # Combine chunks for context
                context = " ".join(document.get('chunks', []))

                # Create Chain
                chain = LLMChain(llm=self.gemini_llm, prompt=query_prompt)
                
                # Generate Answer
                answer = chain.run(context=context, question=question)

                return JsonResponse({
                    'answer': answer,
                    'document_id': document_id
                })

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

    @csrf_exempt
    def document_analysis(self, request, document_id):
        """
        Comprehensive document analysis
        """
        if request.method == 'GET':
            try:
                # Retrieve document
                document = self.documents_collection.find_one({'metadata.document_id': document_id})
                
                if not document:
                    return JsonResponse({'error': 'Document not found'}, status=404)

                # Analysis Prompt Template
                analysis_prompt = PromptTemplate(
                    input_variables=['context'],
                    template="""
                    Perform a comprehensive analysis of the following document context:
                    {context}

                    Provide a detailed report including:
                    1. Document Overview
                    2. Key Themes and Topics
                    3. Main Insights
                    4. Potential Implications
                    5. Suggested Further Reading/Research
                    """
                )

                # Combine chunks for context
                context = " ".join(document.get('chunks', []))

                # Create Chain
                chain = LLMChain(llm=self.gemini_llm, prompt=analysis_prompt)
                
                # Generate Comprehensive Analysis
                comprehensive_analysis = chain.run(context=context)

                return JsonResponse({
                    'document_id': document_id,
                    'analysis': comprehensive_analysis,
                    'metadata': document['metadata']
                })

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

# Instantiate the view
document_analysis_view = DocumentAnalysisView()
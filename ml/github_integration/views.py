import os
import json
import requests
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["POST"])
def chat_single_file(request):
    """Chat with a single file context"""
    try:
        data = json.loads(request.body)
        message = data.get('message')
        owner = data.get('owner')
        repo = data.get('repo')
        selected_file = data.get('selected_file')
        file_content = data.get('file_content', '')
        chat_context = data.get('context', [])
        
        # Enhanced logging
        print("Request Data:")
        print(f"Owner: {owner}")
        print(f"Repo: {repo}")
        print(f"Selected File: {selected_file}")
        print(f"Message: {message}")
        print(f"File Content Length: {len(file_content)}")

        # Prepare context
        context_parts = [
            f"File: {selected_file}\n{file_content[:5000]}"  # Limit content length
        ]

        # Add chat history context (last 5 messages)
        if chat_context:
            chat_history = [
                f"{msg['role']}: {msg['content']}" 
                for msg in chat_context[-5:]
            ]
            context_parts.extend(chat_history)
        
        # Join context
        context_text = "\n\n".join(context_parts) if context_parts else ""
        
        # Prepare payload for Grok API
        payload = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful AI assistant answering questions about a specific file in a GitHub repository. Provide concise, relevant answers based on the file's content."
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{context_text}\n\nQuestion: {message}"
                }
            ],
            "temperature": 0.7,
            "stream": False
        }

        # Prepare headers
        grok_headers = {
            "Authorization": f"Bearer {os.getenv('GROK_API_KEY')}",
            "Content-Type": "application/json"
        }

        try:
            # Send request to Grok API
            print("Sending request to Grok API...")
            response = requests.post(
                "https://api.x.ai/v1/chat/completions", 
                headers=grok_headers, 
                json=payload,
                timeout=30  # Added timeout
            )
            
            # Enhanced error checking
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            
            # More comprehensive error handling
            if response.status_code != 200:
                print(f"API Error: {response.status_code}")
                print(f"Response Content: {response.text}")
                return JsonResponse({
                    'error': f"API returned status code {response.status_code}",
                    'response_text': response.text
                }, status=response.status_code)
            
            # Parse response
            response_json = response.json()
            print("Full Response JSON:")
            print(json.dumps(response_json, indent=2))
            
            # More robust response extraction
            if 'choices' in response_json and response_json['choices']:
                grok_response = response_json['choices'][0]['message']['content']
            else:
                print("Unexpected response format")
                grok_response = "Unable to process the API response"

        except requests.RequestException as e:
            print(f"Detailed API Error: {e}")
            print(traceback.format_exc())
            grok_response = f"Network Error: {e}"
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Response Text: {response.text}")
            grok_response = "Error parsing API response"
        except Exception as e:
            print(f"Unexpected Error: {e}")
            print(traceback.format_exc())
            grok_response = f"Unexpected error: {e}"

        return JsonResponse({
            'response': grok_response,
            'file': selected_file
        })

    except Exception as e:
        print(f"Request Processing Error: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=400)
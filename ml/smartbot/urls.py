from django.urls import path
from .views import qa_view

urlpatterns = [
    path('gemini-answer/', qa_view.gemini_answer, name='gemini_answer'),
    path('openai-answer/', qa_view.openai_answer, name='openai_answer'),
]
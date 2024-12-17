from django.urls import path
from .views import qa_view

urlpatterns = [
    path('gemini-answer/', qa_view.gemini_answer, name='gemini_answer'),
]
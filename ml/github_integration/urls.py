from django.urls import path
from .views import chat_single_file

urlpatterns = [
    path('chat/single-file/', chat_single_file),
]
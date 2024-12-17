from django.urls import path
from .views import chat_single_file , chat_entire_repo , index_entire_repo

urlpatterns = [
    path('chat/single-file/', chat_single_file),
    path('repo-chat/', chat_entire_repo),
    path('index-repo/', index_entire_repo)
]
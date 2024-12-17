from django.urls import path
from .views import index_repository, chat

urlpatterns = [
    path('chat/repository/index/', index_repository),
    path('chat/repository/', chat),
]
from django.urls import path
from .views import ProcessUrlsView, QueryKnowledgeBaseView, ChatWithUrlView

urlpatterns = [
    path('process-urls/', ProcessUrlsView.as_view(), name='process_urls'),
    path('query/', QueryKnowledgeBaseView.as_view(), name='query_knowledge_base'),
    path('chat-with-url/', ChatWithUrlView.as_view(), name='chat-with-url'),

]
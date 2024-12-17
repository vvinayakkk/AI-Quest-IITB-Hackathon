from django.urls import path
from .views import ProcessUrlsView, QueryKnowledgeBaseView

urlpatterns = [
    path('process-urls/', ProcessUrlsView.as_view(), name='process_urls'),
    path('query/', QueryKnowledgeBaseView.as_view(), name='query_knowledge_base'),
]
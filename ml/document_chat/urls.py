from django.urls import path
from .views import document_analysis_view

urlpatterns = [
    path('upload-document/', document_analysis_view.upload_document, name='upload_document'),
    path('query-document/', document_analysis_view.query_document, name='query_document'),
    path('document-analysis/<str:document_id>/', document_analysis_view.document_analysis, name='document_analysis'),
]
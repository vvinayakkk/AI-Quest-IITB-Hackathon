from django.urls import path
from . import views

urlpatterns = [
    path('spam/analyze/', views.analyze_spam, name='analyze_spam'),
    path('spam/bulk-analyze/', views.bulk_analyze_spam, name='bulk_analyze_spam'),
]
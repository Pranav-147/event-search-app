from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_files, name='upload_files'),
    path('search/', views.search_events, name='search_events'),
    path('files/', views.get_uploaded_files, name='get_uploaded_files'),
    path('health/', views.health_check, name='health_check'),
]

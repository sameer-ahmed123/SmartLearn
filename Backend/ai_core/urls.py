from django.urls import path
from ai_core.views import *
from .views import AIChatView

app_name = "ai_core"

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai_chat'),
    
]

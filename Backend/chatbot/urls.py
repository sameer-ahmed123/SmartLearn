from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # GET: Fetch the chat history for a specific lecture
    path('lectures/<int:lecture_id>/history/', views.get_chat_history, name='chat-history'),
    
    # POST: Send a new message to the AI for a specific lecture
    path('lectures/<int:lecture_id>/send/', views.send_chat_message, name='chat-send'),
]
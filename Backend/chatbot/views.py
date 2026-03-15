from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from chatbot.models import ChatSession, ChatMessage
from chatbot.serializers import ChatSessionSerializer
from lectures.models import Lecture
import google.generativeai as genai
import os

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request, lecture_id):
    """Fetches the existing chat history for a student and lecture, or creates a blank session."""
    lecture = get_object_or_404(Lecture, id=lecture_id)
    session, created = ChatSession.objects.get_or_create(student=request.user, lecture=lecture)
    
    serializer = ChatSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_chat_message(request, lecture_id):
    """Saves user message, sends history to Gemini, and saves the AI response."""
    user_query = request.data.get('message')
    if not user_query:
        return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    lecture = get_object_or_404(Lecture, id=lecture_id)
    session, _ = ChatSession.objects.get_or_create(student=request.user, lecture=lecture)

    # 1. Save Student Message
    ChatMessage.objects.create(session=session, sender='user', text=user_query)

    # 2. Prepare Conversation History for Gemini
    # We grab the last 15 messages to keep the context window reasonable
    past_messages = session.messages.order_by('-timestamp')[:15]
    history = []
    # Reverse to chronological order
    for msg in reversed(past_messages):
        role = "user" if msg.sender == "user" else "model"
        history.append({"role": role, "parts": [msg.text]})

    # 3. Call Gemini (Using the model from your earlier task logs)
    try:
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Start a chat session with the model using the history
        chat = model.start_chat(history=history[:-1]) # Pass all but the very last message we just added
        
        system_instruction = f"You are a helpful AI tutor for the lecture: {lecture.topic}. Context: {lecture.summary_text}"
        
        # Send the new message with the system instruction enforcing the context
        response = chat.send_message(f"System Context: {system_instruction}\n\nStudent Question: {user_query}")
        
        ai_response_text = response.text

        # 4. Save AI Response
        ai_msg = ChatMessage.objects.create(session=session, sender='ai', text=ai_response_text)

        return Response({
            "sender": "ai",
            "text": ai_response_text,
            "timestamp": ai_msg.timestamp
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"detail": f"AI Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
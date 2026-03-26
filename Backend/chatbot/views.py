from chatbot.services import get_ai_response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from chatbot.models import ChatSession, ChatMessage
from chatbot.serializers import ChatSessionSerializer
from lectures.models import Lecture

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
    user_query = request.data.get('message')
    if not user_query:
        return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    lecture = get_object_or_404(Lecture, id=lecture_id)
    session, _ = ChatSession.objects.get_or_create(student=request.user, lecture=lecture)

    # 1. Save Student Message
    ChatMessage.objects.create(session=session, sender='user', text=user_query)

    try:
        # 2. Delegate AI logic to Service
        ai_response_text = get_ai_response(session, user_query)

        # 3. Save AI Response
        ai_msg = ChatMessage.objects.create(session=session, sender='ai', text=ai_response_text)

        return Response({
            "sender": "ai",
            "text": ai_response_text,
            "timestamp": ai_msg.timestamp
        })

    except Exception as e:
        return Response({"detail": f"AI Error: {str(e)}"}, status=500)
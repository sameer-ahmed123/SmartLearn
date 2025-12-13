from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'message_content', 'is_ai_response', 'created_at']
        read_only_fields = ('user', 'created_at')
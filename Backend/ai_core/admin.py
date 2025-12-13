from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'message_content', 'is_ai_response', 'created_at')
    list_filter = ('is_ai_response', 'created_at')
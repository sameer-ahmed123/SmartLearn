from django.db import models
from django.conf import settings
from lectures.models import Lecture

class ChatSession(models.Model):
    """
    Represents an ongoing conversation between a specific student and the AI Tutor for a specific lecture.
    KEEP CHAT EVEN AFTER RELOADING PAGE 
    """
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='chat_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chat_session"
        unique_together = ('student', 'lecture') # One active session per student per lecture

    def __str__(self):
        return f"Session: {self.student.email} - {self.lecture.topic}"

class ChatMessage(models.Model):
    """
    Individual messages within a ChatSession.
    
    """
    SENDER_CHOICES = (
        ('user', 'User'),
        ('ai', 'AI'),
    )
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_message"
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender} at {self.timestamp}"
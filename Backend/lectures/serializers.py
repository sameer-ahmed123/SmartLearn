from rest_framework import serializers
from .models import Lecture

class LectureSerializer(serializers.ModelSerializer):
    # Shows the email of the creator instead of just an ID
    generated_by_email = serializers.ReadOnlyField(source='generated_by.email')
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'video_url', 'summary_text', 
            'validation_status', 'rejection_comment', 
            'generated_by', 'generated_by_email', 'created_at'
        ]
        read_only_fields = ('generated_by', 'validation_status', 'rejection_comment')
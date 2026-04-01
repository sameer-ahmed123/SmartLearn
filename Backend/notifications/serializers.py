from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    target_type = serializers.SerializerMethodField()
    target_id = serializers.IntegerField(source='object_id')
    class Meta:
        model = Notification
        fields = ['id', 'verb', 'is_read', 'created_at', 'target_type', 'target_id']
        
    def get_target_type(self,obj):
        # This returns the model name (e.g., 'lecture', 'quiz') 
        # so React knows which route to use
        return obj.content_type.model
        
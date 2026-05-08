from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    target_type = serializers.SerializerMethodField()
    target_id = serializers.IntegerField(source='object_id')
    lecture_id = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = ['id', 'verb', 'is_read', 'created_at', 'target_type', 'target_id','lecture_id']
        
    def get_target_type(self,obj):
        # This returns the model name (e.g., 'lecture', 'quiz') 
        # so React knows which route to use
        return obj.content_type.model
        
    def get_lecture_id(self,obj):
        rel_obj = obj.target
        
        if not rel_obj:
            return None
        
        if obj.content_type.model == 'lecture':
            return rel_obj.id
        
        if hasattr(rel_obj,'lecture'):
            return rel_obj.lecture.id   
        
        return None
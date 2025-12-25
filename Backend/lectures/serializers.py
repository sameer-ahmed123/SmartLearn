from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Lecture,Course,ContentSource
from users.serializers import UserSerializer

User = get_user_model()

class TeacherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','full_name','email']
        
class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherDetailSerializer(read_only=True)
    content_source_count = serializers.SerializerMethodField()
    lecture_count = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = [
            'id','teacher','title','description','status','created_at','lecture_count','content_source_count'
        ]
        read_only_fields = ['teacher','created_at']
        
    def get_content_source_count(self,obj):
        return obj.content_sources.count()
    
    def get_lecture_count(self,obj):
        # We need to traverse from Course -> ContentSource -> Lecture
        # A more performant way is to annotate the queryset in the view
        # but this simple method works for now.
        return Lecture.objects.filter(content_source__course=obj).count()
    
class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        # Only allow the user to submit title and description
        fields = ['title', 'description']
        
class ContentSourceBaseSerializer(serializers.ModelSerializer):
    """A minimal serializer for ContentSource, useful for nesting."""
    class Meta:
        model = ContentSource
        fields = ['id', 'ai_prompt', 'created_at']

class LectureSerializer(serializers.ModelSerializer):
    # Shows the email of the creator instead of just an ID
    generated_by_email = serializers.ReadOnlyField(source='generated_by.email')
    content_source = ContentSourceBaseSerializer(read_only=True)
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'video_url', 'summary_text', 
            'validation_status', 'rejection_comment', 
            'generated_by', 'generated_by_email', 'created_at','content_source'
        ]
        read_only_fields = ('generated_by', 'validation_status', 'rejection_comment','content_source')
        
        
# lectures/serializers.py (Add this to the end of the file)

class ContentSourceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentSource
        # Teacher must specify the course, the raw file, and the AI prompt
        fields = ['course', 'raw_file', 'ai_prompt']

class ContentSourceSerializer(serializers.ModelSerializer):
    """Serializer for detailed display of a ContentSource."""
    uploaded_by = TeacherDetailSerializer(read_only=True)
    
    class Meta:
        model = ContentSource
        fields = ['id', 'course', 'uploaded_by', 'raw_file', 'ai_prompt', 'created_at']
        read_only_fields = ['uploaded_by']
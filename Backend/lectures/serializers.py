from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Enrollment, Lecture,Course,ContentSource, LectureProgress
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
        


# -------------------------
# COURSE SERIALIZERS
# -------------------------

class CourseListSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "teacher", "status"]


# -------------------------
# ENROLLMENT SERIALIZERS
# -------------------------

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["course"]

    def validate(self, data):
        student = self.context["request"].user
        course = data["course"]

        if course.status != "published":
            raise serializers.ValidationError("Course is not published.")

        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError("Already enrolled.")

        return data

    def create(self, validated_data):
        return Enrollment.objects.create(
            student=self.context["request"].user,
            course=validated_data["course"]
        )


class EnrollmentListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "course", "enrolled_at"]


# -------------------------
# LECTURE PROGRESS SERIALIZER
# -------------------------

class LectureProgressSerializer(serializers.ModelSerializer):
    lecture_title = serializers.ReadOnlyField(source="lecture.topic")

    class Meta:
        model = LectureProgress
        fields = ["id", "lecture", "lecture_title", "status", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate(self, data):
        student = self.context["request"].user
        lecture = data["lecture"]

        course = lecture.content_source.course

        if not Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError(
                "You must be enrolled in the course to track progress."
            )

        return data
    
    
# lectures/serializers.py (ASSUMED)

class LectureListSerializer(serializers.ModelSerializer):
    # Field to access the source file name
    source_file_name = serializers.CharField(source='content_source.raw_file.name', read_only=True)
    
    # Field to access the course title
    course_title = serializers.CharField(source='content_source.course.title', read_only=True)
    
    # Field to show the teacher's AI prompt for context
    ai_prompt = serializers.CharField(source='content_source.ai_prompt', read_only=True)

    class Meta:
        model = Lecture # Assumed Lecture model
        fields = (
            'id', 
            'topic', 
            'validation_status', # e.g., 'pending', 'validated', 'rejected'
            'created_at', 
            'source_file_name', 
            'course_title',
            'ai_prompt',
        )
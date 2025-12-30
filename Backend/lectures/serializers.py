from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Lecture, Course, ContentSource
from users.serializers import UserSerializer

User = get_user_model()


class TeacherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherDetailSerializer(read_only=True)
    content_source_count = serializers.SerializerMethodField()
    lecture_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'teacher', 'title', 'description', 'status', 'created_at', 'lecture_count', 'content_source_count'
        ]
        read_only_fields = ['teacher', 'created_at']

    def get_content_source_count(self, obj):
        return obj.content_sources.count()

    def get_lecture_count(self, obj):
        return Lecture.objects.filter(content_source__course=obj).count()


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        # Only allow the user to submit title and description
        fields = ['title', 'description']


class CourseBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title']


class ContentSourceBaseSerializer(serializers.ModelSerializer):
    """A minimal serializer for ContentSource, useful for nesting."""
    course = CourseBaseSerializer(read_only=True)

    class Meta:
        model = ContentSource
        fields = ['id', 'ai_prompt', 'created_at', 'course']


class ContentSourceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentSource
        # Teacher must specify the course, the raw file, and the AI prompt
        fields = ['course', 'raw_file', 'ai_prompt']


class ContentSourceSerializer(serializers.ModelSerializer):
    """Serializer for detailed display of a ContentSource."""
    uploaded_by = TeacherDetailSerializer(read_only=True)
    course = CourseBaseSerializer(read_only=True)

    class Meta:
        model = ContentSource
        fields = ['id', 'course', 'uploaded_by',
                  'raw_file', 'ai_prompt', 'created_at', 'course']
        read_only_fields = ['uploaded_by']


class LectureSerializer(serializers.ModelSerializer):
    # Shows the email of the creator instead of just an ID
    generated_by_email = serializers.ReadOnlyField(source='generated_by.email')
    content_source = ContentSourceBaseSerializer(read_only=True)

    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'video_url', 'summary_text',
            'validation_status', 'rejection_comment',
            'generated_by', 'generated_by_email', 'created_at', 'content_source'
        ]
        read_only_fields = ('generated_by', 'validation_status',
                            'rejection_comment', 'content_source')


# LECTURE_DETAIL_SERIALIZER DEDICATED FOR LECTURE REVIEW/STUDY PAGE
class LectureDetailSerializer(serializers.ModelSerializer):
    """
    Provides the full, deep detail view of a Lecture for the Review or Study Page.
    Includes the actual content (video_url, summary) and all related metadata.
    """

    content_source = ContentSourceSerializer(read_only=True)
    validated_by = TeacherDetailSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True)

    class Meta:
        model = Lecture
        fields = [
            'id',
            'topic',
            'video_url',
            'summary_text',
            'validation_status',
            'status_display',
            'rejection_comment',
            'generated_by',
            'validated_by',
            'created_at',
            'content_source',
        ]

        read_only_fields = ('generated_by', 'validated_by',
                            'validation_status', 'created_at')


class LectureQuerySerializer(serializers.ModelSerializer):

    content_source = ContentSourceBaseSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True)
    review_url = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'created_at', 'validation_status', 'status_display',
            'content_source', 'review_url'
        ]

    def get_review_url(self, obj):
        return f"/teacher/lecture/{obj.id}/review"


class LectureValidationActionSerializer(serializers.ModelSerializer):
    """
    Serializer used specifically for updating the validation status 
    of a lecture via a PATCH request.
    """
    class Meta:
        model = Lecture
        fields = ['validation_status', 'rejection_comment']
        read_only_fields = ['id', 'topic', 'video_url',
                            'summary_text', 'content_source']

    def validate(self, data):
        """
        Custom validation rule: Rejection requires a comment.
        """
        status = data.get('validation_status')
        comment = data.get('rejection_comment')

        if status == 'rejected' and not comment:
            raise serializers.ValidationError({
                "rejection_comment": "Rejection requires a comment explaining the reason for failure."
            })

        if status != 'rejected' and comment:
            data['rejection_comment'] = None

        return data


class CourseLectureListItem(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True)
    course_topic = serializers.CharField(
        source='content_source.course.title', read_only=True)
    review_url = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            'id',
            'validation_status',
            'topic',
            'course_topic',
            'created_at',
            'status_display',
            'review_url'
        ]

    def get_review_url(self, obj):
        return f"/teacher/lecture/{obj.id}/review"

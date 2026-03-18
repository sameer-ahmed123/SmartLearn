from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Lecture, Course, ContentSource, Enrollment, LectureProgress

User = get_user_model()

######
# HELPER SERIALIZERS
######

class TeacherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']


######
# SERIALIZERS RELATED TO COURSE MODEL
######

class CourseBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title']


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        # Only allow the user to submit title and description
        fields = ['title', 'description']


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherDetailSerializer(read_only=True)
    # ADDED: teacher_name for frontend display
    teacher_name = serializers.ReadOnlyField(source='teacher.full_name')
    content_source_count = serializers.SerializerMethodField()
    lecture_count = serializers.SerializerMethodField()

    is_enrolled = serializers.SerializerMethodField()  # Student check ke liye
    enrolled_count = serializers.SerializerMethodField()  # <--- NEW FIELD ADDED
    completion_percentage = serializers.SerializerMethodField() # <--- REAL DATA FOR BARS


    class Meta:
        model = Course
        fields = [
            'id', 'teacher', 'teacher_name', 'title', 'description', 
            'thumbnail', 'status', 'created_at', 'lecture_count', 
            'content_source_count', 'is_enrolled', 'enrolled_count',
            'completion_percentage' 
        ]
        read_only_fields = ['teacher', 'created_at']

    def get_completion_percentage(self, obj):
        """
        Calculates real-time percentage based on validated lectures vs total content sources.
        """
        total_sources = obj.content_sources.count()
        if total_sources == 0:
            return 0
        
        # Sirf wo lectures count karein jo 'validated' hain
        validated_lectures = Lecture.objects.filter(
            content_source__course=obj, 
            validation_status='validated'
        ).count()
        
        return int((validated_lectures / total_sources) * 100)

    def get_enrolled_count(self, obj): 
        return Enrollment.objects.filter(course=obj).count()

    def get_content_source_count(self, obj):
        return obj.content_sources.count()

    def get_lecture_count(self, obj):
        return Lecture.objects.filter(content_source__course=obj).count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if student is enrolled
            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False


######
# SERIALIZERS RELATED TO CONTENT SOURCE MODEL
######

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
                  'raw_file', 'ai_prompt', 'created_at']
        read_only_fields = ['uploaded_by']


######
# SERIALIZERS RELATED TO LECTURES MODEL
######
class LectureSerializer(serializers.ModelSerializer):
    # Shows the email of the creator instead of just an ID
    generated_by_email = serializers.ReadOnlyField(source='generated_by.email')
    content_source = ContentSourceBaseSerializer(read_only=True)

    # 1. Define the dynamic fields explicitly
    quiz_data = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()
    assignment_data = serializers.SerializerMethodField()
    assignment_id = serializers.SerializerMethodField()
    review_progress = serializers.SerializerMethodField() # Changed to MethodField

    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'video_url', 'summary_text',
            'validation_status', 'rejection_comment',
            'generated_by', 'generated_by_email', 'created_at', 'content_source',
            'quiz_data', 'quiz_id',                 # <-- Included Quiz fields
            'assignment_data', 'assignment_id',     # <-- Included Assignment fields
            'review_progress',                      # <-- Now Dynamic
        ]
        read_only_fields = ('generated_by', 'validation_status',
                            'rejection_comment', 'content_source')

    def get_review_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = LectureProgress.objects.filter(user=request.user, lecture=obj).first()
            return progress.progress_percentage if progress else 0
        return 0

    # 2. Quiz Logic
    def get_quiz_data(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.quiz_data
        return None

    def get_quiz_id(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.id
        return None

    # 3. Assignment Logic
    def get_assignment_data(self, obj):
        if hasattr(obj, 'assignment'):
            return obj.assignment.assignment_data
        return None

    def get_assignment_id(self, obj):
        if hasattr(obj, 'assignment'):
            return obj.assignment.id
        return None


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
    review_progress = serializers.SerializerMethodField() # Changed to MethodField

    class Meta:
        model = Lecture
        fields = [
            'id',
            'topic',
            'video_url',
            'video_status',
            'summary_text',
            'validation_status',
            'status_display',
            'rejection_comment',
            'generated_by',
            'validated_by',
            'created_at',
            'content_source',
            'review_progress', # <-- Dynamic progress
        ]

        read_only_fields = ('generated_by', 'validated_by',
                            'validation_status', 'created_at')

    def get_review_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = LectureProgress.objects.filter(user=request.user, lecture=obj).first()
            return progress.progress_percentage if progress else 0
        return 0


class LectureQuerySerializer(serializers.ModelSerializer):

    content_source = ContentSourceBaseSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True)
    review_url = serializers.SerializerMethodField()
    review_progress = serializers.SerializerMethodField() # Changed to MethodField

    class Meta:
        model = Lecture
        fields = [
            'id', 'topic', 'created_at', 'validation_status', 'status_display',
            'content_source', 'review_url', 'review_progress' # <-- Added review_progress
        ]

    def get_review_url(self, obj):
        return f"/teacher/lecture/{obj.id}/review"

    def get_review_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = LectureProgress.objects.filter(user=request.user, lecture=obj).first()
            return progress.progress_percentage if progress else 0
        return 0


class LectureValidationActionSerializer(serializers.ModelSerializer):
    """
    Serializer used specifically for updating the validation status 
    of a lecture via a PATCH request.
    """
    class Meta:
        model = Lecture
        fields = ['validation_status', 'rejection_comment',
                  'video_url', 'video_status'] # review_progress removed from fields as it's handled in view
        read_only_fields = ['id', 'topic', 'video_url', 'video_status',
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
    """
    Serializer specifically used to list Lectures related to a specifc Course 
    """
    status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True)
    course_topic = serializers.CharField(
        source='content_source.course.title', read_only=True)
    review_url = serializers.SerializerMethodField()
    quiz_data = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()
    assignment_data = serializers.SerializerMethodField()
    assignment_id = serializers.SerializerMethodField()
    review_progress = serializers.SerializerMethodField() # Changed to MethodField
    
    quiz_status = serializers.CharField(source='quiz.status', read_only=True)
    assignment_status = serializers.CharField(source='assignment.status', read_only=True)

    class Meta:
        model = Lecture
        fields = [
            'id',
            'validation_status',
            'topic',
            'course_topic',
            'created_at',
            'status_display',
            'review_url',
            'quiz_data',
            'quiz_id',
            'quiz_status',
            'assignment_data',
            'assignment_id',
            'assignment_status',
            'video_status',
            'video_url',
            'review_progress', # <-- Dynamic Progress
        ]

    def get_review_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = LectureProgress.objects.filter(user=request.user, lecture=obj).first()
            return progress.progress_percentage if progress else 0
        return 0

    def get_quiz_data(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.quiz_data
        return None

    def get_quiz_id(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.id
        return None

    def get_review_url(self, obj):
        # Yahan hum check kar sakte hain ke request student ki taraf se hai ya teacher ki
        request = self.context.get('request')
        if request and hasattr(request.user, 'role') and request.user.role == 'student':
            return f"/student/lecture/{obj.id}/review"
        return f"/teacher/lecture/{obj.id}/review"

    def get_assignment_data(self, obj):
        if hasattr(obj, 'assignment'):
            return obj.assignment.assignment_data
        return None

    def get_assignment_id(self, obj):
        if hasattr(obj, 'assignment'):
            return obj.assignment.id
        return None

######
# SERIALIZERS RELATED TO ENROLLMENT (NEW)
######


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at']
        read_only_fields = ['enrolled_at']

    def validate(self, data):
        user = self.context['request'].user
        if Enrollment.objects.filter(student=user, course=data['course']).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this course.")
        return data

######
# NEW ANALYTICS SERIALIZERS
######

class StudentAnalyticsLectureSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = ['id', 'topic', 'progress']

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            prog = LectureProgress.objects.filter(user=request.user, lecture=obj).first()
            return prog.progress_percentage if prog else 0
        return 0

class StudentAnalyticsCourseSerializer(serializers.ModelSerializer):
    watch = serializers.SerializerMethodField()
    lectures = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'watch', 'lectures']

    def get_watch(self, obj):
        # Overall course progress percentage
        total = obj.content_sources.count()
        if total == 0: return 0
        validated = Lecture.objects.filter(content_source__course=obj, validation_status='validated').count()
        return int((validated / total) * 100)

    def get_lectures(self, obj):
        # List of lectures with their individual progress for the student
        lectures = Lecture.objects.filter(content_source__course=obj, validation_status='validated')
        return StudentAnalyticsLectureSerializer(lectures, many=True, context=self.context).data
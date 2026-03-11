from rest_framework import serializers
from .models import Quiz, QuizSubmission, Assignment, AssignmentSubmission

class QuizSerializer(serializers.ModelSerializer):
    # Student portal cards ke liye extra fields
    course_name = serializers.CharField(source='lecture.content_source.course.title', read_only=True)
    lecture_title = serializers.CharField(source='lecture.topic', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = '__all__'

    def get_questions_count(self, obj):
        if obj.quiz_data:
            # quiz_data list hai to uski length return hogi
            return len(obj.quiz_data)
        return 0

class QuizSubmissionSerializer(serializers.ModelSerializer):
    # --- ADDED: User name logic for Quiz Analytics ---
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = QuizSubmission
        fields = '__all__'
        read_only_fields = ('user', 'score')

    def get_user_name(self, obj):
        # Access the custom full_name field from your User model
        user = obj.user
        if hasattr(user, 'full_name') and user.full_name and user.full_name.strip():
            return user.full_name
        # Fallback logic to show email if name is missing
        return user.email

class AssignmentSerializer(serializers.ModelSerializer):
    # Assignment cards ke liye course ka naam
    course_name = serializers.CharField(source='lecture.content_source.course.title', read_only=True)
    lecture_title = serializers.CharField(source='lecture.topic', read_only=True)
    
    # --- Frontend Navigation Fix ---
    lecture_id = serializers.IntegerField(source='lecture.id', read_only=True)
    submission_count = serializers.SerializerMethodField()
    
    # --- DATE FIX: Manual formatting taake 10 tarik 11 na bane ---
    deadline = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S", required=False, allow_null=True)

    class Meta:
        model = Assignment
        fields = '__all__'

    def get_questions_count(self, obj):
        if obj.quiz_data:
            return len(obj.quiz_data)
        return 0

    def get_submission_count(self, obj):
        # Teacher portal stats ke liye total submissions count
        return AssignmentSubmission.objects.filter(assignment=obj).count()

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    # --- UPDATED: Agar full name empty hai to username dikhayega ---
    student_name = serializers.SerializerMethodField()
    
    # --- FALLBACK FIELDS ---
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    # Frontend compatibility ke liye fields
    is_graded = serializers.SerializerMethodField()
    grade = serializers.FloatField(source='score', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        # Teacher ke feedback/score ko read_only rakha hai taake student edit na kar sake
        read_only_fields = ('user', 'submitted_at', 'score', 'feedback')

    def get_student_name(self, obj):
        # Access the custom full_name field from your User model
        user = obj.user
        if user.full_name and user.full_name.strip():
            return user.full_name
        # Fallback to email if full_name is empty
        return user.email

    def get_is_graded(self, obj):
        # Agar score null nahi hai to matlab grade ho chuki hai
        return obj.score is not None
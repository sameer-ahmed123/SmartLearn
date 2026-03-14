from rest_framework import serializers
from .models import Quiz, QuizSubmission, Assignment, AssignmentSubmission

class QuizSerializer(serializers.ModelSerializer):
    # Student portal cards ke liye extra fields
    course_name = serializers.CharField(source='lecture.content_source.course.title', read_only=True)
    lecture_title = serializers.CharField(source='lecture.topic', read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    # --- ADDED: Student ka score fetch karne ke liye field ---
    user_score = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = '__all__'

    def get_questions_count(self, obj):
        if obj.quiz_data:
            # Agar quiz_data dictionary hai jisme 'questions' key hai
            if isinstance(obj.quiz_data, dict) and 'questions' in obj.quiz_data:
                return len(obj.quiz_data['questions'])
            # Agar quiz_data direct list hai
            elif isinstance(obj.quiz_data, list):
                return len(obj.quiz_data)
        return 0

    def get_user_score(self, obj):
        # Request se current student nikalna
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # QuizSubmission se is quiz ka score uthana
            submission = QuizSubmission.objects.filter(user=request.user, quiz=obj).first()
            if submission:
                return submission.score
        return None

class QuizSubmissionSerializer(serializers.ModelSerializer):
    # --- ADDED: User name logic for Quiz Analytics ---
    user_name = serializers.SerializerMethodField()
    # Explicitly handling score to ensure it's passed as float/number
    score = serializers.FloatField(read_only=True)

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
            if isinstance(obj.quiz_data, dict) and 'questions' in obj.quiz_data:
                return len(obj.quiz_data['questions'])
            elif isinstance(obj.quiz_data, list):
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
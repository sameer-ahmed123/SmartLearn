import os
import google.generativeai as genai
from dotenv import load_dotenv  # Added to load .env variables
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, ContentSource, Lecture, Enrollment, LectureProgress
from .serializers import (
    ContentSourceSerializer, ContentSourceCreateSerializer, CourseLectureListItem,
    # EnrollmentSerializer add kiya
    CourseSerializer, CourseCreateSerializer, EnrollmentSerializer,
    LectureDetailSerializer, LectureQuerySerializer, LectureValidationActionSerializer,
    StudentAnalyticsCourseSerializer  # Added for analytics
)
from users.permissions import CanViewLecture, IsCourseOwner, IsTeacher
from rest_framework.permissions import IsAuthenticated
from .tasks import generate_lecture_from_source
from lectures.services import ProgressService, AnalyticsService
from .models import GroupMessage

# Load environment variables from .env
load_dotenv()

# Gemini Configuration
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)


# -----------------------------------------------------------
# NEW: Dashboard Metrics for Teacher
# -----------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_dashboard_metrics(request):
    """
    Provides top-level stats for the teacher dashboard.
    """
    user = request.user
    courses = Course.objects.filter(teacher=user)
    lectures = Lecture.objects.filter(content_source__course__teacher=user)

    data = {
        "total_courses": courses.count(),
        "total_lectures_generated": lectures.count(),
        "pending_validation_count": lectures.filter(validation_status='pending').count(),
        "total_validated_lectures": lectures.filter(validation_status='validated').count(),
    }
    return Response(data)


# -----------------------------------------------------------
# NEW FBV 1: COURSE - GET (List) and POST (Create/Enroll)
# -----------------------------------------------------------


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Relaxed to allow Students to enter
def course_list_create(request):
    """
    Handles listing all courses and either creation (Teacher) or enrollment (Student).
    """
    user = request.user

    # --- GET (List) ---
    if request.method == 'GET':
        if user.role == "teacher":
            # Teacher sees their own courses
            queryset = Course.objects.filter(
                teacher=user).order_by('-created_at')
        else:
            # Student sees only published courses
            queryset = Course.objects.filter(
                status='published').order_by('-created_at')

        serializer = CourseSerializer(
            queryset, many=True, context={'request': request})
        return Response(serializer.data)

    # --- POST (Create or Enroll) ---
    elif request.method == 'POST':
        # logic for STUDENT ENROLLMENT
        if user.role == "student" and 'course' in request.data:
            serializer = EnrollmentSerializer(
                data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(student=user)
                return Response({"detail": "Successfully enrolled!"}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # logic for TEACHER COURSE CREATION
        elif user.role == "teacher":
            serializer = CourseCreateSerializer(data=request.data)
            if serializer.is_valid():
                instance = serializer.save(teacher=user)
                # Returns full CourseSerializer data as before for frontend
                return Response(CourseSerializer(instance, context={'request': request}).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Not authorized for this action."}, status=status.HTTP_403_FORBIDDEN)


# -----------------------------------------------------------
# NEW: Teacher Specific Course List (For Dashboard Sidebar/Dropdowns)
# -----------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_courses_list(request):
    """
    Returns only the courses owned by the authenticated teacher.
    """
    courses = Course.objects.filter(
        teacher=request.user).order_by('-created_at')
    serializer = CourseSerializer(
        courses, many=True, context={'request': request})
    return Response(serializer.data)


# -----------------------------------------------------------
# NEW FBV 2: COURSE - GET (Detail), PUT/PATCH (Update), DELETE (Destroy)
# -----------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
# Teacher only permission hata di taake student GET kar sakay
@permission_classes([IsAuthenticated])
def course_detail_actions(request, pk):
    """
    Handles detail, update, and deletion of a specific Course.
    """
    user = request.user

    # Check if course exists first
    course = get_object_or_404(Course, pk=pk)

    # --- GET (Detail) ---
    if request.method == 'GET':
        # Permission Logic:
        # 1. Agar Teacher hai, to uska apna course hona chahiye
        # 2. Agar Student hai, to uska ENROLLED hona zaroori hai
        if user.role == "teacher" and course.teacher == user:
            serializer = CourseSerializer(course, context={'request': request})
            return Response(serializer.data)

        elif user.role == "student":
            is_enrolled = Enrollment.objects.filter(
                course=course, student=user).exists()
            if is_enrolled:
                serializer = CourseSerializer(
                    course, context={'request': request})
                return Response(serializer.data)

        return Response({"detail": "You do not have permission to view this course detail."}, status=status.HTTP_403_FORBIDDEN)

    # --- PUT/PATCH/DELETE (Sirf Teacher ke liye) ---
    if user.role != "teacher" or course.teacher != user:
        return Response({"detail": "Only the course owner can modify or delete this course."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ['PUT', 'PATCH']:
        serializer = CourseSerializer(
            course,
            data=request.data,
            partial=(request.method == 'PATCH'),
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# -----------------------------------------------------------
# FBV 3: ContentSource List/Create
# -----------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsTeacher])
def content_source_list_create(request):
    user = request.user

    if request.method == 'GET':
        queryset = ContentSource.objects.filter(
            course__teacher=user
        ).order_by('-created_at')
        serializer = ContentSourceSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ContentSourceCreateSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data.get('course').id
            try:
                course = Course.objects.get(id=course_id, teacher=user)
            except Course.DoesNotExist:
                return Response(
                    {"detail": "The specified course does not exist or you do not own it."},
                    status=status.HTTP_403_FORBIDDEN
                )

            instance = serializer.save(uploaded_by=user)
            generate_lecture_from_source.delay(instance.id)

            return Response(
                {
                    "id": instance.id,
                    "course_id": instance.course_id,
                    "message": "Content uploaded successfully. AI lecture generation is starting in the background.",
                    "status_check_url": f"/api/v1/lectures/content-sources/{instance.id}/"
                },
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------------------------------------
# FBV 4: ContentSource Detail Actions
# -----------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsTeacher])
def content_source_detail_actions(request, pk):
    content_source = get_object_or_404(
        ContentSource,
        pk=pk,
        course__teacher=request.user
    )

    if request.method == 'GET':
        serializer = ContentSourceSerializer(content_source)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = ContentSourceCreateSerializer(
            content_source,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(ContentSourceSerializer(content_source).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        content_source.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def lecture_validation_queue(request):
    user = request.user
    queryset = Lecture.objects.filter(
        generated_by=user,
        validation_status='pending',
        content_source__course__status="published"
    ).select_related(
        'content_source',
        'content_source__course'
    ).with_user_review_progress(user).order_by('created_at')

    serializer = LectureQuerySerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET", "DELETE"])  # ADDED DELETE METHOD HERE
@permission_classes([IsAuthenticated, CanViewLecture])
def lecture_detail(request, id):
    lecture = get_object_or_404(
        Lecture.objects.select_related(
            'content_source',
            'content_source__course'
        ).with_user_review_progress(request.user),
        id=id)

    if request.method == 'GET':
        serializer = LectureDetailSerializer(
            lecture, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'DELETE':
        # Ensure only the course owner (teacher) can delete the lecture
        if request.user.role == "teacher" and lecture.content_source.course.teacher == request.user:
            lecture.delete()
            return Response({"detail": "Lecture deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Only the course owner can delete this lecture."}, status=status.HTTP_403_FORBIDDEN)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, CanViewLecture])
def lecture_validate_action(request, id):
    lecture = get_object_or_404(Lecture, id=id)
    user = request.user

    # handle the progress tracking with hepl of service
    if 'review_progress' in request.data:

        progress_val = int(request.data.get('review_progress'))
        progress_obj = ProgressService.update_lecture_progress(
            request.user, lecture, progress_val)
        return Response(
            {"review_progress": progress_obj.progress_percentage},
            status=status.HTTP_200_OK
        )

    # prevent un-authorized validation
    if not (user.role == 'teacher' and lecture.content_source.course.teacher == user):
        return Response({"detail": "Only the teacher can validate this lecture."}, status=status.HTTP_403_FORBIDDEN)

    # Use a Service to validate lecture & trigger video generation
    serializer = LectureValidationActionSerializer(
        lecture, data=request.data, partial=True)
    if serializer.is_valid():
        updated_lecture = ProgressService.process_lecture_validation(
            user, serializer)
        return Response(LectureValidationActionSerializer(updated_lecture).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCourseOwner])
def course_lecture_list(request, course_id):
    # Filter for all lectures belonging to the course (including pending ones)
    lecture_list = Lecture.objects.filter(
        content_source__course__id=course_id
    ).select_related(
        'content_source',
        'content_source__course',
        'quiz',
        'assignment'
    ).with_user_review_progress(request.user).order_by('created_at')

    serializer = CourseLectureListItem(
        lecture_list, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------------------------------------
# NEW: Student Analytics Data (Progress Tracker Box)
# -----------------------------------------------------------
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def student_analytics_data(request):
#     user = request.user
#     if user.role != 'student':
#         return Response({"detail": "Only students can view these analytics."}, status=status.HTTP_403_FORBIDDEN)

#     # All the math and serialization happens inside the service
#     data = AnalyticsService.get_student_dashboard_data(
#         user=user,
#         request_context={'request': request}
#     )

#     return Response(data, status=status.HTTP_200_OK)


from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from lectures.models import Course, Lecture
from assessment.models import Quiz, Assignment

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    try:
        query = request.query_params.get('q', '').strip()
        results = []

        if len(query) < 2:
            return Response([])

        # Role-based path prefix decide karein (student ya teacher)
        role_path = 'student' if request.user.role == 'student' else 'teacher'

        # 1. Search Courses - URL FIXED to match App.tsx
        courses = Course.objects.filter(title__icontains=query)[:5]
        for c in courses:
            results.append({
                'id': c.id, 
                'title': c.title, 
                'type': 'course', 
                # App.tsx route: /student/course/:courseid OR /teacher/course/:courseid
                'url': f'/{role_path}/course/{c.id}' 
            })

        # 2. Search Lectures - URL FIXED
        lectures = Lecture.objects.filter(topic__icontains=query, validation_status='validated')[:5]
        for l in lectures:
            results.append({
                'id': l.id, 
                'title': l.topic, 
                'type': 'lecture', 
                # App.tsx route: /student/lecture/:id/review OR /teacher/lecture/:id/review
                'url': f'/{role_path}/lecture/{l.id}/review'
            })

        # 3. Search Quizzes
        quizzes = Quiz.objects.filter(lecture__topic__icontains=query)[:5]
        for q in quizzes:
            results.append({
                'id': q.id, 
                'title': f"Quiz: {q.lecture.topic}", 
                'type': 'quiz', 
                # App.tsx route: /student/lecture/:id/quiz OR /teacher/lecture/:id/quiz
                'url': f'/{role_path}/lecture/{q.lecture.id}/quiz'
            })

        # 4. Search Assignments
        assignments = Assignment.objects.filter(lecture__topic__icontains=query)[:5]
        for a in assignments:
            results.append({
                'id': a.id, 
                'title': f"Assignment: {a.lecture.topic}", 
                'type': 'assignment', 
                # App.tsx route: /student/lecture/:id/assignment OR /teacher/lecture/:id/assignment
                'url': f'/{role_path}/lecture/{a.lecture.id}/assignment'
            })

        # 5. Search Users
        users = User.objects.filter(full_name__icontains=query)[:5]
        for u in users:
            # Profile ke liye agar koi specific route nahi hai to dashboard par bhej sakte hain
            # Ya agar aapne profile page banaya hai to uska path yahan likhein
            results.append({
                'id': u.id, 
                'title': u.full_name, 
                'type': u.role, 
                'url': f'/{role_path}/dashboard' 
            })

        return Response(results)

    except Exception as e:
        print(f"SEARCH ERROR: {str(e)}")
        return Response({"detail": "Error performing search"}, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q  
from .models import StudyConnection, Course, Enrollment
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. Same course ke students dhoondna (Find Peers Tab ke liye)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_same_course_students(request):
    try:
        user_enrollments = request.user.course_enrollments.all()
        user_course_ids = user_enrollments.values_list('course_id', flat=True)
        
        if not user_course_ids:
            return Response([])

        students = User.objects.filter(
            course_enrollments__course_id__in=user_course_ids,
            role='student'
        ).exclude(id=request.user.id).distinct()

        data = []
        for s in students:
            # Connection dhoonden
            connection = StudyConnection.objects.filter(
                (Q(sender=request.user) & Q(receiver=s)) | 
                (Q(sender=s) & Q(receiver=request.user))
            ).first()
            
            status = "none"
            connection_id = None
            
            if connection:
                connection_id = connection.id
                if connection.status == 'accepted':
                    status = 'accepted'
                elif connection.status == 'pending':
                    # Yahan asli logic hai: Check karein sender kaun hai
                    if connection.sender == request.user:
                        status = 'pending_outgoing' # Aapne bheji hai
                    else:
                        status = 'pending_incoming' # Usne bheji hai (Aapko accept karni hai)

            data.append({
                "id": s.id,
                "full_name": s.full_name,
                "connection_status": status,
                "connection_id": connection_id
            })
        
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 2. Connection Request bhejna
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_study_request(request, receiver_id):
    receiver = get_object_or_404(User, id=receiver_id)
    
    if receiver == request.user:
        return Response({"detail": "You cannot add yourself"}, status=400)

    connection, created = StudyConnection.objects.get_or_create(
        sender=request.user, 
        receiver=receiver
    )
    if not created:
        return Response({"detail": "Request already sent"}, status=400)
    return Response({"detail": "Request sent successfully"})

# 3. Accepted Connections ki list (Members Tab ke liye)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_connections(request):
    connections = StudyConnection.objects.filter(
        (Q(sender=request.user) | Q(receiver=request.user)),
        status='accepted'
    )
    
    data = []
    for c in connections:
        friend = c.receiver if c.sender == request.user else c.sender
        data.append({
            "id": c.id,
            "friend_id": friend.id,
            "name": friend.full_name,
            "avatar": friend.full_name[0] if friend.full_name else "?"
        })
    return Response(data)

# 4. Request Accept ya Reject karna
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_request_action(request, connection_id):
    action = request.data.get('action')
    # Request sirf wo accept/reject kar sakta hai jo 'receiver' hai
    connection = get_object_or_404(StudyConnection, id=connection_id, receiver=request.user)
    
    if action == 'accept':
        connection.status = 'accepted'
        connection.save()
        return Response({"detail": "Request accepted"})
    elif action == 'reject':
        connection.status = 'rejected'
        connection.save()
        return Response({"detail": "Request rejected"})
    
    return Response({"detail": "Invalid action"}, status=400)

# 5. Purana accept logic (agar aap handle_request_action use nahi kar rahe)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_study_request(request, request_id):
    connection = get_object_or_404(StudyConnection, id=request_id, receiver=request.user)
    connection.status = 'accepted'
    connection.save()
    return Response({"detail": "Request accepted"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_messages(request, room_id):
    messages = GroupMessage.objects.filter(room_id=room_id).order_by('timestamp')
    data = [{
        "sender": m.sender.full_name,
        "content": m.content,
        "timestamp": m.timestamp
    } for m in messages]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_calendar_lectures(request):
    user = request.user
    # Teacher ke wahi lectures nikalenge jo unho ne khud create kiye hain
    lectures = Lecture.objects.filter(content_source__course__teacher=user)
    
    events = []
    for l in lectures:
        events.append({
            "id": l.id,
            "title": f"Lecture: {l.topic}",
            "created_date": l.created_at.date().isoformat(), # Format: YYYY-MM-DD
            "course": l.content_source.course.title,
            "type": "lecture"
        })
    return Response({"events": events}, status=200)
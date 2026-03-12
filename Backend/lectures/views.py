import os
import google.generativeai as genai
from dotenv import load_dotenv  # Added to load .env variables
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes  
from rest_framework.response import Response
from django.shortcuts import get_object_or_404  
from .models import Course, ContentSource, Lecture, Enrollment # Enrollment add kiya
from .serializers import (
    ContentSourceSerializer, ContentSourceCreateSerializer, CourseLectureListItem,
    CourseSerializer, CourseCreateSerializer, EnrollmentSerializer, # EnrollmentSerializer add kiya
    LectureDetailSerializer, LectureQuerySerializer, LectureValidationActionSerializer
)
from users.permissions import CanViewLecture, IsCourseOwner, IsTeacher
from rest_framework.permissions import IsAuthenticated
from .tasks import generate_lecture_from_source

# Load environment variables from .env
load_dotenv()

# Gemini Configuration
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# -----------------------------------------------------------
# NEW FBV 1: COURSE - GET (List) and POST (Create/Enroll)
# -----------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) # Relaxed to allow Students to enter
def course_list_create(request):
    """
    Handles listing all courses and either creation (Teacher) or enrollment (Student).
    """
    user = request.user

    # --- GET (List) ---
    if request.method == 'GET':
        if user.role == "teacher":
            # Teacher sees their own courses
            queryset = Course.objects.filter(teacher=user).order_by('-created_at')
        else:
            # Student sees only published courses
            queryset = Course.objects.filter(status='published').order_by('-created_at')
            
        serializer = CourseSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    # --- POST (Create or Enroll) ---
    elif request.method == 'POST':
        # logic for STUDENT ENROLLMENT
        if user.role == "student" and 'course' in request.data:
            serializer = EnrollmentSerializer(data=request.data, context={'request': request})
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
    courses = Course.objects.filter(teacher=request.user).order_by('-created_at')
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


# -----------------------------------------------------------
# NEW FBV 2: COURSE - GET (Detail), PUT/PATCH (Update), DELETE (Destroy)
# -----------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated]) # Teacher only permission hata di taake student GET kar sakay
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
            is_enrolled = Enrollment.objects.filter(course=course, student=user).exists()
            if is_enrolled:
                serializer = CourseSerializer(course, context={'request': request})
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
    ).order_by('created_at')

    serializer = LectureQuerySerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET", "DELETE"])  # ADDED DELETE METHOD HERE
@permission_classes([IsAuthenticated, CanViewLecture])
def lecture_detail(request, id):
    lecture = get_object_or_404(
        Lecture.objects.select_related(
            'content_source',
            'content_source__course'
        ),
        id=id)
    
    if request.method == 'GET':
        serializer = LectureDetailSerializer(lecture)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        # Ensure only the course owner (teacher) can delete the lecture
        if request.user.role == "teacher" and lecture.content_source.course.teacher == request.user:
            lecture.delete()
            return Response({"detail": "Lecture deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Only the course owner can delete this lecture."}, status=status.HTTP_403_FORBIDDEN)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsCourseOwner])
def lecture_validate_action(request, id):
    lecture = get_object_or_404(Lecture, id=id)
    if lecture.validation_status != 'pending':
        return Response(
            {"detail": f"Lecture status is already '{lecture.validation_status}'..."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = LectureValidationActionSerializer(
        lecture,
        data=request.data,
        partial=True
    )
    if serializer.is_valid():
        serializer.save(validated_by=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCourseOwner])
def course_lecture_list(request, course_id):
    lecture_list = Lecture.objects.filter(content_source__course__id=course_id).select_related(
        'content_source', 'content_source__course', 'quiz','assignment')
    
    # Custom response to include necessary fields for the table
    data = []
    for lecture in lecture_list:
        data.append({
            "id": lecture.id,
            "topic": lecture.topic,
            "created_at": lecture.created_at,
            "validation_status": lecture.validation_status,
            "status_display": lecture.get_validation_status_display(),
            "review_url": f"/dashboard/teacher/lectures/{lecture.id}/review",
            "quiz_id": lecture.quiz.id if hasattr(lecture, 'quiz') and lecture.quiz else None,
            "assignment_id": lecture.assignment.id if hasattr(lecture, 'assignment') and lecture.assignment else None,
        })
    
    return Response(data, status=status.HTTP_200_OK)

# --- RE-FIXED CHATBOT: Final Stability Logic ---
@api_view(['POST'])
@permission_classes([IsAuthenticated, CanViewLecture])
def lecture_chat(request, id):
    lecture = get_object_or_404(Lecture, id=id)
    user_query = request.data.get('message')

    if not user_query:
        return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return Response({"detail": "Gemini API Key missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        genai.configure(api_key=api_key)
        
        # 404 Error se bachne ke liye available models list karna
        available_model_names = [m.name for m in genai.list_models()]
        
        # Priority check
        if 'models/gemini-1.5-flash-latest' in available_model_names:
            selected_model = 'gemini-1.5-flash-latest'
        elif 'models/gemini-1.5-flash' in available_model_names:
            selected_model = 'gemini-1.5-flash'
        elif 'models/gemini-pro' in available_model_names:
            selected_model = 'gemini-pro'
        else:
            selected_model = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods][0]

        model = genai.GenerativeModel(selected_model)
        
        lecture_context = lecture.summary_text if lecture.summary_text else "No summary available."
        prompt = (
            f"You are a helpful AI tutor for this course lecture: {lecture.topic}.\n"
            f"Context: {lecture_context}\n\n"
            f"Student Question: {user_query}\n"
            f"Please answer precisely based on the context above."
        )
        
        response = model.generate_content(prompt)
        return Response({"text": response.text}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"AI ERROR: {str(e)}")
        return Response({"detail": f"AI Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
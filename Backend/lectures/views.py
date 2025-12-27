from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes # NEW IMPORTS
from rest_framework.response import Response
from django.shortcuts import get_object_or_404 # Useful for retrieving objects
from .models import Course, ContentSource, Enrollment, Lecture, LectureProgress
from .serializers import (
    ContentSourceSerializer, ContentSourceCreateSerializer, CourseListSerializer,
    CourseSerializer, CourseCreateSerializer, 
    ContentSourceSerializer, ContentSourceCreateSerializer, EnrollmentCreateSerializer, EnrollmentListSerializer, LectureListSerializer, LectureProgressSerializer, LectureSerializer
)
from users.permissions import IsStudent, IsTeacher
from .tasks import generate_lecture_from_source


# -----------------------------------------------------------
# NEW FBV 1: COURSE - GET (List) and POST (Create)
# -----------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def course_list_create(request):
    """
    Handles listing all courses created by the teacher and creation of a new course.
    """
    user = request.user
    
    # --- GET (List) ---
    if request.method == 'GET':
        # Filter: Only courses owned by the logged-in teacher
        queryset = Course.objects.filter(teacher=user).order_by('-created_at')
        # Optimize with prefetch/select_related for better performance 
        # (CourseSerializer uses related object counts)
        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)

    # --- POST (Create) ---
    elif request.method == 'POST':
        serializer = CourseCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user as the 'teacher'
            instance = serializer.save(teacher=user)
            return Response(CourseSerializer(instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------------------------------------
# NEW FBV 2: COURSE - GET (Detail), PUT/PATCH (Update), DELETE (Destroy)
# -----------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def course_detail_actions(request, pk):
    """
    Handles detail, update, and deletion of a specific Course.
    """
    # Check ownership and retrieve the object
    course = get_object_or_404(
        Course, 
        pk=pk, 
        teacher=request.user # Ensures the course belongs to the current user
    )

    # --- GET (Detail) ---
    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    # --- PUT / PATCH (Update) ---
    elif request.method in ['PUT', 'PATCH']:
        # Use the CourseCreateSerializer for updates (allows changing title/description/status)
        serializer = CourseCreateSerializer(
            course, 
            data=request.data, 
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(CourseSerializer(course).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- DELETE (Destroy) ---
    elif request.method == 'DELETE':
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# lectures/views.py (Function-Based Views for ContentSource)

# -----------------------------------------------------------
# FBV 3: GET (List) and POST (Create)
# -----------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def content_source_list_create(request):
    """
    Handles listing of all ContentSources belonging to the teacher 
    and the creation (upload) of a new ContentSource.
    """
    
    user = request.user

    # --- GET (List) ---
    if request.method == 'GET':
        # Filter queryset: Only show content sources related to the logged-in teacher's courses
        queryset = ContentSource.objects.filter(
            course__teacher=user
        ).order_by('-created_at')
        
        serializer = ContentSourceSerializer(queryset, many=True)
        return Response(serializer.data)

    # --- POST (Create/Upload) ---
    elif request.method == 'POST':
        # Use the Create Serializer which handles file upload
        serializer = ContentSourceCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # 1. Permission Check: Ensure the specified Course belongs to the teacher
            course_id = serializer.validated_data.get('course').id
            try:
                # We fetch the course instance to ensure ownership
                course = Course.objects.get(id=course_id, teacher=user)
            except Course.DoesNotExist:
                return Response(
                    {"detail": "The specified course does not exist or you do not own it."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 2. Save the ContentSource, automatically setting the uploader
            instance = serializer.save(uploaded_by=user)
            
            # 3. Trigger the AI processing function here
                # the delay hands over the function to Celery
            generate_lecture_from_source.delay(instance.id)
            
            # return 202 Accepted Status to show ==> content accepted and lecture generation started in background
            return Response(
                {
                    "id": instance.id,
                    "course_id": instance.course_id,
                    "message": "Content uploaded successfully. AI lecture generation is starting in the background.",
                    "status_check_url": f"/api/v1/lectures/content-sources/{instance.id}/"
                }, 
                status=status.HTTP_202_ACCEPTED # Key Change: 202 Accepted
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------------------------------------
# FBV 4: GET (Detail), PUT/PATCH (Update), DELETE (Destroy)
# -----------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def content_source_detail_actions(request, pk):
    """
    Handles detail, update, and deletion of a specific ContentSource.
    """
    
    # Check ownership and retrieve the object
    content_source = get_object_or_404(
        ContentSource, 
        pk=pk, 
        course__teacher=request.user # Ensures the content source belongs to the user's course
    )

    # --- GET (Detail) ---
    if request.method == 'GET':
        serializer = ContentSourceSerializer(content_source)
        return Response(serializer.data)

    # --- PUT / PATCH (Update) ---
    elif request.method in ['PUT', 'PATCH']:
        # Use the CreateSerializer for update to allow changing prompt/file
        serializer = ContentSourceCreateSerializer(
            content_source, 
            data=request.data, 
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(ContentSourceSerializer(content_source).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- DELETE (Destroy) ---
    elif request.method == 'DELETE':
        content_source.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


# -----------------------------------------------------------
# FBV 5: LECTURE - GET (List All for Teacher Review)
# -----------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def lecture_list_view(request):
    """
    Handles listing of all generated Lectures belonging to the teacher's courses.
    This list is primarily for review/status checking.
    """
    user = request.user
    
    # Filter queryset: Only show lectures generated from content sources 
    # within the logged-in teacher's courses.
    queryset = Lecture.objects.filter(
        content_source__course__teacher=user
    ).order_by('-created_at')
    
    # Note: Using the LectureListSerializer (assumed/defined above)
    serializer = LectureListSerializer(queryset, many=True)
    return Response(serializer.data)


# -----------------------------------------------------------
# FBV 6: LECTURE - GET/POST/PUT/PATCH (Detail & Validation)
# -----------------------------------------------------------
# You would also need a detail view for review/validation
# e.g., /api/v1/lectures/{pk}/validate/

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated, IsTeacher])
def lecture_detail_and_validate(request, pk):
    """
    Handles detail retrieval and validation/rejection action for a specific Lecture.
    """
    # Check ownership and retrieve the lecture
    lecture = get_object_or_404(
        Lecture, 
        pk=pk, 
        content_source__course__teacher=request.user # Ensures the lecture belongs to the user's course
    )

    # --- GET (Detail) ---
    if request.method == 'GET':
        # Use a detailed serializer for the lecture content
        serializer = LectureSerializer(lecture) # Assuming a LectureSerializer exists
        return Response(serializer.data)

    # --- PUT (Validate/Reject) ---
    elif request.method == 'PUT':
        # This endpoint handles the teacher's decision (Validation or Rejection)
        action = request.data.get('action')
        comment = request.data.get('comment', '') # Only for rejection

        if action == 'validate':
            if lecture.validation_status == 'pending':
                lecture.validation_status = 'validated'
                lecture.save()
                return Response({'detail': 'Lecture validated successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': f'Lecture is already {lecture.validation_status}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif action == 'reject':
            if lecture.validation_status == 'pending':
                lecture.validation_status = 'rejected'
                lecture.rejection_comment = comment # Assumed field
                lecture.save()
                return Response({'detail': 'Lecture rejected successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': f'Lecture is already {lecture.validation_status}.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Invalid action specified.'}, status=status.HTTP_400_BAD_REQUEST)
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from assessment.models import Quiz
from assessment.serialzers import QuizSerializer
from users.permissions import IsCourseOwner
from rest_framework.response import Response
from rest_framework import status
from .tasks import generate_assessment_task
# import your IsCourseOwner permission if available, or use logic below

@api_view(['POST'])
@permission_classes([IsAuthenticated,IsCourseOwner])
def generate_assessment_trigger(request):
    """
    Payload example: { "lecture_id": 123, "type": "quiz" }
    """
    lecture_id = request.data.get('lecture_id')
    assessment_type = request.data.get('type') # 'quiz' or 'assignment'

    if not lecture_id or not assessment_type:
        return Response({"error": "lecture_id and type are required"}, status=status.HTTP_400_BAD_REQUEST)

    
    #start the celery worker
    generate_assessment_task.delay(lecture_id, assessment_type)

    return Response(
        {"message": f"{assessment_type.capitalize()} generation started."}, 
        status=status.HTTP_202_ACCEPTED
    )
    

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def quiz_detail_update(request, quiz_id):
    """
    GET: Retrieve a specific quiz (for the Editor).
    PUT: Update the quiz questions (Save changes from Editor).
    """
    # 1. Fetch Quiz
    quiz = get_object_or_404(Quiz, id=quiz_id)

    # 2. Permission Check (Security)
    # Ensure the user requesting this is the teacher of the course
    if quiz.lecture.content_source.course.teacher != request.user:
        return Response({"error": "You do not have permission to edit this quiz."}, status=403)

    # --- GET REQUEST (Load Editor) ---
    if request.method == 'GET':
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

    # --- PUT REQUEST (Save Changes) ---
    elif request.method == 'PUT':
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
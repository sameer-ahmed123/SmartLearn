from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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
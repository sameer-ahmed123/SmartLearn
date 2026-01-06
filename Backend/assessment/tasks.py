from celery import shared_task # type: ignore
from django.core.exceptions import ObjectDoesNotExist
from lectures.models import Lecture
from .models import Quiz, Assignment # Import both models
from ai_core.services import generate_quiz_json 
# from ai_core.services import generate_assignment_json  #future function
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_assessment_task(lecture_id, assessment_type):
    """
    Unified task for generating assessments.
    assessment_type: 'quiz' | 'assignment'
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
        
        # Validation: We need a script to generate anything
        if not lecture.script:
            logger.error(f"Lecture {lecture_id} has no script. Cannot generate {assessment_type}.")
            return "Failed: No script"

        # --- MODE A: QUIZ GENERATION if assesment_type is quiz---
        if assessment_type == 'quiz':
            logger.info(f"Starting Quiz Generation for Lecture {lecture_id}")
            
            # 1. Call AI Service
            quiz_data = generate_quiz_json(lecture.script, lecture.context)
            
            # 2. Save to Quiz Model
            Quiz.objects.update_or_create(
                lecture=lecture,
                defaults={'quiz_data': quiz_data} 
            )
            return "Quiz Generated Successfully"

        # --- MODE B: ASSIGNMENT GENERATION (Future) if assesment_tyoe is assignment ---
        elif assessment_type == 'assignment':
            # logger.info(f"Starting Assignment Generation...")
            # assignment_data = generate_assignment_json(lecture.script)
            # Assignment.objects.create(...)
            return "Assignment Logic Not Implemented Yet"

    except Exception as e:
        logger.error(f"Assessment Task Failed: {e}")
        return f"Failed: {e}"
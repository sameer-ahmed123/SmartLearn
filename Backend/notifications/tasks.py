from datetime import timedelta
from django.db.models import Exists, OuterRef
from channels.layers import get_channel_layer
from assessment.models import Assignment, AssignmentSubmission, Quiz, QuizSubmission
from asgiref.sync import async_to_sync
from django.utils import timezone
from smartlearn_project import celery_app
from django.contrib.auth import get_user_model
from notifications.models import Notification
from lectures.models import Enrollment, Lecture
from django.contrib.contenttypes.models import ContentType
from lectures.models import Enrollment

channel_layer = get_channel_layer()


@celery_app.task
def create_bulk_notifications(course_id, verb, target_ct_id, target_id):
    now = timezone.now()
    formated_time = now.isoformat()
    User = get_user_model()
    target_ct = ContentType.objects.get_for_id(target_ct_id)
    target_type = target_ct.model
    student_ids = list(Enrollment.objects.filter(
        course_id=course_id).values_list('student_id', flat=True))

    print(f"DEBUG: Found {len(student_ids)} students for course {course_id}")

    notifications = [
        Notification(
            recipient_id=s_id,
            verb=verb,
            content_type=target_ct,
            object_id=target_id
        ) for s_id in student_ids
    ]

    Notification.objects.bulk_create(notifications)

    for s_id in student_ids:
        group_name = f"user_notifications_{s_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "content": {
                    "verb": verb,
                    "target_type": target_type,
                    "target_id": target_id,
                    "created_at": formated_time,
                }
            }
        )


@celery_app.task
def create_single_notification(user_id, verb, target_ct_id, target_id):
    now = timezone.now()
    formated_time = now.isoformat()
    target_ct = ContentType.objects.get_for_id(target_ct_id)
    target_type = target_ct.model

    already_exists = Notification.objects.filter(
        recipient_id=user_id,
        verb=verb,
        content_type=target_ct,
        object_id=target_id
    ).exists()

    if already_exists:
        return
    Notification.objects.create(
        recipient_id=user_id,
        verb=verb,
        content_type=target_ct,
        object_id=target_id
    )

    group_name = f"user_notifications_{user_id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "content": {
                    "verb": verb,
                    "target_type": target_type,
                    "target_id": target_id,
                    "created_at": formated_time,
            }
        }
    )


# deadline checking task
@celery_app.task
def check_deadline_reminders():
    now = timezone.now()
    start_window = now.replace(microsecond=0)
    end_window = (now + timedelta(hours=24)).replace(microsecond=0)
    User = get_user_model()

    quiz_ct = ContentType.objects.get_for_model(Quiz)

    # 1. CHECK ASSIGNMENTS
    upcoming_assignments = Assignment.objects.filter(
        deadline__range=(start_window, end_window),
        status='published'
    ).select_related('lecture__content_source__course')
    
    assignment_ct = ContentType.objects.get_for_model(Assignment)
    
    # print(f"--- DEBUG: Found {upcoming_assignments.count()} assignments ---")
    for assignment in upcoming_assignments:
        # Get students enrolled in this course
        course = assignment.lecture.content_source.course
        students = User.objects.filter(course_enrollments__course=course)
        
        for student_user in students:
            already_submitted = AssignmentSubmission.objects.filter(
                assignment = assignment,
                user = student_user
            ).exists()
        
        if not already_submitted:
            # print(f"--- DEBUG: Sending to User {student_user.email} ---")
            create_bulk_notifications.delay(
                    course_id=course.id,
                    verb=f"Your assignment '{assignment.lecture.topic}' is due soon!",
                    target_ct_id=assignment_ct.id,
                    target_id=assignment.id
                )    
        

    # 2. CHECK QUIZZES
    upcoming_quizzes = Quiz.objects.filter(
        created_at__range=(start_window, end_window),
        status='published'
    ).select_related('lecture__content_source__course')

    for quiz in upcoming_quizzes:
        course = quiz.lecture.content_source.course

        quiz_sub_exists = QuizSubmission.objects.filter(
            quiz=quiz,
            student=OuterRef('student')
        )

        pending_students = course.enrollments.annotate(
            already_finished=Exists(quiz_sub_exists)
        ).filter(already_finished=False).select_related('student')

        for enrollment in pending_students:
            create_single_notification.delay(
                user_id=enrollment.student.id,
                verb=f"Don't forget: {quiz.lecture.topic} closes in 24 hours!",
                target_ct_id=quiz_ct.id,
                target_id=quiz.id
            )

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from smartlearn_project import celery_app
from django.contrib.auth import get_user_model
from notifications.models import Notification
from lectures.models import Enrollment, Lecture
from django.contrib.contenttypes.models import ContentType

channel_layer = get_channel_layer()


@celery_app.task
def create_bulk_notifications(course_id, verb, target_ct_id, target_id):
    now = timezone.now()
    # Format: "Mar 30, 08:52 AM"
    formated_time = now.strftime("%b %d, %I:%M %p")
    User = get_user_model()
    target_ct = ContentType.objects.get_for_id(target_ct_id)
    target_type = target_ct.model
    student_ids =list(Enrollment.objects.filter(
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
    # Format: "Mar 30, 08:52 AM"
    formated_time = now.strftime("%b %d, %I:%M %p")
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

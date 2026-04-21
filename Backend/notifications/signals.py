from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from lectures.models import Lecture
from assessment.models import Assignment, Quiz
from .tasks import create_bulk_notifications, create_single_notification


@receiver(post_save, sender=Lecture)
def lecture_published_signal(sender, instance, created, **kwargs):
    # Triggered when a lecture is validated
    if instance.validation_status == 'validated':
        course_id = instance.content_source.course_id
        target_ct = ContentType.objects.get_for_model(instance)

        create_bulk_notifications.delay(
            course_id,
            f"New Lecture: {instance.topic}",
            target_ct.id,
            instance.id
        )


@receiver(post_save, sender=Assignment)
def assignment_published_signal(sender, instance, created, **kwargs):
    if instance.status == 'published':
        course_id = instance.lecture.content_source.course_id
        target_ct = ContentType.objects.get_for_model(instance)

        create_bulk_notifications.delay(
            course_id,
            f"New Assignment for {instance.lecture.topic}",
            target_ct.id,
            instance.id
        )


@receiver(post_save, sender=Quiz)
def quiz_published_signal(sender, instance, created, **kwargs):
    if instance.status == 'published':
        course_id = instance.lecture.content_source.course_id
        target_ct = ContentType.objects.get_for_model(instance)

        create_bulk_notifications.delay(
            course_id,
            f"New Quiz for {instance.lecture.topic}",
            target_ct.id,
            instance.id
        )

@receiver(post_save, sender=Lecture)
def notify_teacher(sender, instance, created, **kwargs):
    try:
        if not instance.content_source_id:
            return
        target_ct = ContentType.objects.get_for_model(instance)
        teacher = instance.content_source.course.teacher
        

        if instance.script and instance.validation_status == 'pending':
            create_single_notification.delay(
                teacher.id,
                f"Script ready for review: {instance.topic}",
                target_ct.id,
                instance.id
            )
        
        if instance.video_status == 'completed':
            create_single_notification.delay(
                teacher.id,
                f"video generated for: {instance.topic}",
                target_ct.id,
                instance.id
            )
    except Exception as e:
        print(f"Notification Signal Error: {e}")
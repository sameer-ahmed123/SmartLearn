from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from lectures.models import Lecture
from assessment.models import Assignment, Quiz
from .tasks import create_bulk_notifications, create_single_notification


@receiver(post_save, sender=Lecture)
def lecture_published_signal(sender, instance, created, **kwargs):
    # Triggered when a lecture is validated
    if instance.content_source and instance.content_source.course:
        if instance.validation_status == 'validated':
            course_id = instance.content_source.course_id
            target_ct = ContentType.objects.get_for_model(instance)

            create_bulk_notifications.delay(
                course_id,
                f"New Lecture: {instance.topic}",
                target_ct.id,
                instance.id
            )
    else:
        print(f"Skipping notification: Lecture '{instance.topic}' has no course source.")

@receiver(post_save,sender=Quiz)
@receiver(post_save,sender=Assignment)
def assesment_published_signal(sender,instance,created,**kwargs):
    try:
        if instance.status == 'published':
            course_id = instance.lecture.content_source.course_id
            target_ct = ContentType.objects.get_for_model(instance)
            model_name = sender.__name__ # Quiz or Assignment
            
            create_bulk_notifications.delay(
                course_id,
                f"New {model_name} for {instance.lecture.topic}",
                target_ct.id,
                instance.id
            )
    except Exception as e:
        print(f"Notification Signal Error: {e}")

@receiver(post_save, sender=Lecture)
def notify_teacher_lecture_finished(sender, instance, created, **kwargs):
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

@receiver(post_save,sender=Quiz)
@receiver(post_save,sender=Assignment)
def assesment_ready_signal(sender,instance,created,**kwargs):
    try:
        if instance.status == 'ready':
            teacher = instance.lecture.content_source.course.teacher
            target_ct = ContentType.objects.get_for_model(instance)
            
            model_name = sender.__name__ # either Quiz or Assignment
            
            create_single_notification.delay(
                teacher.id,
                f"{model_name} ready for lecture: {instance.lecture.topic}",
                target_ct.id,
                instance.id
            )
    except Exception as e:
        print(f"Assesnent notification Signal error: {e}")
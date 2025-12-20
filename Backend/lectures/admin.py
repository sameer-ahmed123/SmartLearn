from django.contrib import admin
from .models import Lecture, ContentSource, Course

# Register your models here.
@admin.register(ContentSource)
class ContentSourceAdmin(admin.ModelAdmin):
    list_display = ("id","course","uploaded_by","created_at")
    search_fields = ("course",)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title","teacher","description","status","created_at")
    list_filter = ("status","teacher")
    search_fields = ("title", "teacher",)
@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('topic', 'generated_by', 'validated_by', 'validation_status', 'created_at')
    list_filter = ('validation_status', 'created_at')
    search_fields = ("topic","summary_text")
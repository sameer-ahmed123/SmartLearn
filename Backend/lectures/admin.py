from django.contrib import admin
from .models import Lecture

# Register your models here.
@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('topic', 'generated_by', 'validated_by', 'validation_status', 'created_at')
    list_filter = ('validation_status', 'created_at')
    search_fields = ("topic","summary_text")
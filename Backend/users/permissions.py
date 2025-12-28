from rest_framework import permissions
from lectures.models import Enrollment

class IsTeacher(permissions.BasePermission):
    """
    Custom permission to only allow users with the 'teacher' role 
    to access the view.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role == "teacher"
    
class IsStudent(permissions.BasePermission):
    """
    Custom Permission to only allow users with the 'student' role
    to access view
    """
    
    def has_permission(self,request,view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.role == "student"


class CanViewLecture(permissions.BasePermission):
    """
    Can only view if:
    1. is owner of Course
    2. is enrolled in Course and lecture is validated
    """
    
    def has_object_permission(self, request, view, lecture):
        user = request.user
        
        try:
            course = lecture.content_source.course
        except AttributeError:
            return False
        
        if user.role == "teacher" and course.teacher == user:
            return True
        
        if user.role == "student":
            if lecture.validation_status != 'pending':
                return False
            
            is_enrolled = Enrollment.objects.filter(
                student = user,
                course = course
            ).exists()
            
            return is_enrolled
        
        return False
    
class IsCourseOwner(permissions.BasePermission):
    """
    To check if a course belongs to a user 
    """
    
    def has_object_permission(self, request, view, course):
        if request.user.role != "teacher":
            return False
       
        return course.content_source.course.teacher == request.user
    
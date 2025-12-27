from rest_framework import permissions


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
    Custom permission to only allow users with the 'student' role 
    to access the view.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role == "student"

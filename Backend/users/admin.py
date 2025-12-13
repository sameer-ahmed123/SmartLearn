from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.

class MyUserAdmin(UserAdmin):
    list_display = ("email","full_name","role","is_staff","created_at")
    list_filter = ("role","is_staff")
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    search_fields = ("email","full_name")
    ordering = ("email",)
    
admin.site.register(User,MyUserAdmin)
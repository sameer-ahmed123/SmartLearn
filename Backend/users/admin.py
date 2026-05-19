from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User,Profile

# Register your models here.
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile Info'
class MyUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
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
    
class MyProfileAdmin(admin.ModelAdmin):
    list_display = ("get_email","get_full_name","get_role","created_at")
    list_filter = ("department",)
    
    search_fields = ("user__email", "user__full_name")
   
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email' 

    def get_role(self, obj):
        return obj.user.role
    get_role.short_description = 'Role'
    
    def get_full_name(self, obj):
        return obj.user.full_name
    get_full_name.short_description = 'Full_name'
    
    
admin.site.register(User,MyUserAdmin)
admin.site.register(Profile,MyProfileAdmin)
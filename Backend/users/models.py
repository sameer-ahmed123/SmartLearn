from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager
from cloudinary.models import CloudinaryField
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Ensure role is set for admin
        extra_fields.setdefault('role', 'teacher') 
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    
    username = None 
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # this line is need to connect the User(AbstractUser)  to Custom UserManger
    # the Custom Manager Allows us to authenticate and create users based on 
    # email field instead of username field (USERNAME_FIELD = 'email') 
    objects = UserManager() #type: ignore

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    def __str__(self):
        return self.email
    
    class Meta:
        db_table = "user"
        
        
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    avatar = CloudinaryField(
        'image',
        folder = 'profiles/avatars/',
        null = True,
        blank= True,
    )
    
    bio = models.TextField(max_length=500,blank=True)
    birth_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15,blank=True)
    location = models.CharField(max_length=100,blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    github_url = models.URLField(max_length=500, blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True, null=True)
    instagram_url = models.URLField(max_length=500,blank=True,null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
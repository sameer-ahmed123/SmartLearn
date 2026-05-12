from rest_framework import serializers
from .models import User,Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role', 'password', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

    def create(self, validated_data):
        # Uses our custom UserManager to hash the password properly 4
        user = User.objects.create_user(**validated_data)
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source = 'user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name',read_only=True)
    role = serializers.CharField(source='user.role',read_only=True)
    class Meta:
        model = Profile
        fields = ['id','email','full_name','role','avatar','bio','location','department','phone_number','birth_date','instagram_url','linkedin_url','website_url','github_url']
        read_only_fields =['id']
        
    def to_representation(self, instance):
        """
        This method transforms the outgoing JSON. 
        It keeps the field 'writable' for PATCH, but 
        ensures the GET response has the full Cloudinary URL.
        """
        representation = super().to_representation(instance)
        if instance.avatar:
            # Manually force the absolute URL in the response
            representation['avatar'] = instance.avatar.url
        return representation
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.serializers import UserSerializer, ProfileSerializer,ProfileLoginSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serialzer = UserSerializer(data=request.data)
    if serialzer.is_valid():
        serialzer.save()
        return Response({
            "message": "User Created Successfuly!",
            "user": serialzer.data},
            status=status.HTTP_201_CREATED
        )
    return Response(serialzer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        profile_data = ProfileLoginSerializer(user.profile).data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'full_name': user.full_name,
                'role': user.role,
                'email': user.email,
                'profile':profile_data
            }
        }, status=status.HTTP_200_OK)

    return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        # 1. gets the refresh token from frontend
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)

        # 2. permanently Blocks the token
        token.blacklist()

        return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:

        return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def manage_profile(request):
    """
    Endpoint: /api/profiles/me/
    GET: Fetch logged-in user's profile
    PATCH: Update profile details (bio, avatar, etc.)
    """

    try:
        profile = request.user.profile
    except AttributeError:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == "PATCH":
        print("FILES:", request.FILES)
        serializer = ProfileSerializer(
            profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_pass = request.data.get("old_password")
    new_pass = request.data.get("new_password")

    if not old_pass or not new_pass:
        return Response(
            {"error": "Both old_password and new_password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(old_pass):
        return Response({"old_password": ["wrong current Password!"]}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_pass)
    user.save()


    return Response({"message": "Password Updated successfully!"}, status=status.HTTP_200_OK)


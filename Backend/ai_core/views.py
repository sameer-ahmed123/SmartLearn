from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import get_ai_response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_buddy(request):
    query = request.data.get('query')
    # Aap yahan lecture ka context bhi bhej sakte hain backend se
    context = request.data.get('context', "General educational help")
    
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    ai_answer = get_ai_response(query, context)
    return Response({"answer": ai_answer})

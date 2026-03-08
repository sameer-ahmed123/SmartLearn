from django.shortcuts import render


import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Gemini Config
GEMINI_API_KEY = "AIzaSyBSnFVZs7RBmCy3XyuV6CExxyrm0b5_4v0" 
genai.configure(api_key=GEMINI_API_KEY)

class AIChatView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        try:
            # Step A: Pehle check karte hain ke aapki key kon sa model support karti hai
            available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            
            if not available_models:
                raise Exception("No supported models found for this API key.")

            # Step B: Pehla available model pick kar lein (Aksar 'models/gemini-1.5-flash' ya 'models/gemini-pro' hota hai)
            selected_model = available_models[0]
            print(f"--- Using Model: {selected_model} ---") # Terminal mein check karein
            
            model = genai.GenerativeModel(selected_model)
            response = model.generate_content(user_message)

            return Response({
                "reply": response.text,
                "status": "success",
                "model_used": selected_model
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"--- Gemini API Error: {str(e)} ---")
            return Response({
                "reply": "I am having some technical issues. Please try again.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
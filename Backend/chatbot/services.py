import google.generativeai as genai
import os
from chatbot.models import ChatMessage

def get_ai_response(session, user_query):

    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # 1. Prepare History (Logic moved out of view)
    past_messages = session.messages.all().order_by('-timestamp')[:15]
    history = []
    for msg in reversed(past_messages):
        role = "user" if msg.sender == "user" else "model"
        history.append({"role": role, "parts": [msg.text]})

    lecture = session.lecture
    system_instruction = (
        f"You are a helpful AI tutor for the lecture: {lecture.topic}. "
        f"Context: {lecture.summary_text}"
    )

    # 3. Call AI
    chat = model.start_chat(history=history[:-1]) # Don't send the message we just saved yet
    response = chat.send_message(f"System Context: {system_instruction}\n\nStudent Question: {user_query}")
    
    return response.text
########
#       SWITCHING FROM gemini-2.5-flash  to gemini-3-flash-preview
##
#       significantly faster response time for images
#       (down from 83-100 seconds to 13-16 seconds)
##
########

import os
import base64
import magic  # You might need a library to detect file types robustly
from django.conf import settings
from PIL import Image
# from PyPDF2 import PdfReader # Uncomment if you need to read PDFs
import google.genai as genai


api_key = settings.GEMINI_API_KEY
# Initialize the client, explicitly passing the key
if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is missing in Django settings. Check your environment variables.")

# Initialize genai Client . Note the client will automatically read gemini api key from settings
client = genai.Client(api_key=api_key)

# helper to convert local image to part object


def get_image_part(file_path):
    """ converts a local image file to a GenerativePart for Gemini API
        helps Ai model analize what the image contains
        Converts local image file to binary data (bytes) or phir bhje ga ai ko
    """
    with open(file_path, "rb") as f:
        image_bytes = f.read()
        # --- FIX MIME type ---
        # Use the correct standard MIME type for JPEG files.
        if file_path.lower().endswith(('.jpg', '.jpeg')):
            mime_type = "image/jpeg"
        elif file_path.lower().endswith('.png'):
            mime_type = "image/png"
        else:
            # Fallback or error handling for unsupported types
            raise ValueError(
                f"Unsupported image file extension for Gemini: {file_path}")
        return genai.types.Part.from_bytes(data=image_bytes, mime_type=mime_type)


def read_content_file(file_path_db):
    """
    1: Constructs the absolute path 
    2: determines the file type (e.g image ha yeh .txt), 
    3: read/processe the content.
    """
    if not file_path_db:
        return "Error: File path is None."

    full_path = os.path.join(settings.MEDIA_ROOT, file_path_db)

    if not os.path.exists(full_path):
        return f"Error: File not found at path {full_path}"

    # Use a try/except block to handle file reading errors
    try:
        if file_path_db.lower().endswith(('.png', '.jpg', '.jpeg')):
            return {
                "type": "image",
                "path": full_path,
                "content": f"load image file: {os.path.basename(file_path_db)}"
            }
            # # For LLMs, you usually send the image as a base64 string or binary data
            # # Placeholder: confirm the image is valid
            # with Image.open(full_path) as img:
            #     return {
            #         'type': 'image',
            #         'content': f"Loaded image file: {os.path.basename(file_path_db)} (Size: {img.size})"
            #     }

        elif file_path_db.lower().endswith(('.txt', '.csv', '.md')):
            with open(full_path, 'r', encoding='utf-8') as f:
                return {'type': 'text', 'content': f.read()}
        elif file_path_db.lower().endswith('.pdf'):
            # TODO: Use a library like PyPDF2 to extract text
            return {'type': 'pdf', 'content': f"Placeholder for PDF content at {full_path}"}
        else:
            return {'type': 'unknown', 'content': f"Unsupported file type: {os.path.basename(file_path_db)}"}

    except Exception as e:
        return {'type': 'error', 'content': f"Error processing file {full_path}: {e}"}


def generate_lecture_script(prompt, file_data):
    """
    Calls Gemini API to Generate Script and Context in Json format
    """
    # 1. Prepare input Parts
    # model_name = "gemini-2.5-flash"
    model_name = "gemini-3-flash-preview"
    system_instructions = (
        "You are an expert curriculum designer. Your task is to generate a comprehensive"
        "lecture script and brief chatbot context based on the user's prompt and provided content."
        "the Output MUST be a JSON object with 'script' and 'context' keys."
    )
    # 2. build content array for the api call
    content_parts = [system_instructions, f"user prompt: {prompt}"]

    if file_data['type'] == 'image':
        # Assuming file_data['path'] holds the full path for the image
        # You will need to update read_content_file to return the path!
        image_part = get_image_part(file_data['path'])
        content_parts.append(image_part)
    else:
        content_parts.append(f"content for lecture: {file_data['content']}")

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=content_parts,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "script": {"type": "string", "description": "The full, detailed Lecture Script."},
                        "context": {"type": "string", "description": "A short summary (max 200 words) of the material to train a Q&A chatbot"}
                    }
                }
            }
        )

        import json
        data = json.loads(response.text)
        return data.get("script"), data.get("context")
    except Exception as e:
        print(f"LLM API ERROR: {e}")
        return f"LLM Script Generation failed. {e}", "error context"


def generate_video(script):
    """
    (PLACEHOLDER) Calls a Video Generation API.
    Returns: (video_url, transcript_text)
    """
    # Typically, the video service needs the full script and returns a URL and a transcript confirmation.
    video_url = "https://external.video.service/generated_" + str(hash(script))
    transcript = script
    return video_url, transcript

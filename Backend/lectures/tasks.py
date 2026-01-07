from .models import ContentSource, Lecture, Course
import logging
import os
from ai_core.services import read_content_file, generate_lecture_script, generate_video
from smartlearn_project import celery_app

print("--- LECTURES TASKS MODULE LOADED ---")
logger = logging.getLogger(__name__)


@celery_app.task
def generate_lecture_from_source(content_source_id):
    """
    Long-running Celery task:
    1. Parses raw file content (PDF/PPT/DOCX)
    2. Uses Gemini AI to generate a lecture script and context
    3. Triggers video generation (avatar/voiceover)
    4. Saves the final Lecture object to the database
    """

    image_paths = []

    try:
        """
        1. RETRIEVE SOURCE DATA
        """
        # Fetch the instance once; this object is used throughout the task lifecycle
        source_instance = ContentSource.objects.get(id=content_source_id)

        # Resolve Course title for use in the Lecture topic and logging
        course_title = source_instance.course.title if source_instance.course else "[Course Not Linked/Found]"

        # Use the safe variable in logging
        logger.info(
            f"Processing content source ID: {content_source_id} for course: {course_title}")

        # Extract file path and the teacher's custom AI instructions
        file_path_db = source_instance.raw_file.path if source_instance.raw_file else None
        ai_prompt = source_instance.ai_prompt
        file_name = file_path_db if file_path_db else "[No File Uploaded]"

        """
        2. FILE PROCESSING
        """
        # Convert uploaded binary file into text/image data for AI consumption
        file_data = read_content_file(file_path_db)

        # Validation: Check if file reading failed or returned an error structure
        if isinstance(file_data, str) or (isinstance(file_data, dict) and file_data.get('type') == 'error'):
            logger.error(
                f"Failed to process file for lecture Id {content_source_id}: {file_data}")
            return

        # Track temporary images created during file extraction for later cleanup
        image_paths = file_data.get('image_paths', [])

        print(f"--- DEBUG: ID from DB: {source_instance.id}")
        print(f"--- DEBUG: Course Title: {course_title}")
        print(f"--- DEBUG: Raw file path from DB: {file_name}")

        """
        3. AI CONTENT GENERATION
        """
        # Step 1: Generate the script and relevant context from the source file
        script, context = generate_lecture_script(
            ai_prompt,
            file_data
        )

        print(script)
        print(context)

        # Step 2: Trigger Video/Audio generation based on the script
        # Note: video_url and transcript are currently placeholder returns until API integration is finalized
        video_url, transcript_text = generate_video(script)

        """
        4. DATABASE PERSISTENCE
        """
        # Create the final Lecture object. Status is 'pending' until the teacher approves it.
        Lecture.objects.create(
            content_source=source_instance,
            topic=f"Auto-Generated Lecture: {course_title} Part {source_instance.id}",
            # Temporary: script is stored in summary_text until dedicated schema update
            summary_text=script,
            video_url=video_url,
            # Associate lecture with the original teacher who uploaded the source
            generated_by_id=source_instance.uploaded_by,
            validation_status='pending',
            script=script,
            context=context
        )

        logger.info(
            f"Successfully created Lecture for source ID: {content_source_id}. Video URL: {video_url}")

    except ContentSource.DoesNotExist:
        logger.error(f"ContentSource with ID {content_source_id} not found.")

    except Exception as e:
        # Catch-all for API timeouts, file system errors, or DB issues
        logger.exception(
            f"FATAL ERROR during lecture generation for ID {content_source_id}: {e}")
    finally:
        """
        5. RESOURCE CLEANUP
        """
        # Remove any temporary image files extracted from PDFs/PPTs to save disk space
        if image_paths:
            logger.info(
                f"cleaning up {len(image_paths)} temporary files form source ID {content_source_id}")
            for path in image_paths:
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except Exception as cleanup_e:
                    logger.warning(
                        f"failed to remove  temp file {path}: {cleanup_e}")

    return None

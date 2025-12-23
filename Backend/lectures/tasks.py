from .models import ContentSource, Lecture, Course
import logging
from ai_core.services import read_content_file, generate_lecture_script, generate_video
from smartlearn_project import celery_app
print("--- LECTURES TASKS MODULE LOADED ---")

# ⚠️ Ensure you import all necessary models here!

logger = logging.getLogger(__name__)


@celery_app.task
def generate_lecture_from_source(content_source_id):
    """
    Long-running task to process raw content, generate the lecture script, 
    and then trigger video generation via external APIs.
    """

    # We retrieve the data as a dictionary to prevent ORM-level crashes on corrupted fields.
    source_data = None

    try:
        # 1. Retrieve the ContentSource data as a dictionary (safer than object)
        #    only load specific Fields
        source_data = ContentSource.objects.filter(id=content_source_id).values(
            'id', 'course_id', 'raw_file', 'ai_prompt', 'uploaded_by_id'
        ).first()

        if not source_data:
            raise ContentSource.DoesNotExist(
                f"No ContentSource found for ID {content_source_id}")

        # 2. SAFELY RESOLVE THE COURSE TITLE using the raw ID
        #    Tries to find title of the Course linked to the Content Source
        course_pk = source_data.get('course_id')
        course_title = "[Course Not Linked/Found]"

        if course_pk:
            try:
                # Manually fetch the Course title
                course_title = Course.objects.only(
                    'title').get(pk=course_pk).title
            except Course.DoesNotExist:
                course_title = "[Course Not Found]"

        # Use the safe variable in logging
        logger.info(
            f"Processing content source ID: {content_source_id} for course: {course_title}")

        # get the raw-file's file path and the Ai "ASSIST" prompt
        file_path_db = source_data.get('raw_file')
        ai_prompt = source_data.get('ai_prompt')
        file_name = file_path_db if file_path_db else "[No File Uploaded]"

        # 3. Read the File  -- Links to services.py (read_content_file)
        #    converts the uploaded file into a format that ai can understand
        file_data = read_content_file(file_path_db)
        # print(file_data)
        if isinstance(file_data, str) and file_data.startswith("Error"):
            logger.error(
                f"Failed to process file for lecture ID {content_source_id}: {file_data}")
            return  # Exit the task on file failure

        print(f"--- DEBUG: ID from DB: {source_data['id']}")
        print(f"--- DEBUG: Course Title: {course_title}")
        print(f"--- DEBUG: Raw file path from DB: {file_name}")

        #######
        # 4.  Start External API CALLs ( GEMINI 'gemini-3-flash-preview' )
        #######
        # --- STEP 1: provide processed file and ai assist prompt to helper function ---
        #             that calls external api  (gemini)
        #             Generates Script and Context
        generated_script, context_text = generate_lecture_script(
            ai_prompt,
            file_data
        )

        print(generated_script)
        print(context_text)

        # --- STEP 2: Generate Video and Transcript (External API Call) ---
        #             (Takes in the Generated Script)
        #             should spit out Video url and transcript
        #             Currently a Placeholder (Genereic hardcoded output)

        video_url, transcript_text = generate_video(generated_script)

        # --- STEP 3: Create the final Lecture object and update the DB ---

        # We need the actual ContentSource instance for the ForeignKey,
        # so we fetch it again, only now that we know the basic fields are safe.(celery issue)
        # Because of Celery ....Working on the Envionment Variable access to Celery
        # Causes Error if celery does not recive correct ENV variables
        # If the task succeeds up to this point, this final ORM retrieval should be safe,
        # and allow DB Writes
        source_instance = ContentSource.objects.get(id=content_source_id)

        Lecture.objects.create(
            content_source=source_instance,
            topic=f"Auto-Generated Lecture: {course_title} Part {source_data['id']}",
            # (should be something else...maybe the transcript?  , gen_script should go to a video_gen ai )
            # potentail DB schema change (to add transcript Feild)
            summary_text=generated_script,
            video_url=video_url,
            # Use the raw ID, we assume the user exists
            generated_by_id=source_data.get('uploaded_by_id'),
            validation_status='pending'
        )

        logger.info(
            f"Successfully created Lecture for source ID: {content_source_id}. Video URL: {video_url}")

    except ContentSource.DoesNotExist:
        logger.error(f"ContentSource with ID {content_source_id} not found.")

    except Exception as e:
        # Log the full traceback for better error diagnostics
        logger.exception(
            f"FATAL ERROR during lecture generation for ID {content_source_id}: {e}")

    return None

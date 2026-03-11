from django.urls import path
from assessment.views import (
    generate_assessment_trigger, 
    quiz_detail_update, 
    assignment_detail_update,
    student_quiz_list,
    submit_quiz_score,
    student_assignment_list,  # Naya view import kiya
    submit_assignment,          # Naya view import kiya
    teacher_assignment_list,    # Teacher list view import kiya
    teacher_quiz_list,          # Teacher quiz list view import kiya
    get_lecture_submissions,     # Submissions fetch karne ke liye naya view
    quiz_detail_by_lecture,     # Naya import
    get_quiz_submissions        # Naya import
)

app_name = "assessment"

urlpatterns = [
    path('generate/', generate_assessment_trigger, name='generate-assessment'),
    path('quiz/<int:quiz_id>/', quiz_detail_update, name='quiz-detail-update'),
    path('assignment/<int:assignment_id>/', assignment_detail_update, name='assignment-detail-update'),
    
    # --- Student Portal Endpoints ---
    path('student-quizzes/', student_quiz_list, name='student-quiz-list'),
    path('quiz/<int:quiz_id>/submit/', submit_quiz_score, name='submit-quiz-score'), # Score save karne ke liye
    
    # --- Student Assignment Endpoints ---
    path('student-assignments/', student_assignment_list, name='student-assignment-list'),
    path('assignment/<int:assignment_id>/submit/', submit_assignment, name='submit-assignment'),

    # --- Teacher Management Endpoints ---
    path('teacher-list/', teacher_assignment_list, name='teacher-assignment-list'),
    path('teacher-quizzes/', teacher_quiz_list, name='teacher-quiz-list'),
    
    # --- New: Get Submissions for Teacher ---
    path('lecture/<int:lecture_id>/submissions/', get_lecture_submissions, name='lecture-submissions'),
    
    # --- Compatibility Route for React Params ---
    path('lecture/<int:lecture_id>/assignment/', get_lecture_submissions, name='lecture-assignment-submissions-alias'),

    # --- Added Routes for Quiz Detail View ---
    path('quiz/detail-by-lecture/<int:lecture_id>/', quiz_detail_by_lecture, name='quiz-detail-by-lecture'),
    path('quiz/<int:quiz_id>/submissions/', get_quiz_submissions, name='quiz-submissions'),
]
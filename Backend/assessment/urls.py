from django.urls import path
from assessment.views import (
    generate_assessment_trigger, 
    quiz_detail_update, 
    assignment_detail_update,
    student_quiz_list,
    submit_quiz_score,
    student_assignment_list,
    submit_assignment,
    teacher_assignment_list,
    teacher_quiz_list,
    get_lecture_submissions,
    quiz_detail_by_lecture,
    get_quiz_submissions,
    teacher_gradebook_summary,
    student_detail_report,
    student_gradebook_summary # Naya function import kiya
)

app_name = "assessment"

urlpatterns = [
    path('generate/', generate_assessment_trigger, name='generate-assessment'),
    path('quiz/<int:quiz_id>/', quiz_detail_update, name='quiz-detail-update'),
    path('assignment/<int:assignment_id>/', assignment_detail_update, name='assignment-detail-update'),
    
    # --- Student Portal Endpoints ---
    path('student-quizzes/', student_quiz_list, name='student-quiz-list'),
    path('quiz/<int:quiz_id>/submit/', submit_quiz_score, name='submit-quiz-score'),
    
    # --- Student Assignment Endpoints ---
    path('student-assignments/', student_assignment_list, name='student-assignment-list'),
    path('assignment/<int:assignment_id>/submit/', submit_assignment, name='submit-assignment'),

    # --- Student Gradebook Endpoint (Newly Added) ---
    path('student/gradebook-summary/', student_gradebook_summary, name='student-gradebook-summary'),

    # --- Teacher Management Endpoints ---
    path('teacher-list/', teacher_assignment_list, name='teacher-assignment-list'),
    path('teacher-quizzes/', teacher_quiz_list, name='teacher-quiz-list'),
    
    # --- Submissions ---
    path('lecture/<int:lecture_id>/submissions/', get_lecture_submissions, name='lecture-submissions'),
    path('lecture/<int:lecture_id>/assignment/', get_lecture_submissions, name='lecture-assignment-submissions-alias'),
    path('quiz/detail-by-lecture/<int:lecture_id>/', quiz_detail_by_lecture, name='quiz-detail-by-lecture'),
    path('quiz/<int:quiz_id>/submissions/', get_quiz_submissions, name='quiz-submissions'),

    # --- Gradebook & Report Endpoints (Frontend Compatibility Fixed) ---
    # Frontend calls /api/teacher/gradebook-summary/
    path('teacher/gradebook-summary/', teacher_gradebook_summary, name='teacher-gradebook-summary'),
    
    # Frontend calls /api/teacher/student-report/ID/
    path('teacher/student-report/<int:student_id>/', student_detail_report, name='student-detail-report'),
    
    # Keeping old ones just in case
    path('teacher-gradebook-summary/', teacher_gradebook_summary, name='teacher-gradebook-summary-old'),
    path('student-report/<int:student_id>/', student_detail_report, name='student-detail-report-old'),
]
# assessment/urls.py
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
    teacher_assignment_update_score,
    teacher_quiz_list,
    get_lecture_submissions,
    quiz_detail_by_lecture,
    get_quiz_submissions,
    grade_assignment_submission,
    teacher_quiz_update_score,
    student_calendar_deadlines  # 🔥 Naya view import kiya gaya hai
)

app_name = "assessment"

urlpatterns = [
    path('generate/', generate_assessment_trigger, name='generate-assessment'),

    # --- Detail & Edit ---
    path('quiz/<int:quiz_id>/', quiz_detail_update, name='quiz-detail-update'),
    path('assignment/<int:assignment_id>/',
         assignment_detail_update, name='assignment-detail-update'),

    # --- Student Actions ---
    path('student-quizzes/', student_quiz_list, name='student-quiz-list'),
    path('quiz/<int:quiz_id>/submit/',
         submit_quiz_score, name='submit-quiz-score'),
    path('student-assignments/', student_assignment_list,
         name='student-assignment-list'),
    path('assignment/<int:assignment_id>/submit/',
         submit_assignment, name='submit-assignment'),
    
    # 🔥 Naya Calendar Deadlines Endpoint
    path('student-calendar-deadlines/', student_calendar_deadlines, name='student-calendar-deadlines'),

    # --- Teacher Lists ---
    path('teacher-list/', teacher_assignment_list,
         name='teacher-assignment-list'),
    path('teacher-quizzes/', teacher_quiz_list, name='teacher-quiz-list'),

    # --- Submissions & Grading ---
    path('lecture/<int:lecture_id>/submissions/',
         get_lecture_submissions, name='lecture-submissions'),
    path('lecture/<int:lecture_id>/assignment/', get_lecture_submissions,
         name='lecture-assignment-submissions-alias'),
    path('quiz/detail-by-lecture/<int:lecture_id>/',
         quiz_detail_by_lecture, name='quiz-detail-by-lecture'),
    path('quiz/<int:quiz_id>/submissions/',
         get_quiz_submissions, name='quiz-submissions'),
    path('submission/<int:submission_id>/grade/',
         grade_assignment_submission, name='grade-assignment-submission'),
    
    #---- manual grading for assingment
    path('submissions/<int:id>/update-score/',teacher_assignment_update_score,name="manual-grade-assignment"),
    path('quiz-submissions/<int:id>/update-score/', teacher_quiz_update_score, name="manual-grade-quiz"),
]
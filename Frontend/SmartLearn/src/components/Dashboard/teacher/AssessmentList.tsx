// src/components/Dashboard/teacher/AssessmentList.tsx

import { useState } from "react";
import apiClient from "../../../api/apiClient";
import QuizEditorModal from "./QuizEditorModal";
import AssignmentEditorModal from "./AssignmentEditorModal";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lectures: any[];
  onRefresh: () => void;
}

const AssessmentList = ({ lectures, onRefresh }: AssessmentProps) => {
  // We only track this to disable the button right after they click it
  const [generatingQuizId, setGeneratingQuizId] = useState<number | null>(null);
  const [generatingAssignmentId, setGeneratingAssignmentId] = useState<number | null>(null);
  
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);

  const ValidatedLectures = lectures.filter(
    (l) => l.validation_status === "validated"
  );

  // --- SUPER SIMPLE TRIGGER (NO POLLING) ---
  const handleGenerateAssessment = async (lectureId: number, type: 'quiz' | 'assignment') => {
    // 1. Instantly lock the button so they don't click it twice
    if (type === 'quiz') setGeneratingQuizId(lectureId);
    if (type === 'assignment') setGeneratingAssignmentId(lectureId);
    
    try {
      // 2. Tell the backend to start the Celery worker
      await apiClient.post("/assessments/generate/", {
        lecture_id: lectureId,
        type: type, 
      });
      // 3. Just let it run in the background! The user can refresh later.
      alert(`${type} generation started! It takes about 1-2 minutes. Refresh the page later to view it.`);
    } catch (error) {
      console.error("Gen failed", error);
      alert(`Failed to start ${type} generation.`);
      if (type === 'quiz') setGeneratingQuizId(null);
      if (type === 'assignment') setGeneratingAssignmentId(null);
    } 
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Lecture Topic</th>
            <th>Quiz</th>
            <th>Assignment</th>
          </tr>
        </thead>
        <tbody>
          {ValidatedLectures.map((lecture) => (
            <tr key={lecture.id}>
              <td>{lecture.topic}</td>

              {/* QUIZ ACTIONS */}
              <td>
                {lecture.quiz_data ? (
                  <button
                    className={styles.viewBtn}
                    onClick={() => setEditingQuizId(lecture.quiz_id)}
                  >
                    View Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateAssessment(lecture.id, 'quiz')}
                    disabled={generatingQuizId === lecture.id}
                    className={styles.generateBtn}
                  >
                    {generatingQuizId === lecture.id ? "Started! (Refresh later)" : "✨ Create Quiz"}
                  </button>
                )}
              </td>

              {/* ASSIGNMENT ACTIONS */}
              <td>
                {lecture.assignment_data ? (
                  <button
                    className={styles.viewBtn}
                    style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad', color: 'white' }}
                    onClick={() => {
                      if (!lecture.assignment_id) {
                          alert("Backend Error: assignment_id is missing from the API response!");
                      } else {
                          setEditingAssignmentId(lecture.assignment_id);
                      }
                    }}
                  >
                    View Assignment
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateAssessment(lecture.id, 'assignment')}
                    disabled={generatingAssignmentId === lecture.id}
                    className={styles.generateBtn}
                    style={{ backgroundColor: '#8e44ad', color: 'white' }} 
                  >
                    {generatingAssignmentId === lecture.id ? "Started! (Refresh later)" : "✨ Create Assignment"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Modals */}
      {editingQuizId && (
        <QuizEditorModal
          isOpen={true} 
          quizId={editingQuizId}
          onClose={() => setEditingQuizId(null)}
          onSaveSuccess={() => onRefresh()}
        />
      )}

      {editingAssignmentId && (
        <AssignmentEditorModal
          isOpen={true}
          assignmentId={editingAssignmentId}
          onClose={() => setEditingAssignmentId(null)}
          onSaveSuccess={() => onRefresh()}
        />
      )}
    </div>
  );
};

export default AssessmentList;
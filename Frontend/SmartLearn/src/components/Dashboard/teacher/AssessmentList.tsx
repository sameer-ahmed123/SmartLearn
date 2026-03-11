import { useState } from "react";
import { Sparkles, FileCheck, Eye, Loader2, BookOpen, AlertCircle } from "lucide-react";
import apiClient from "../../../api/apiClient";
import QuizEditorModal from "./QuizEditorModal";
import AssignmentEditorModal from "./AssignmentEditorModal";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lectures: any[];
  onRefresh: () => void;
  isAssignmentOnly?: boolean;
  isQuizOnly?: boolean; // New prop for Quiz-only mode
}

const AssessmentList = ({ lectures, onRefresh, isAssignmentOnly, isQuizOnly }: AssessmentProps) => {
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
    <div className={styles.assessmentWrapper}>
      <div className={styles.tableCard}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th>
                < BookOpen size={14} className={styles.headerIcon} />
                Lecture Topic
              </th>
              
              {/* QUIZ COLUMN HEADER - Conditional */}
              {!isAssignmentOnly && (
                <th style={{ textAlign: 'center' }}>
                  <Sparkles size={14} className={styles.headerIcon} />
                  Quiz
                </th>
              )}

              {/* ASSIGNMENT COLUMN HEADER - Hidden if isQuizOnly is true */}
              {!isQuizOnly && (
                <th style={{ textAlign: 'center' }}>
                  <FileCheck size={14} className={styles.headerIcon} />
                  Assignment
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ValidatedLectures.length > 0 ? (
              ValidatedLectures.map((lecture) => (
                <tr key={lecture.id}>
                  <td className={styles.topicName}>
                    {lecture.topic}
                  </td>

                  {/* QUIZ ACTIONS - Conditional */}
                  {!isAssignmentOnly && (
                    <td style={{ textAlign: 'center' }}>
                      {lecture.quiz_data ? (
                        <button
                          className={styles.viewBtn}
                          onClick={() => setEditingQuizId(lecture.quiz_id)}
                        >
                          <Eye size={16} />
                          View Quiz
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateAssessment(lecture.id, 'quiz')}
                          disabled={generatingQuizId === lecture.id}
                          className={styles.generateBtn}
                        >
                          {generatingQuizId === lecture.id ? (
                            <><Loader2 size={16} className={styles.spin} /> Generating...</>
                          ) : (
                            <><Sparkles size={16} /> Create Quiz</>
                          )}
                        </button>
                      )}
                    </td>
                  )}

                  {/* ASSIGNMENT ACTIONS - Hidden if isQuizOnly is true */}
                  {!isQuizOnly && (
                    <td style={{ textAlign: 'center' }}>
                      {lecture.assignment_data ? (
                        <button
                          className={styles.viewBtn}
                          style={{ 
                            background: '#f5f3ff', 
                            color: '#8b5cf6', 
                            borderColor: '#ddd6fe' 
                          }}
                          onClick={() => {
                            if (!lecture.assignment_id) {
                                alert("Backend Error: assignment_id is missing!");
                            } else {
                                setEditingAssignmentId(lecture.assignment_id);
                            }
                          }}
                        >
                          <FileCheck size={16} />
                          View Assignment
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateAssessment(lecture.id, 'assignment')}
                          disabled={generatingAssignmentId === lecture.id}
                          className={styles.generateBtn}
                          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                        >
                          {generatingAssignmentId === lecture.id ? (
                            <><Loader2 size={16} className={styles.spin} /> Generating...</>
                          ) : (
                            <><Sparkles size={16} /> Create Assignment</>
                          )}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={(isAssignmentOnly || isQuizOnly) ? 2 : 3} className={styles.emptyRow}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    No validated lectures found. Please validate lectures first.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
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
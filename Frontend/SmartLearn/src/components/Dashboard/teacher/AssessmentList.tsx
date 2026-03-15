// src/components/Dashboard/teacher/AssessmentList.tsx

import { useState } from "react";
import { Sparkles, FileCheck, Eye, Loader2, BookOpen, AlertCircle } from "lucide-react";
import apiClient from "../../../api/apiClient";
import QuizEditorModal from "./QuizEditorModal";
import AssignmentEditorModal from "./AssignmentEditorModal";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  lectures: any[];
  onRefresh: () => void;
  isAssignmentOnly?: boolean;
  isQuizOnly?: boolean; 
}

const AssessmentList = ({ 
  lectures = [], 
  onRefresh, 
  isAssignmentOnly = false, 
  isQuizOnly = false 
}: AssessmentProps) => {
  
  const [generatingQuizId, setGeneratingQuizId] = useState<number | null>(null);
  const [generatingAssignmentId, setGeneratingAssignmentId] = useState<number | null>(null);
  
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);

  const ValidatedLectures = lectures.filter(
    (l) => l.validation_status === "validated"
  );

  const handleGenerateAssessment = async (lectureId: number, type: 'quiz' | 'assignment') => {
    if (type === 'quiz') setGeneratingQuizId(lectureId);
    if (type === 'assignment') setGeneratingAssignmentId(lectureId);
    
    try {
      await apiClient.post("/assessments/generate/", {
        lecture_id: lectureId,
        type: type, 
      });
      
      alert(`${type} generation started! It takes about 1-2 minutes. Refresh the page later to view it.`);
      onRefresh(); 
    } catch (error) {
      console.error("Gen failed", error);
      alert(`Failed to start ${type} generation.`);
    } finally {
      if (type === 'quiz') setGeneratingQuizId(null);
      if (type === 'assignment') setGeneratingAssignmentId(null);
    }
  };

  // Helper function to render the color-coded status pill
  const renderStatusPill = (status: string) => {
    const isPublished = status === 'published';
    return (
      <span style={{
        backgroundColor: isPublished ? '#dcfce7' : '#fef3c7',
        color: isPublished ? '#166534' : '#92400e',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        display: 'inline-block'
      }}>
        {status || 'draft'}
      </span>
    );
  };

  return (
    <div className={styles.assessmentWrapper}>
      <div className={styles.tableCard}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th>
                <BookOpen size={14} className={styles.headerIcon} />
                Lecture Topic
              </th>
              
              {!isAssignmentOnly && (
                <th style={{ textAlign: 'center' }}>
                  <Sparkles size={14} className={styles.headerIcon} />
                  Quiz
                </th>
              )}

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

                  {/* QUIZ ACTIONS */}
                  {!isAssignmentOnly && (
                    <td style={{ textAlign: 'center' }}>
                      {(lecture.quiz_id || (lecture.quiz_data && Object.keys(lecture.quiz_data).length > 0)) ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          {/* Added Status Pill Here */}
                          {renderStatusPill(lecture.quiz_status)}
                          <button
                            className={styles.viewBtn}
                            onClick={() => {
                              if (lecture.quiz_id) {
                                setEditingQuizId(lecture.quiz_id);
                              } else {
                                alert("Quiz ID missing from data.");
                              }
                            }}
                          >
                            <Eye size={16} /> View Quiz
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateAssessment(lecture.id, 'quiz')}
                          disabled={generatingQuizId === lecture.id || lecture.quiz_status === 'generating'}
                          className={styles.generateBtn}
                        >
                          {generatingQuizId === lecture.id || lecture.quiz_status === 'generating' ? (
                            <><Loader2 size={16} className={styles.spin} /> Generating...</>
                          ) : (
                            <><Sparkles size={16} /> Create Quiz</>
                          )}
                        </button>
                      )}
                    </td>
                  )}

                  {/* ASSIGNMENT ACTIONS */}
                  {!isQuizOnly && (
                    <td style={{ textAlign: 'center' }}>
                      {(lecture.assignment_id || (lecture.assignment_data && Object.keys(lecture.assignment_data).length > 0)) ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          {/* Added Status Pill Here */}
                          {renderStatusPill(lecture.assignment_status)}
                          <button
                            className={styles.viewBtn}
                            style={{ 
                              background: '#f5f3ff', 
                              color: '#8b5cf6', 
                              borderColor: '#ddd6fe' 
                            }}
                            onClick={() => {
                              if (lecture.assignment_id) {
                                setEditingAssignmentId(lecture.assignment_id);
                              } else {
                                alert("Assignment ID missing from data.");
                              }
                            }}
                          >
                            <FileCheck size={16} /> View Assignment
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateAssessment(lecture.id, 'assignment')}
                          disabled={generatingAssignmentId === lecture.id || lecture.assignment_status === 'generating'}
                          className={styles.generateBtn}
                          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                        >
                          {generatingAssignmentId === lecture.id || lecture.assignment_status === 'generating' ? (
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
                    No validated lectures found.
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
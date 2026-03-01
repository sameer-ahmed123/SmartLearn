import { useState } from "react";
import { Sparkles, FileCheck, PlayCircle, Eye, Loader2, BookOpen } from "lucide-react";
import apiClient from "../../../api/apiClient";
import QuizEditorModal from "./QuizEditorModal";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lectures: any[];
  onRefresh: () => void; 
}

const AssessmentList = ({ lectures, onRefresh }: AssessmentProps) => {
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  const ValidatedLectures = lectures.filter(
    (l) => l.validation_status === "validated"
  );

  const handleGenerateQuiz = async (lectureId: number) => {
    setGeneratingId(lectureId);
    try {
      await apiClient.post("/assessments/generate/", {
        lecture_id: lectureId,
        type: "quiz",
      });
      console.log("Quiz Generation Started!");
      onRefresh();
    } catch (error) {
      console.error("Gen failed", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className={styles.assessmentWrapper}>
      <div className={styles.tableCard}>
        <table className={styles.modernTable}>
          <thead>
            <tr>
              <th><BookOpen size={16} className={styles.headerIcon} /> Lecture Topic</th>
              <th>Status</th>
              <th className={styles.centerAlign}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ValidatedLectures.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyRow}>
                  No validated lectures available for quiz generation.
                </td>
              </tr>
            ) : (
              ValidatedLectures.map((lecture) => (
                <tr key={lecture.id}>
                  <td className={styles.topicCell}>
                    <span className={styles.topicName}>{lecture.topic}</span>
                  </td>
                  <td>
                    {lecture.quiz_data ? (
                      <span className={styles.badgeSuccess}>
                        <FileCheck size={14} /> Ready
                      </span>
                    ) : generatingId === lecture.id ? (
                      <span className={styles.badgeProcessing}>
                        <Loader2 size={14} className={styles.spin} /> AI Generating...
                      </span>
                    ) : (
                      <span className={styles.badgeNone}>No Quiz Yet</span>
                    )}
                  </td>
                  <td className={styles.centerAlign}>
                    {lecture.quiz_data ? (
                      <button
                        className={styles.viewBtn}
                        onClick={() => setEditingQuizId(lecture.quiz_id)}
                      >
                        <Eye size={16} /> View & Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateQuiz(lecture.id)}
                        disabled={generatingId === lecture.id}
                        className={styles.generateBtn}
                      >
                        {generatingId === lecture.id ? (
                          "Processing..."
                        ) : (
                          <>
                            <Sparkles size={16} />  Create AI Quiz
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingQuizId && (
        <QuizEditorModal
          isOpen={true}
          quizId={editingQuizId}
          onClose={() => setEditingQuizId(null)}
          onSaveSuccess={() => {
            onRefresh(); 
          }}
        />
      )}
    </div>
  );
};

export default AssessmentList;
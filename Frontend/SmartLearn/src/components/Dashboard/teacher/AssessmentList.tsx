import { useState } from "react";
import apiClient from "../../../api/apiClient";
import QuizEditorModal from "./QuizEditorModal";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lectures: any[];
  onRefresh: () => void; // Callback to refresh data after generation
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
      // CALL YOUR NEW ENDPOINT
      await apiClient.post("/assessments/generate/", {
        lecture_id: lectureId,
        type: "quiz",
      });
      console.log("Quiz Generation Started! Check back in a moment.");
      onRefresh();
    } catch (error) {
      console.error("Gen failed", error);
      console.log("Failed to start generation.");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Lecture Topic</th>
            <th>Quiz Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ValidatedLectures.map((lecture) => (
            <tr key={lecture.id}>
              <td>{lecture.topic}</td>
              <td>
                {lecture.quiz_data ? (
                  <span className={styles.badgeSuccess}>Generated</span>
                ) : generatingId === lecture.id ? (
                  <span className={styles.badgePending}>Processing...</span>
                ) : (
                  <span className={styles.badgePending}>None</span>
                )}
              </td>
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
                    onClick={() => handleGenerateQuiz(lecture.id)}
                    disabled={generatingId === lecture.id}
                    className={styles.generateBtn}
                  >
                    {generatingId === lecture.id
                      ? "Generating..."
                      : "✨ Create Quiz"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingQuizId && (
        <QuizEditorModal
          isOpen={true} // <--- FIXED: Always true if the ID exists
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

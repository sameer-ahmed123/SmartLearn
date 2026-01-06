import { useState } from "react";
import apiClient from "../../../api/apiClient";
import styles from "./AssessmentList.module.css";

interface AssessmentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lectures: any[];
  onRefresh: () => void; // Callback to refresh data after generation
}

const AssessmentList = ({ lectures, onRefresh }: AssessmentProps) => {
  const [generatingId, setGeneratingId] = useState<number | null>(null);

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
          {lectures.map((lecture) => (
            <tr key={lecture.id}>
              <td>{lecture.topic}</td>
              <td>
                {/* Check if quiz_data exists (You might need to update your serializer to include 'has_quiz') */}
                {lecture.quiz_data ? (
                  <span className={styles.badgeSuccess}>Generated</span>
                ) : (
                  <span className={styles.badgePending}>None</span>
                )}
              </td>
              <td>
                {lecture.quiz_data ? (
                  <button className={styles.viewBtn}>View Quiz</button>
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
    </div>
  );
};

export default AssessmentList;

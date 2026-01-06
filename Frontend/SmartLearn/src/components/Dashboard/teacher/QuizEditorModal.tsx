import { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient";
import styles from "./QuizEditorModal.module.css";
import type { Question } from "@/types/Assesment/Types";

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: number | null;
  onSaveSuccess: () => void;
}

const QuizEditorModal = ({
  isOpen,
  onClose,
  quizId,
  onSaveSuccess,
}: QuizEditorModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 1. Fetch Data when modal opens
  useEffect(() => {
    if (isOpen && quizId) {
      setLoading(true);
      apiClient
        .get(`/assessments/quiz/${quizId}/`)
        .then((res) => {
          setQuestions(res.data.quiz_data || []);
        })
        .catch((err) => {
          console.error("Failed to load quiz", err);
          alert("Could not load quiz data");
          onClose();
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, quizId, onClose]);

  // 2. Handle Text Changes (Question or Option)
  const handleQuestionChange = (
    index: number,
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    optionIndex?: number
  ) => {
    const updated = [...questions];
    if (field === "text") {
      updated[index].question_text = value;
    } else if (field === "option" && typeof optionIndex === "number") {
      updated[index].options[optionIndex] = value;
    } else if (field === "correct") {
      updated[index].correct_index = value;
    }
    setQuestions(updated);
  };

  // 3. Save Changes
  const handleSave = async () => {
    if (!quizId) return;
    setSaving(true);
    setSuccessMessage("");
    try {
      await apiClient.put(`/assessments/quiz/${quizId}/`, {
        quiz_data: questions,
      });
      setSuccessMessage("Quiz saved successfully!");
      onSaveSuccess();
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Edit Quiz Content</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <p>Loading questions...</p>
          ) : (
            questions.map((q, qIndex) => (
              <div key={qIndex} className={styles.questionCard}>
                <div className={styles.cardHeader}>Question {qIndex + 1}</div>

                {/* Question Text */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Question Text</label>
                  <textarea
                    className={styles.textArea}
                    value={q.question_text}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "text", e.target.value)
                    }
                  />
                </div>

                {/* Options */}
                <label className={styles.label}>
                  Options (Select the correct answer)
                </label>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className={styles.optionRow}>
                    <input
                      type="radio"
                      name={`q-${qIndex}`}
                      checked={q.correct_index === optIndex}
                      onChange={() =>
                        handleQuestionChange(qIndex, "correct", optIndex)
                      }
                      className={styles.radio}
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "option",
                          e.target.value,
                          optIndex
                        )
                      }
                      className={styles.optionInput}
                    />
                    {q.correct_index === optIndex && (
                      <span className={styles.correctLabel}>
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizEditorModal;

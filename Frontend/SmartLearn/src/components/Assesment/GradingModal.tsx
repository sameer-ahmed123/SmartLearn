import React, { useEffect, useState, useRef } from "react";
import { X, Save, Award, FileText, ClipboardList } from "lucide-react";
import styles from "./GradingModal.module.css";
import apiClient from "@/api/apiClient";
import { renderAsync } from "docx-preview";

interface GradingModalProps {
  submission: any;
  totalMarks: number;
  type: "assignment" | "quiz";
  onClose: () => void;
  onSave: (updatedSubmission: any) => void;
}

const GradingModal = ({
  submission,
  totalMarks,
  type,
  onClose,
  onSave,
}: GradingModalProps) => {
  const total = totalMarks || 1;
  const initialPoints =
    type === "quiz"
      ? Math.round((submission.score / 100) * total)
      : submission.score;

  const [newScore, setNewScore] = useState(initialPoints);
  const [saving, setSaving] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null); // For .txt files
  const [loading, setLoading] = useState(true);

  const docxRef = useRef<HTMLDivElement>(null);

  const getFileUrl = (file: string) => {
    if (!file) return "";
    if (file.startsWith("http")) return file;
    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanFilePath = file.startsWith("/") ? file : "/" + file;
    return `${cleanBaseUrl}${cleanFilePath}`;
  };

  const finalFileUrl = getFileUrl(
    submission.file_upload || submission.submission_file,
  );
  
  const fileExt = finalFileUrl?.toLowerCase().split('.').pop();
  const isDocx = fileExt === "docx";
  const isTxt = fileExt === "txt";

  useEffect(() => {
    let currentBlobUrl: string | null = null;

    const loadContent = async () => {
      if (type === "quiz" || !finalFileUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setTextContent(null);

        // If it's a TXT file, we handle it as text immediately
        if (isTxt) {
          const response = await apiClient.get(finalFileUrl, { responseType: "text" });
          setTextContent(response.data);
        } else {
          // Handle PDF or DOCX as Blobs
          const response = await apiClient.get(finalFileUrl, { responseType: "blob" });
          const mimeType = isDocx 
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            : "application/pdf";
          
          const blob = new Blob([response.data], { type: mimeType });

          if (isDocx) {
            if (docxRef.current) {
              docxRef.current.innerHTML = "";
              await renderAsync(blob, docxRef.current);
            }
          } else {
            currentBlobUrl = URL.createObjectURL(blob);
            setBlobUrl(currentBlobUrl);
          }
        }
      } catch (err) {
        console.error("Content loading failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    return () => {
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    };
  }, [finalFileUrl, type, isDocx, isTxt]);

  const handleUpdateGrade = async () => {
    setSaving(true);
    try {
      const endpoint =
        type === "quiz"
          ? `/assessments/quiz-submissions/${submission.id}/update-score/`
          : `/assessments/submissions/${submission.id}/update-score/`;

      const finalValue = type === "quiz" ? (newScore / total) * 100 : newScore;
      const response = await apiClient.patch(endpoint, { score: finalValue });

      onSave(response.data);
      alert("Grade updated successfully!");
      onClose();
    } catch (err) {
      console.error("Override Error:", err);
      alert("Failed to update grade.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h3>
              {type === "quiz" ? <ClipboardList size={20} /> : <FileText size={20} />}
              Reviewing: {submission.student_name || "Student"}
            </h3>
            <span className={styles.subHeader}>{submission.email}</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.splitView}>
          <div className={styles.docViewer}>
            {loading && (
              <div className={styles.loadingPlaceholder}>
                <div className={styles.spinner}></div>
                <p>Preparing Content...</p>
              </div>
            )}

            {type === "quiz" ? (
              <div className={styles.quizReview}>
                <div className={styles.quizHeader}>
                  <ClipboardList size={24} className={styles.headerIcon} />
                  <h4>Attempt Details</h4>
                </div>
                <div className={styles.answersList}>
                  {submission.answers && submission.answers.length > 0 ? (
                    submission.answers.map((item: any, index: number) => (
                      <div key={index} className={styles.answerCard}>
                        <div className={styles.questionNum}>Question {index + 1}</div>
                        <p className={styles.questionText}>{item.question_text}</p>
                        <div className={styles.answerComparison}>
                          <div className={styles.studentAnswer}>
                            <span>Student Answer:</span>
                            <p className={item.is_correct ? styles.correct : styles.incorrect}>
                              {item.student_answer}
                            </p>
                          </div>
                          {!item.is_correct && (
                            <div className={styles.correctAnswer}>
                              <span>Correct Answer:</span>
                              <p>{item.correct_answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>No detailed answers recorded.</div>
                  )}
                </div>
              </div>
            ) : isDocx ? (
              <div ref={docxRef} className={styles.docxWrapper} />
            ) : isTxt ? (
              <div className={styles.txtWrapper}>
                <pre>{textContent}</pre>
              </div>
            ) : blobUrl ? (
              <embed
                src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH`}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            ) : (
              !loading && <div className={styles.errorState}>No viewable content found.</div>
            )}
          </div>

          <div className={styles.gradingPanel}>
            <div className={styles.section}>
              <h4><Award size={18} /> Feedback</h4>
              <div className={styles.aiFeedbackBox}>
                {submission.feedback || "No feedback available."}
              </div>
            </div>

            <div className={styles.overrideSection}>
              <h4>{type === "quiz" ? "Quiz Manual Override" : "Teacher Override"}</h4>
              <div className={styles.inputGroup}>
                <label>Final Score (Max: {totalMarks})</label>
                <div className={styles.scoreInputWrapper}>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    max={totalMarks}
                    className={styles.scoreInput}
                  />
                  <span className={styles.maxMarkLabel}>/ {totalMarks}</span>
                </div>
              </div>
              <button onClick={handleUpdateGrade} className={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Confirm & Verify Grade"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingModal;
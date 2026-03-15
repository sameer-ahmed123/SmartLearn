import React, { useEffect, useState } from "react";
import { X, Save, Award } from "lucide-react";
import styles from "./GradingModal.module.css";
import apiClient from "@/api/apiClient";

interface GradingModalProps {
  submission: any;
  totalMarks: number;
  onClose: () => void;
  onSave: (updatedSubmission: any) => void;
}

const GradingModal = ({
  submission,
  totalMarks,
  onClose,
  onSave,
}: GradingModalProps) => {
  const [newScore, setNewScore] = useState(submission.score || 0);
  const [saving, setSaving] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // 1. Define the URL helper
  const getFileUrl = (file: string) => {
    if (!file) return "";
    if (file.startsWith("http")) return file;

    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanFilePath = file.startsWith("/") ? file : "/" + file;

    return `${cleanBaseUrl}${cleanFilePath}`;
  };

  const finalFileUrl = getFileUrl(
    submission.file_upload || submission.submission_file
  );

  // 2. Manage the PDF Loading Logic (Blob Strategy)
  useEffect(() => {
    let currentBlobUrl: string | null = null;

    const loadPdf = async () => {
      if (!finalFileUrl) return;
      try {
        // Fetching via apiClient ensures Auth Headers are sent
        const response = await apiClient.get(finalFileUrl, {
          responseType: "blob",
        });
        
        currentBlobUrl = URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        setBlobUrl(currentBlobUrl);
      } catch (err) {
        console.error("Blob loading failed", err);
      }
    };

    loadPdf();

    // Cleanup: Revoke the URL when the component unmounts
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [finalFileUrl]);

  const handleUpdateGrade = async () => {
    setSaving(true);
    try {
      const response = await apiClient.patch(
        `/assessments/submissions/${submission.id}/update-score/`,
        { score: newScore }
      );

      onSave(response.data);
      alert("Grade updated and verified!");
      onClose();
    } catch (err) {
      console.error("Override Error:", err);
      alert("Failed to update grade. Check backend action.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h3>Reviewing: {submission.student_name || "Student"}</h3>
            <span className={styles.subHeader}>{submission.email}</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.splitView}>
          {/* Left: Document Viewer */}
          <div className={styles.docViewer}>
            {blobUrl ? (
              <embed
                src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH`}
                type="application/pdf"
                width="100%"
                height="100%"
                className={styles.iframe}
              />
            ) : (
              <div className={styles.loadingPlaceholder}>
                <div className={styles.spinner}></div>
                <p>Loading Secure Document...</p>
              </div>
            )}
          </div>

          {/* Right: Grading Panel */}
          <div className={styles.gradingPanel}>
            <div className={styles.section}>
              <h4>
                <Award size={18} /> AI Feedback & Analysis
              </h4>
              <div className={styles.aiFeedbackBox}>
                {submission.feedback || "No AI feedback available for this submission."}
              </div>
            </div>

            <div className={styles.overrideSection}>
              <h4>Teacher Override</h4>
              <p className={styles.instruction}>
                Review the work and AI feedback, then enter the final marks below.
              </p>

              <div className={styles.inputGroup}>
                <label>Final Score (Max: {totalMarks})</label>
                <div className={styles.scoreInputWrapper}>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    max={totalMarks}
                    min={0}
                    className={styles.scoreInput}
                  />
                  <span className={styles.maxMarkLabel}>/ {totalMarks}</span>
                </div>
              </div>

              <button
                onClick={handleUpdateGrade}
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving ? "Updating..." : (
                  <>
                    <Save size={18} /> Confirm & Verify Grade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingModal;
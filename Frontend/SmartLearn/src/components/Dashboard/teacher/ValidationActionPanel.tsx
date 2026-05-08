import React, { useState } from "react";
import styles from "./ValidationActionPanel.module.css";
import apiClient from "@/api/apiClient";
import { CheckCircle, XCircle, MessageSquare, ShieldAlert, Loader2 } from "lucide-react";

interface ValidationActionPanelProps {
  lectureId: number;
}

const ValidationActionPanel: React.FC<ValidationActionPanelProps> = ({
  lectureId,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidationAction = async (status: "validated" | "rejected") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.patch(
        `/lectures/${lectureId}/validate/`,
        {
          validation_status: status,
          rejection_comment: status === "rejected" ? comment : null,
        }
       
      );
       

      if (response.status === 200) {
        // Success notification logic remains same as per your original code
        window.location.href = "/teacher/dashboard";
      } else {
        alert(`Error submitting validation: ${response.status}`);
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Validation API error:", error);
      alert("An unknown error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.actionPanel}>
      <div className={styles.panelHeader}>
        <ShieldAlert size={20} className={styles.headerIcon} />
        <h3>Validation Decision</h3>
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.labelGroup}>
          <MessageSquare size={14} />
          <label>Review Feedback</label>
        </div>
        <textarea
          placeholder="Why are you approving or rejecting this content?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={styles.commentInput}
        />
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => handleValidationAction("rejected")}
          className={styles.rejectBtn}
          disabled={isSubmitting || comment.trim().length === 0}
        >
          {isSubmitting ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <XCircle size={18} />
          )}
          <span>Reject</span>
        </button>

        <button
          onClick={() => handleValidationAction("validated")}
          className={styles.approveBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span>Approve</span>
        </button>
      </div>
      
      <p className={styles.footerNote}>
        * Rejecting requires a detailed feedback comment.
      </p>
    </div>
  );
};

export default ValidationActionPanel;
import React, { useState } from "react";
import styles from "./ValidationActionPanel.module.css";
import apiClient from "@/api/apiClient";

interface ValidationActionPanelProps {
  lectureId: number;
}

const ValidationActionPanel: React.FC<ValidationActionPanelProps> = ({
  lectureId,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NOTE: In the future, this will be a POST/PATCH request to update the validation_status
  const handleValidationAction = async (status: "validated" | "rejected") => {
    setIsSubmitting(true);
    console.log(`Submitting status: ${status}, Comment: ${comment}`);
    try {
      const response = await apiClient.patch(
        `/lectures/${lectureId}/validate/`,
        {
          validation_status: status,
          rejection_comment: status === "rejected" ? comment : null,
        }
      );

      if (response.status === 200) {
        alert(`Lecture ${status} successfully!`);
        // Redirect user back to the dashboard queue after success
        window.location.href = "/teacher/dashboard";
      } else {
        alert(`Error submitting validation: ${response.status}`);
      }
    } catch (error) {
      console.error("Validation API error:", error);
      alert("An unknown error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.panel}>
      <h3>Validation Decision</h3>

      {/* Rejection Comment Input (required only if rejecting) */}
      <textarea
        placeholder="Enter rejection reason here (required if rejecting)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className={styles.commentInput}
      />

      <div className={styles.buttonGroup}>
        <button
          onClick={() => handleValidationAction("rejected")}
          className={styles.rejectButton}
          disabled={isSubmitting || comment.trim().length === 0}
        >
          {isSubmitting ? "Rejecting..." : "Reject Lecture"}
        </button>

        <button
          onClick={() => handleValidationAction("validated")}
          className={styles.validateButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Validating..." : "Approve & Validate"}
        </button>
      </div>
      <p className={styles.note}>Note: Rejecting requires a comment.</p>
    </div>
  );
};

export default ValidationActionPanel;

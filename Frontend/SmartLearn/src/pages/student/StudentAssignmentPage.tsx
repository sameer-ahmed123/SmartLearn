import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  ClipboardList,
  Star,
  AlertCircle,
  Loader2,
  Award,
  Clock,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./StudentAssignmentPage.module.css";

const StudentAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await apiClient.get(`/assessments/assignment/${id}/`);
      setAssignment(res.data);
    } catch (err: any) {
      console.error("Fetch error:", err.response?.data || err);
      alert("Could not load assignment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const deadlineDate = assignment?.deadline
    ? new Date(assignment.deadline)
    : null;

  const isLate = deadlineDate ? new Date() > deadlineDate : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLate) return;

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (isLate) {
      alert("The deadline has passed. Submissions are closed.");
      return;
    }

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".doc")) {
      alert("Legacy file type, please upload a .docx, .pdf or .txt file.");
      return;
    }

    if (
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".docx") &&
      !fileName.endsWith(".txt")
    ) {
      alert("Invalid file type. Please upload a PDF, DOCX or TXT file.");
      return;
    }

    const formData = new FormData();
    formData.append("file_upload", file);

    setSubmitting(true);

    try {
      const response = await apiClient.post(
        `/assessments/assignment/${id}/submit/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Submit response:", response.data);

      alert("Assignment submitted successfully!");

      setFile(null);

      await fetchAssignmentDetails();
    } catch (err: any) {
      console.error("Submission error:", err.response?.data || err);

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.file_upload?.[0] ||
        "Failed to submit assignment.";

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading Assignment...</p>
      </div>
    );
  }

  const data = assignment?.assignment_data;

  const totalMarks =
    data?.rubric?.reduce(
      (acc: number, item: any) => acc + (Number(item.points) || 0),
      0
    ) || 0;

  const submission = assignment?.user_submission;

  const hasScore =
    submission && submission.score !== null && submission.score !== undefined;

  const scorePercentage =
    hasScore && totalMarks > 0 ? (submission.score / totalMarks) * 100 : 0;

  return (
    <div className={styles.pageContainer}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className={styles.layoutGrid}>
        <div className={styles.infoColumn}>
          <div className={styles.mainCard}>
            <div className={styles.headerArea}>
              <div>
                <h1 className={styles.title}>
                  {data?.title || "Untitled Assignment"}
                </h1>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <span className={styles.typeTag}>
                    {data?.submission_type === "softcopy"
                      ? "Online Submission"
                      : "In-Person Submission"}
                  </span>

                  <span
                    className={`${styles.typeTag} ${
                      isLate ? styles.lateTag : styles.activeTag
                    }`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Clock size={12} />
                    {isLate
                      ? "Closed"
                      : `Due: ${
                          deadlineDate?.toLocaleString() || "No Deadline"
                        }`}
                  </span>
                </div>
              </div>

              <div className={styles.totalPointsBadge}>
                <span className={styles.pointsLabel}>Total Marks</span>
                <span className={styles.pointsValue}>{totalMarks}</span>
              </div>
            </div>

            {hasScore && (
              <div className={styles.resultCard}>
                
                {/* 🔥 PLAGIARISM WARNING BANNER ADDED HERE */}
                {submission.is_plagiarized && (
                  <div style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #ef4444', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <AlertCircle size={20} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ color: '#b91c1c', margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '1rem' }}>
                        Plagiarism / AI Content Detected ({submission.plagiarism_percentage}%)
                      </h4>
                      <p style={{ color: '#7f1d1d', margin: 0, fontSize: '0.875rem', lineHeight: '1.4' }}>
                        Strict Policy Alert: Specific tasks or answers flagged with high plagiarism or AI generation have been graded as 0 marks.
                      </p>
                    </div>
                  </div>
                )}

                <div className={styles.resultHeader}>
                  <Award size={24} color="#10b981" />
                  <h3>AI Grading Results</h3>
                </div>

                <div className={styles.scoreRow}>
                  <p className={styles.obtainedText}>
                    Obtained Marks: <strong>{submission.score}</strong> /{" "}
                    {totalMarks}
                  </p>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${scorePercentage}%`,
                      }}
                    />
                  </div>
                </div>

                {submission.feedback && (
                  <div className={styles.feedbackBox}>
                    <strong>Feedback:</strong>
                    <p>"{submission.feedback}"</p>
                  </div>
                )}
              </div>
            )}

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <ClipboardList size={20} className={styles.icon} />
                <h3>Specific Tasks</h3>
              </div>

              <ul className={styles.taskList}>
                {data?.tasks?.map((task: string, index: number) => (
                  <li key={index} className={styles.taskItem}>
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Star size={20} className={styles.icon} />
                <h3>Grading Rubric</h3>
              </div>

              <div className={styles.rubricBox}>
                {data?.rubric?.map((item: any, index: number) => (
                  <div key={index} className={styles.rubricRow}>
                    <span className={styles.criterion}>{item.criterion}</span>
                    <span className={styles.points}>{item.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionColumn}>
          <div
            className={`${styles.uploadCard} ${
              isLate ? styles.lockedCard : ""
            }`}
          >
            <h3>
              {isLate
                ? "Submissions Closed"
                : submission
                ? "Update Submission"
                : "Submit Assignment"}
            </h3>

            <p className={styles.subText}>
              {isLate
                ? "The deadline for this assignment has passed."
                : "Supported formats: PDF, DOCX, TXT"}
            </p>

            <div
              className={`
                ${styles.dropZone}
                ${file ? styles.activeZone : ""}
                ${submission ? styles.alreadySubmitted : ""}
                ${isLate ? styles.lateZone : ""}
              `}
            >
              <input
                type="file"
                id="assignment-file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                disabled={isLate || submitting}
              />

              <label
                htmlFor="assignment-file"
                className={styles.uploadLabel}
                style={{
                  cursor: isLate || submitting ? "not-allowed" : "pointer",
                }}
              >
                {isLate ? (
                  <Clock size={48} color="#FF746C" />
                ) : submission && !file ? (
                  <CheckCircle size={48} className={styles.successIcon} />
                ) : file ? (
                  <CheckCircle size={48} className={styles.successIcon} />
                ) : (
                  <Upload size={48} className={styles.uploadIcon} />
                )}

                <span className={styles.fileName}>
                  {isLate
                    ? "Submission period ended"
                    : file
                    ? file.name
                    : submission
                    ? "File submitted. Click to replace it."
                    : "Choose a file"}
                </span>
              </label>
            </div>

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!file || submitting || isLate}
              style={
                isLate
                  ? { background: "#94a3b8", cursor: "not-allowed" }
                  : {}
              }
            >
              {isLate
                ? "Closed"
                : submitting
                ? "Submitting..."
                : submission
                ? "Re-submit Work"
                : "Submit My Work"}
            </button>

            <div className={styles.warningNote}>
              <AlertCircle size={14} />
              <span>
                {isLate
                  ? "You can no longer submit work for this lecture."
                  : "AI will grade your work immediately after upload."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentPage;
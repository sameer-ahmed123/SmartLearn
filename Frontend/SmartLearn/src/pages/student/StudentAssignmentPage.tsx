import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
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

  useEffect(() => {
    if (id) {
      fetchAssignmentDetails();
    }
  }, [id]);

  const fetchAssignmentDetails = () => {
    setLoading(true);
    apiClient
      .get(`/assessments/assignment/${id}/`)
      .then((res) => {
        setAssignment(res.data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        alert("Could not load assignment details.");
      })
      .finally(() => setLoading(false));
  };

  // --- DEADLINE LOGIC ---
  const deadlineDate = assignment?.deadline
    ? new Date(assignment.deadline)
    : null;
  const isLate = deadlineDate ? new Date() > deadlineDate : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLate) return; // Prevention
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (isLate) {
      alert("The deadline has passed. Submissions are closed.");
      return;
    }
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    if (file.name.toLowerCase().endsWith(".doc")) {
      alert("Legacy file type, please upload a .docx, pdf or txt file");
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
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      alert("Assignment submitted and graded by AI!");

      if (response.data.submission) {
        setAssignment((prev: any) => ({
          ...prev,
          user_submission: response.data.submission,
        }));
      } else {
        fetchAssignmentDetails();
      }
      setFile(null);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit assignment.");
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
      0,
    ) || 0;
  const submission = assignment?.user_submission;
  const hasScore =
    submission && submission.score !== null && submission.score !== undefined;

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
                  {/* Deadline Badge */}
                  <span
                    className={`${styles.typeTag} ${isLate ? styles.lateTag : styles.activeTag}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Clock size={12} />
                    {isLate
                      ? "Closed"
                      : `Due: ${deadlineDate?.toLocaleString() || "No Deadline"}`}
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
                        width: `${(submission.score / totalMarks) * 100}%`,
                      }}
                    ></div>
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
            className={`${styles.uploadCard} ${isLate ? styles.lockedCard : ""}`}
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
                : "Supported formats: PDF, DOCX"}
            </p>

            {/* --- MODIFIED DROPZONE --- */}
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
                disabled={isLate} // Disable Input
              />
              <label
                htmlFor="assignment-file"
                className={styles.uploadLabel}
                style={{ cursor: isLate ? "not-allowed" : "pointer" }}
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
                        ? "File submitted (Click to change)"
                        : "Choose a file"}
                </span>
              </label>
            </div>

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!file || submitting || isLate} // Disable Button
              style={
                isLate ? { background: "#94a3b8", cursor: "not-allowed" } : {}
              }
            >
              {isLate
                ? "Closed"
                : submitting
                  ? "AI is Grading..."
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

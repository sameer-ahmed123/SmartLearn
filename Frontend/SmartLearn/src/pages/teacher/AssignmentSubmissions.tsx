import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Paperclip,
  Sparkles,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import GradingModal from "@/components/Assesment/GradingModal"; // Import the new modal we discussed
import styles from "./AssignmentSubmission.module.css";

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignmentMeta, setAssignmentMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSubmissionData();
  }, [id]);

  const fetchSubmissionData = async () => {
    if (!id || id === "undefined") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/assessments/lecture/${id}/submissions/`,
      );
      setSubmissions(response.data.submissions || []);
      setAssignmentMeta(response.data.assignment || null);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (sub: any) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleUpdateList = (updatedSub: any) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)),
    );
  };

  const getStudentDisplayName = (sub: any) => {
    return (
      sub.student_name || sub.email || sub.username || `Student #${sub.user}`
    );
  };

  const filteredSubmissions = submissions.filter((s) => {
    const name = getStudentDisplayName(s).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const totalMarks =
    assignmentMeta?.rubric?.reduce(
      (acc: number, item: any) => acc + (Number(item.points) || 0),
      0,
    ) || 0;

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Loader2 size={40} className="animate-spin" />
        <p>Loading Submissions...</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backLink}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className={styles.mainTitle}>
          <h1>{assignmentMeta?.title || "Assignment Submissions"}</h1>
          <p className={styles.subtitle}>
            Lecture ID: {id} • Total Submissions:{" "}
            <strong>{submissions.length}</strong>
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.miniStatCard}>
          <div className={`${styles.iconBox} ${styles.pendingIcon}`}>
            <Clock size={20} />
          </div>
          <div>
            <label>Pending Reviews</label>
            <h3>{submissions.filter((s) => !s.is_graded).length}</h3>
          </div>
        </div>
        <div className={styles.miniStatCard}>
          <div className={`${styles.iconBox} ${styles.successIcon}`}>
            <CheckCircle size={20} />
          </div>
          <div>
            <label>Graded & Verified</label>
            <h3>{submissions.filter((s) => s.is_graded).length}</h3>
          </div>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by student name..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Submitted Date</th>
              <th>Work Attachment</th>
              <th>Status</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => {
                const isVerified = sub.is_overridden; // Teacher manually changed it
                const isGraded = sub.score !== null && sub.score !== undefined;

                return (
                  <tr key={sub.id}>
                    <td>
                      <div className={styles.studentInfo}>
                        <div className={styles.avatar}>
                          <User size={16} />
                        </div>
                        <span>{getStudentDisplayName(sub)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        <Calendar size={14} style={{ marginRight: "6px" }} />
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {sub.file_upload ? (
                        <button
                          onClick={() => handleOpenReview(sub)}
                          className={styles.reviewButton}
                        >
                          <FileText size={16} /> Review & Grade
                        </button>
                      ) : (
                        <span className={styles.noFile}>
                          <Paperclip size={14} /> No file
                        </span>
                      )}
                    </td>
                    <td>
                      {isVerified ? (
                        <span
                          className={`${styles.badge} ${styles.badgeVerified}`}
                        >
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : isGraded ? (
                        <span className={`${styles.badge} ${styles.badgeAI}`}>
                          <Sparkles size={12} /> AI Graded
                        </span>
                      ) : (
                        <span
                          className={`${styles.badge} ${styles.badgeWarning}`}
                        >
                          Pending
                        </span>
                      )}
                    </td> 
                    <td>
                      <span className={styles.gradeValue}>
                        {isGraded ? `${sub.score}/${totalMarks}` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL INTEGRATION */}
      {isModalOpen && selectedSubmission && (
        <GradingModal
          submission={selectedSubmission}
          totalMarks={totalMarks}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateList}
        />
      )}
    </div>
  );
};

export default AssignmentSubmission;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, User, Calendar, 
  CheckCircle, Clock, Loader2, FileDown, Paperclip 
} from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./AssignmentSubmission.module.css";

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignmentMeta, setAssignmentMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!id || id === "undefined") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/assessments/lecture/${id}/submissions/`);
        setSubmissions(response.data.submissions || []);
        setAssignmentMeta(response.data.assignment || null);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [id]);

  const getStudentDisplayName = (sub: any) => {
    if (sub.student_name && sub.student_name.trim() !== "") {
      return sub.student_name;
    }
    if (sub.email) {
      return sub.email;
    }
    if (sub.username) {
      return sub.username;
    }
    return `Student #${sub.user}`;
  };

  const getFileUrl = (sub: any) => {
    const file = sub.file_upload || sub.submission_file || sub.file;
    if (!file) return null;
    if (file.startsWith('http')) return file;
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanFilePath = file.startsWith('/') ? file : '/' + file;
    
    return `${cleanBaseUrl}${cleanFilePath}`;
  };

  const filteredSubmissions = submissions.filter(s => {
    const name = getStudentDisplayName(s).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  // Shared Inline Styles for Dynamic Theme (Matches your working sample)
  const cardStyle = { 
    backgroundColor: 'var(--card, #ffffff)', 
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)' 
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <Loader2 size={40} className="animate-spin" />
      <p>Loading Submissions...</p>
    </div>
  );

  if (!id || id === "undefined") return (
    <div className={styles.loaderContainer}>
      <p>Error: Invalid Lecture URL.</p>
      <button onClick={() => navigate(-1)} className={styles.backLink}>Go Back</button>
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
            Lecture ID: {id} • Total Submissions: <strong>{submissions.length}</strong>
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.miniStatCard} style={cardStyle}>
          <div className={`${styles.iconBox} ${styles.pendingIcon}`}>
            <Clock size={20} />
          </div>
          <div>
            <label>Pending Reviews</label>
            <h3>{submissions.filter(s => !s.score && s.score !== 0).length}</h3>
          </div>
        </div>
        <div className={styles.miniStatCard} style={cardStyle}>
          <div className={`${styles.iconBox} ${styles.successIcon}`}>
            <CheckCircle size={20} />
          </div>
          <div>
            <label>Graded</label>
            <h3>{submissions.filter(s => s.score !== null && s.score !== undefined).length}</h3>
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
            style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard} style={cardStyle}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ color: 'var(--muted-foreground)' }}>Student Name</th>
              <th style={{ color: 'var(--muted-foreground)' }}>Submitted Date</th>
              <th style={{ color: 'var(--muted-foreground)' }}>Work Attachment</th>
              <th style={{ color: 'var(--muted-foreground)' }}>Status</th>
              <th style={{ color: 'var(--muted-foreground)' }}>Marks</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => {
                const finalFileUrl = getFileUrl(sub);
                const isGraded = sub.score !== null && sub.score !== undefined;
                const studentName = getStudentDisplayName(sub);

                return (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td>
                      <div className={styles.studentInfo}>
                        <div className={styles.avatar}><User size={16} /></div>
                        <span style={{ color: 'var(--foreground)' }}>{studentName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        <Calendar size={14} style={{ marginRight: '6px' }} />
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {finalFileUrl ? (
                        <a href={finalFileUrl} target="_blank" rel="noreferrer" className={styles.fileLink}>
                          <FileDown size={16} /> View Document
                        </a>
                      ) : (
                        <span className={styles.noFile}><Paperclip size={14} /> No file</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${isGraded ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {isGraded ? "Graded" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.gradeValue} style={{ color: 'var(--foreground)' }}>
                        {isGraded ? `${sub.score}` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyState}>No submissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentSubmission;
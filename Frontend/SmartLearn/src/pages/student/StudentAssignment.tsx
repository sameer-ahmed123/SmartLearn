import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Clock, CheckCircle, 
  Upload, Eye, Calendar, BookOpen, Star, Loader2
} from "lucide-react"; 
import apiClient from "@/api/apiClient"; // Aapka api client
import styles from "./StudentAssignment.module.css";

const StudentAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, graded: 0 });

  useEffect(() => {
    const fetchStudentAssignments = async () => {
      try {
        setLoading(true);
        // Backend endpoint jo sirf enrolled aur published assignments dega
        const response = await apiClient.get("/assessments/student-assignments/");
        
        setAssignments(response.data.assignments);
        // Stats update karein backend data ke mutabiq
        setStats(response.data.stats); 
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAssignments();
  }, []);

  const handleViewAssignment = (id: number) => {
    navigate(`/student/lecture/${id}/assignment`);
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} />
        <p>Fetching your assignments...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* BANNER */}
      <div className={styles.assignBanner}>
        <div>
          <h2 className={styles.bannerTitle}>My Assignments</h2>
          <p style={{ opacity: 0.9, marginTop: '10px' }}>Upload your work and check teacher's feedback.</p>
        </div>
        <FileText size={120} className={styles.bgIcon} />
      </div>

      {/* STATS BOXES (Dynamic) */}
      <div className={styles.statsRow}>
        <StatCard icon={<BookOpen size={22} />} label="Total Tasks" value={stats.total} color="#0ea5e9" bg="rgba(14, 165, 233, 0.1)" />
        <StatCard icon={<CheckCircle size={22} />} label="Completed" value={stats.completed} color="#10b981" bg="rgba(16, 185, 129, 0.1)" />
        <StatCard icon={<Clock size={22} />} label="Pending" value={stats.pending} color="#f97316" bg="rgba(249, 115, 22, 0.1)" />
        <StatCard icon={<Star size={22} />} label="Graded" value={stats.graded} color="#8b5cf6" bg="rgba(139, 92, 246, 0.1)" />
      </div>

      <h2 className={styles.sectionTitle}>Recent Tasks</h2>
      
      <div className={styles.assignGrid}>
        {assignments.length === 0 ? (
          <p className={styles.noData}>No assignments found for your enrolled courses.</p>
        ) : (
          assignments.map((item) => (
            <div key={item.id} className={styles.assignCard}>
              <span className={`${styles.statusBadge} ${styles[item.status.toLowerCase()]}`}>
                {item.status}
              </span>

              <h3 className={styles.cardTitle}>{item.assignment_data.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.lecture_title}</p>

              <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                  <Calendar size={14} /> Due: <b>{new Date(item.deadline).toLocaleDateString()}</b>
                </div>
                
                {item.status === 'Pending' ? (
                  <button className={styles.submitBtn} onClick={() => handleViewAssignment(item.id)}>
                    <Upload size={16} /> Upload Work
                  </button>
                ) : item.status === 'Graded' ? (
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>Score: {item.score}</span>
                      <button className={styles.viewBtn} onClick={() => handleViewAssignment(item.id)}>
                        <Eye size={14} /> Review
                      </button>
                  </div>
                ) : (
                  <button className={styles.viewBtn} onClick={() => handleViewAssignment(item.id)}>
                    <CheckCircle size={16} /> Successfully Submitted
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Chota helper component for Stats
const StatCard = ({ icon, label, value, color, bg }: any) => (
  <div className={styles.statCardBox}>
    <div style={{ padding: '10px', borderRadius: '10px', background: bg, color: color }}>
      {icon}
    </div>
    <div className={styles.statTextContainer}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

export default StudentAssignment;
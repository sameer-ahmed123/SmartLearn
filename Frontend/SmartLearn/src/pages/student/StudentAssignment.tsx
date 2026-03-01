import { useState } from "react";
import { 
  FileText, Clock, CheckCircle, AlertCircle, 
  Upload, Eye, Calendar, BookOpen, Star
} from "lucide-react"; 
import styles from "./StudentAssignment.module.css";

const StudentAssignment = () => {
  const [assignments] = useState([
    { id: 1, title: "UI/UX Case Study", course: "Graphic Design", deadline: "Mar 10, 2026", status: "Pending", priority: "High" },
    { id: 2, title: "React Components Lab", course: "Web Development", deadline: "Mar 05, 2026", status: "Submitted", priority: "Normal" },
    { id: 3, title: "Final Research Paper", course: "Data Science", deadline: "Feb 25, 2026", status: "Graded", score: "A+", priority: "Normal" },
  ]);

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

      {/* STATS BOXES */}
      <div className={styles.statsRow}>
        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Total Tasks</p>
            <h3>12</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Completed</p>
            <h3>09</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Pending</p>
            <h3>03</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Star size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Graded</p>
            <h3>07</h3>
          </div>
        </div>
      </div>

      {/* LISTING */}
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }} className={styles.sectionTitle}>Recent Tasks</h2>
      
      <div className={styles.assignGrid}>
        {assignments.map((item) => (
          <div key={item.id} className={styles.assignCard}>
            <span className={`${styles.statusBadge} ${
              item.status === 'Pending' ? styles.pending : 
              item.status === 'Submitted' ? styles.submitted : styles.graded
            }`}>
              {item.status}
            </span>

            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.course}</p>

            <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                <Calendar size={14} /> Due: <b>{item.deadline}</b>
              </div>
              
              {item.status === 'Pending' ? (
                <button className={styles.submitBtn}>
                  <Upload size={16} /> Upload Work
                </button>
              ) : item.status === 'Graded' ? (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>Result: {item.score}</span>
                    <button className={styles.viewBtn} style={{ marginTop: 0, padding: '8px 15px' }}>
                      <Eye size={14} /> Review
                    </button>
                </div>
              ) : (
                <button className={styles.viewBtn}>
                  <CheckCircle size={16} /> Successfully Submitted
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignment;
import { useState } from "react";
import { 
  Trophy, Clock, BookOpen, CheckCircle, 
  Play, Timer, HelpCircle, ArrowRight, Star
} from "lucide-react"; 
import styles from "./StudentQuiz.module.css";

const StudentQuiz = () => {
  // Mock Data for Student
  const [quizzes] = useState([
    { id: 1, title: "Database Normalization", course: "DBMS", questions: 10, time: "15 min", status: 'Pending', deadline: "Today", type: "Urgent" },
    { id: 2, title: "Modern History Quiz", course: "History 101", questions: 20, time: "30 min", status: 'Pending', deadline: "Tomorrow", type: "Normal" },
    { id: 3, title: "React Lifecycle", course: "Web Dev", questions: 15, time: "20 min", status: 'Completed', score: "90%", deadline: "Passed", type: "Normal" },
  ]);

  return (
    <div className={styles.pageWrapper}>
      
      {/* BANNER */}
      <div className={styles.quizBanner}>
        <div>
          <h2 className={styles.bannerTitle}>My Quiz Portal</h2>
          <p style={{ opacity: 0.9, marginTop: '10px' }}>Test your knowledge and track your scores.</p>
        </div>
        <Trophy size={120} className={styles.bgIcon} />
      </div>

      {/* STATS BOXES */}
      <div className={styles.statsRow}>
        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Assigned</p>
            <h3>08</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Completed</p>
            <h3>05</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Star size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Avg. Score</p>
            <h3>88%</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Pending</p>
            <h3>03</h3>
          </div>
        </div>
      </div>

      {/* QUIZ LIST SECTION */}
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }} className={styles.sectionTitle}>Available Quizzes</h2>
      
      <div className={styles.quizGrid}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className={styles.quizCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span className={`${styles.tag} ${quiz.type === 'Urgent' ? styles.urgent : styles.normal}`}>
                {quiz.deadline}
              </span>
              {quiz.status === 'Completed' && (
                <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '700' }}>Score: {quiz.score}</span>
              )}
            </div>

            <h3 style={{ margin: '0 0 5px 0' }}>{quiz.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{quiz.course}</p>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <HelpCircle size={14} /> {quiz.questions} Questions
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <Timer size={14} /> {quiz.time}
              </div>
            </div>

            {quiz.status === 'Pending' ? (
              <button className={styles.startBtn}>
                <Play size={16} fill="white" /> Start Quiz
              </button>
            ) : (
              <div className={styles.completedBtn}>
                <CheckCircle size={16} /> Result Viewed
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentQuiz;
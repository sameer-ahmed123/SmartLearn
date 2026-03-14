import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Clock, BookOpen, CheckCircle, 
  Play, Timer, HelpCircle, Star, Loader2
} from "lucide-react"; 
import apiClient from "@/api/apiClient";
import styles from "./StudentQuiz.module.css";

interface Quiz {
  id: number;
  title: string;
  course_name: string;
  questions_count: number;
  duration: string;
  status: 'Pending' | 'Completed';
  score?: string | number; // String ya number dono handle honge
  due_date: string;
}

const StudentQuiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, completed: 0, avgScore: 0, pending: 0 });

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/assessments/student-quizzes/'); 
        
        // Quiz data ko process karein taake percentage convert ho sake
        const processedQuizzes = response.data.quizzes.map((quiz: Quiz) => {
          if (quiz.status === 'Completed' && typeof quiz.score === 'string' && quiz.score.includes('%')) {
            // Agar score "40.0%" jaisa hai, to usey count mein convert karein
            const percentage = parseFloat(quiz.score);
            const count = Math.round((percentage / 100) * quiz.questions_count);
            return { ...quiz, score: `${count} / ${quiz.questions_count}` };
          }
          return quiz;
        });

        setQuizzes(processedQuizzes);
        
        // Stats handling
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId: number) => {
    navigate(`/student/lecture/${quizId}/quiz`);
  };

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
        <StatBox icon={<BookOpen size={22} />} label="Assigned" value={stats.assigned} color="#8b5cf6" bg="rgba(139, 92, 246, 0.1)" />
        <StatBox icon={<CheckCircle size={22} />} label="Completed" value={stats.completed} color="#10b981" bg="rgba(16, 185, 129, 0.1)" />
        <StatBox icon={<Star size={22} />} label="Avg. Score" value={`${stats.avgScore}%`} color="#f59e0b" bg="rgba(245, 158, 11, 0.1)" />
        <StatBox icon={<Clock size={22} />} label="Pending" value={stats.pending} color="#ef4444" bg="rgba(239, 68, 68, 0.1)" />
      </div>

      <h2 className={styles.sectionTitle}>Available Quizzes</h2>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" size={40} color="#6366f1" />
        </div>
      ) : quizzes.length > 0 ? (
        <div className={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span className={`${styles.tag} ${quiz.status === 'Pending' ? styles.urgent : styles.normal}`}>
                  {quiz.due_date}
                </span>
                {quiz.status === 'Completed' && (
                  <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '700' }}>
                    Score: {quiz.score}
                  </span>
                )}
              </div>

              <h3 style={{ margin: '0 0 5px 0' }}>{quiz.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{quiz.course_name}</p>

              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <HelpCircle size={14} /> {quiz.questions_count} Questions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <Timer size={14} /> {quiz.duration}
                </div>
              </div>

              {quiz.status === 'Pending' ? (
                <button className={styles.startBtn} onClick={() => handleStartQuiz(quiz.id)}>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>No published quizzes found for your enrolled courses.</p>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value, color, bg }: any) => (
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

export default StudentQuiz;
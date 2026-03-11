import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, HelpCircle, Users, CheckCircle, 
  User, Loader2
} from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./QuizDetailView.module.css";

const QuizDetailView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'submissions'>('submissions');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/assessments/quiz/detail-by-lecture/${id}/`);
        setQuizData(response.data);

        if (response.data.id) {
            const subResponse = await apiClient.get(`/assessments/quiz/${response.data.id}/submissions/`);
            setSubmissions(subResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  // Exact Score Calculation for Average
  const calculateAvgScore = (subs: any[]) => {
    if (subs.length === 0 || !quizData?.questions_count) return "0";
    
    const totalCorrect = subs.reduce((acc, curr) => {
      let scoreVal = parseFloat(curr.score) || 0;
      // Agar score percentage mein hai (> questions_count), to usey count mein convert karein
      if (scoreVal > quizData.questions_count) {
        return acc + ((scoreVal / 100) * quizData.questions_count);
      }
      return acc + scoreVal;
    }, 0);

    return (totalCorrect / subs.length).toFixed(1);
  };

  const getQuestions = () => {
    let rawData = quizData?.quiz_data;
    if (!rawData) return [];
    
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch(e) { return []; }
    }
    
    if (Array.isArray(rawData)) return rawData;
    if (rawData.questions && Array.isArray(rawData.questions)) return rawData.questions;
    
    return [];
  };

  // Function to format individual student score
  const formatStudentScore = (score: any) => {
    let scoreVal = parseFloat(score) || 0;
    let totalQuestions = quizData?.questions_count || 0;

    // Agar backend percentage bhej raha hai to count nikalein
    if (scoreVal > totalQuestions && scoreVal <= 100) {
      scoreVal = Math.round((scoreVal / 100) * totalQuestions);
    }
    
    return `${scoreVal} / ${totalQuestions}`;
  };

  // Shared Inline Styles for Dynamic Theme
  const cardStyle = { 
    backgroundColor: 'var(--card, #ffffff)', 
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)' 
  };

  if (loading) return (
    <div className={styles.loading}>
      <Loader2 size={40} className="animate-spin" />
      <p>Loading Quiz Analytics...</p>
    </div>
  );

  if (!quizData) return <div className={styles.error}>Quiz not found for this lecture.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn} style={cardStyle}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className={styles.titleInfo}>
          <h1 style={{ color: 'var(--foreground)' }}>{quizData.lecture_topic || "Quiz Details"}</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>{quizData.course_name} • <span className={styles.statusText}>{quizData.status}</span></p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard} style={cardStyle}>
          <HelpCircle className={styles.iconQ} />
          <div><span style={{ color: 'var(--muted-foreground)' }}>Questions</span><h3 style={{ color: 'var(--foreground)' }}>{quizData.questions_count || 0}</h3></div>
        </div>
        <div className={styles.statCard} style={cardStyle}>
          <Users className={styles.iconU} />
          <div><span style={{ color: 'var(--muted-foreground)' }}>Total Attempts</span><h3 style={{ color: 'var(--foreground)' }}>{submissions.length}</h3></div>
        </div>
        <div className={styles.statCard} style={cardStyle}>
          <CheckCircle className={styles.iconS} />
          <div><span style={{ color: 'var(--muted-foreground)' }}>Avg. Score</span><h3 style={{ color: 'var(--foreground)' }}>{calculateAvgScore(submissions)} / {quizData.questions_count}</h3></div>
        </div>
      </div>

      <div className={styles.tabs} style={{ borderBottomColor: 'var(--border)' }}>
        <button 
          className={activeTab === 'submissions' ? styles.activeTab : ''} 
          style={{ color: activeTab === 'submissions' ? '#6366f1' : 'var(--muted-foreground)' }}
          onClick={() => setActiveTab('submissions')}
        >
          Student Submissions
        </button>
        <button 
          className={activeTab === 'questions' ? styles.activeTab : ''} 
          style={{ color: activeTab === 'questions' ? '#6366f1' : 'var(--muted-foreground)' }}
          onClick={() => setActiveTab('questions')}
        >
          Quiz Questions
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === 'submissions' ? (
          <div className={styles.submissionsTable} style={cardStyle}>
            {submissions.length > 0 ? (
              <table>
                <thead>
                  <tr style={{ backgroundColor: 'var(--table-header, #f1f5f9)' }}>
                    <th style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Student Name</th>
                    <th style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Date Submitted</th>
                    <th style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Score</th>
                    <th style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className={styles.userName}>
                        <div className={styles.avatar}><User size={14} /></div>
                        <span style={{ color: 'var(--foreground)' }}>{sub.user_name || "Unknown Student"}</span>
                      </td>
                      <td style={{ color: 'var(--muted-foreground)' }}>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                      <td className={styles.scoreCell}>{formatStudentScore(sub.score)}</td>
                      <td><span className={styles.passBadge}>Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>No submissions found for this quiz.</div>
            )}
          </div>
        ) : (
          <div className={styles.questionsList}>
             {getQuestions().map((q: any, idx: number) => (
                <div key={idx} className={styles.questionCard} style={cardStyle}>
                    <h4 style={{ color: 'var(--foreground)' }}>Q{idx + 1}: {q.question || q.text || q.question_text || q.prompt || "Question data missing"}</h4>
                    <div className={styles.optionsGrid}>
                        {q.options?.map((opt: any, oIdx: number) => {
                            const isCorrect = opt.isCorrect || q.correct_index === oIdx || q.answer === (opt.text || opt);
                            return (
                                <div 
                                    key={oIdx} 
                                    className={`${styles.option} ${isCorrect ? styles.correct : ''}`} 
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    {typeof opt === 'string' ? opt : (opt.text || opt.option || opt.value)}
                                </div>
                            );
                        })}
                    </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetailView;
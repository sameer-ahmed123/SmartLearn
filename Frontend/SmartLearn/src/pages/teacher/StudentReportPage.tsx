import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Book, CheckCircle, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './StudentReport.module.css';
import apiClient from '@/api/apiClient';

const StudentReportPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL query parameters se course_id nikalna
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('course_id');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback dropdown handle karne ke liye state
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);

  const toggleFeedback = (index: number) => {
    setExpandedFeedback(expandedFeedback === index ? null : index);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        /**
         * URL CONSTRUCTION WITH COURSE FILTER:
         * Hum course_id ko query parameter ke taur par bhej rahe hain
         */
        const res = await apiClient.get(`/assessments/teacher/student-report/${studentId}/`, {
          params: { course_id: courseId }
        });
        
        setData(res.data);
      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && courseId) {
      fetchDetails();
    } else if (!courseId) {
      setError("No course selected. Please go back to the gradebook.");
      setLoading(false);
    }
  }, [studentId, courseId]);

  if (loading) return <div className={styles.loading}>Loading Report Card...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;
  
  if (!data || !data.student_info) {
    return <div className={styles.loading}>No data found for Student ID: {studentId}</div>;
  }

  return (
    <div className={styles.reportWrapper}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeft size={18} /> Back to Gradebook
      </button>

      <div className={styles.profileHeader}>
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.student_info.name || 'default'}`} 
          className={styles.largeAvatar} 
          alt="Avatar"
        />
        <div className={styles.info}>
          <h1>{data.student_info.name}</h1>
          <p>{data.student_info.id_num} • {data.student_info.email}</p>
          {data.course_info && (
            <span style={{ 
              display: 'inline-block', 
              marginTop: '10px', 
              padding: '4px 12px', 
              background: '#e0e7ff', 
              color: '#4338ca', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: '600' 
            }}>
              Course: {data.course_info.title}
            </span>
          )}
        </div>
      </div>

      <div className={styles.reportGrid}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionTitle}>
            <Book size={20} /> <h3>Assignments Breakdown</h3>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.detailTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>AI Feedback</th>
                </tr>
              </thead>
              <tbody>
                {data.assignments && data.assignments.length > 0 ? (
                  data.assignments.map((asm: any, i: number) => (
                    <React.Fragment key={`asm-group-${i}`}>
                      <tr key={`asm-row-${i}`}>
                        <td>{asm.title}</td>
                        <td><span className={styles.statusBadge}>{asm.status}</span></td>
                        <td className={styles.scoreText}>{asm.score !== null ? `${asm.score}/100` : 'N/A'}</td>
                        <td className={styles.feedbackCell}>
                          <button 
                            className={styles.dropdownBtn} 
                            onClick={() => toggleFeedback(i)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '500' }}
                          >
                            <MessageSquare size={14} /> 
                            {expandedFeedback === i ? 'Hide Feedback' : 'View Feedback'}
                            {expandedFeedback === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expandedFeedback === i && (
                        <tr>
                          <td colSpan={4} className={styles.feedbackContent} style={{ backgroundColor: '#f9fafb', padding: '15px', fontSize: '0.9rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                            <strong>AI Analysis:</strong>
                            <p style={{ marginTop: '5px', lineHeight: '1.5' }}>{asm.feedback}</p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>No assignments submitted for this course.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionTitle}>
            <CheckCircle size={20} /> <h3>Quiz Performance</h3>
          </div>
          <div className={styles.quizList}>
            {data.quizzes && data.quizzes.length > 0 ? (
              data.quizzes.map((quiz: any, i: number) => (
                <div key={`quiz-${i}`} className={styles.quizItem}>
                  <div>
                    <h4>{quiz.title}</h4>
                    <small>
                      <Clock size={12} /> {quiz.submitted_at ? new Date(quiz.submitted_at).toLocaleDateString() : 'N/A'}
                    </small>
                  </div>
                  <div className={styles.quizScore}>{quiz.score}%</div>
                </div>
              ))
            ) : (
              <p style={{padding:'20px', textAlign:'center'}}>No quizzes taken for this course.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentReportPage;
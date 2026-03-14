import { useState, useEffect } from "react";
import { 
  Plus, HelpCircle, Users, Calendar, 
  Search, ClipboardList, ArrowRight, Filter,
  BookOpen, CheckCircle, Clock, Trophy, X, Settings, Loader2
} from "lucide-react"; 
import styles from "./TeacherQuiz.module.css";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";
import { useNavigate } from "react-router-dom";

const TeacherQuiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseImages = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizResponse, courseResponse] = await Promise.all([
          apiClient.get("/assessments/teacher-quizzes/"),
          apiClient.get("/lectures/courses")
        ]);
        
        let quizData = [];
        if (quizResponse.data.results && Array.isArray(quizResponse.data.results)) {
          quizData = quizResponse.data.results;
        } else if (Array.isArray(quizResponse.data)) {
          quizData = quizResponse.data;
        }

        setQuizzes(quizData);
        setCourses(courseResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter(q => 
    (q.title || q.topic || "").toLowerCase().includes(search.toLowerCase()) ||
    (q.course_name || q.course_title || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6366f1' }}>
      <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 10px' }} />
      <p>Loading All Quizzes...</p>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.quizBanner}>
        <div className={styles.bannerLeft}>
          <h2 className={styles.bannerTitle}>Quiz Assessments</h2>
          <p className={styles.bannerSub}>Easily track, evaluate, and record student quiz submissions.</p>
          
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create Quiz
          </button>
        </div>
        <ClipboardList size={140} className={styles.bgIcon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Select Course</h3>
              <X size={24} className={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
            </div>
            <div className={styles.modalList}>
              {courses.map((course, index) => (
                <div key={course.id} className={styles.modalItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={courseImages[index % courseImages.length]} alt="" className={styles.modalCourseImg} />
                    <div>
                      <span className={styles.modalCourseTitle}>{course.title}</span>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{course.lecture_count || 0} Lectures</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/teacher/course/${course.id}?tab=quizzes`)} className={styles.modalManageBtn}>
                    <Settings size={14} /> Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Section with Actual Data */}
      <div className={styles.statsRow}>
        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><BookOpen size={22} /></div>
          <div className={styles.statTextContainer}><p>Total Quizzes</p><h3>{quizzes.length}</h3></div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={22} /></div>
          <div className={styles.statTextContainer}><p>Active</p><h3>{quizzes.filter(q => q.status === 'published' || q.status === 'active').length}</h3></div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Clock size={22} /></div>
          <div className={styles.statTextContainer}><p>Drafts</p><h3>{quizzes.filter(q => q.status === 'draft').length}</h3></div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Trophy size={22} /></div>
          <div className={styles.statTextContainer}><p>Submissions</p><h3>{quizzes.reduce((acc, q) => acc + (q.submission_count || 0), 0)}</h3></div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search all quizzes..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn}><Filter size={18} /> Filters</button>
      </div>

      <div className={styles.quizGrid}>
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <span className={`${styles.statusBadge} ${quiz.status === 'draft' ? styles.draft : styles.active}`}>
                {quiz.status || 'Active'}
              </span>
              <div className={styles.quizInfo}>
                {/* Topic usually contains the lecture name or specific title */}
                <h3>{quiz.title || quiz.topic || "Untitled Quiz"}</h3>
                <p>{quiz.course_name || quiz.course_title || "Course Assessment"}</p>
              </div>
              <div className={styles.quizStatsGrid}>
                {/* Exact Questions Count */}
                <div className={styles.statItem}>
                  <HelpCircle size={16} />
                  <span>Qs: <b>{quiz.questions_count ?? quiz.quiz_data?.questions?.length ?? 0}</b></span>
                </div>
                {/* Actual Submission/Attempt Count */}
                <div className={styles.statItem}>
                  <Users size={16} />
                  <span>Atms: <b>{quiz.submission_count || 0}</b></span>
                </div>
                {/* Deadline or Created Date */}
                <div className={styles.statItem}>
                  <Calendar size={16} />
                  <span>Date: <b>{quiz.deadline ? new Date(quiz.deadline).toLocaleDateString() : (quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A')}</b></span>
                </div>
              </div>
              
              <div 
                className={styles.viewResults} 
                onClick={() => {
                  const targetId = quiz.lecture_id || quiz.lecture;
                  if (targetId) {
                    navigate(`/teacher/lecture/${targetId}/quiz`);
                  } else {
                    console.error("No lecture ID found for this quiz");
                  }
                }}
              >
                View Details <ArrowRight size={14} />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
             <ClipboardList size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
             <p>No quizzes found match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherQuiz;
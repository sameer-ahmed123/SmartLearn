import { useState, useEffect } from "react";
import { 
  Plus, HelpCircle, Users, Calendar, 
  Search, ClipboardList, ArrowRight, Filter,
  BookOpen, CheckCircle, Clock, Trophy
} from "lucide-react"; 
import styles from "./TeacherQuiz.module.css";
import apiClient from "@/api/apiClient";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import type { CourseSummary } from "@/types/Courses/Types";

const TeacherQuiz = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = [
          { id: 1, title: "Modern Physics Quiz", course: "Advanced Science", questions: 15, attempts: 42, status: 'Active', due: "12 Mar" },
          { id: 2, title: "React Hooks Basics", course: "Web Dev 101", questions: 10, attempts: 15, status: 'Draft', due: "15 Mar" },
          { id: 3, title: "UI/UX Principles", course: "Graphic Design", questions: 25, attempts: 89, status: 'Active', due: "10 Mar" },
        ];
        
        const courseResponse = await apiClient.get("/lectures/courses");
        
        setQuizzes(quizData);
        setCourses(courseResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Quiz Portal...</div>;

  return (
    <div className={styles.pageWrapper}>
      
      {/* GRADIENT BANNER */}
      <div className={styles.quizBanner}>
        <div className={styles.bannerLeft}>
          <h2 className={styles.bannerTitle}>Quiz Assessments</h2>
          <p className={styles.bannerSub}>Create and manage your quizzes to track student progress.</p>
        </div>
        <ClipboardList size={140} className={styles.bgIcon} />
      </div>

      {/* STATS BOXES ROW */}
      <div className={styles.statsRow}>
        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Total Quizzes</p>
            <h3>{quizzes.length}</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Active Now</p>
            <h3>{quizzes.filter(q => q.status === 'Active').length}</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Drafts</p>
            <h3>{quizzes.filter(q => q.status === 'Draft').length}</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div className={styles.statIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Trophy size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Avg Performance</p>
            <h3>82%</h3>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className={styles.searchContainer}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search quizzes by title..." 
            className={styles.searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* QUIZ GRID */}
      <div className={styles.quizGrid}>
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className={styles.quizCard}>
            <span className={`${styles.statusBadge} ${quiz.status === 'Active' ? styles.active : styles.draft}`}>
              {quiz.status}
            </span>
            <div className={styles.quizInfo}>
              <h3>{quiz.title}</h3>
              <p>{quiz.course}</p>
            </div>
            <div className={styles.quizStatsGrid}>
              <div className={styles.statItem}><HelpCircle size={16} /><span>Qs: <b>{quiz.questions}</b></span></div>
              <div className={styles.statItem}><Users size={16} /><span>Atms: <b>{quiz.attempts}</b></span></div>
              <div className={styles.statItem}><Calendar size={16} /><span>Due: <b>{quiz.due}</b></span></div>
            </div>
            <div className={styles.viewResults}>
              View Results <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* COURSE LIST */}
      <h2 className={styles.sectionTitle}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {courses.map((course) => (
          <CourseListCard key={course.id} course={course} />
        ))}
      </div>

    </div>
  );
};

export default TeacherQuiz;
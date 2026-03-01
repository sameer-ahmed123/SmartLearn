import { useState, useEffect } from "react";
import { 
  BookOpen, Video, Clock, CheckCircle, Plus, 
  Bell, GraduationCap, ChevronLeft, ChevronRight 
} from "lucide-react"; 
import styles from "./TeacherDashboard.module.css";
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { useNavigate } from "react-router-dom"; 
import CreateCourseModal from "../../components/Dashboard/teacher/CreateCourseModal";
import LectureValidationQueueTable from "@/components/Dashboard/teacher/LectureValidationQueueTable";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";

// Mock Data for Charts
const assignmentData = [
    { name: 'Wk 1', completed: 40, pending: 20 },
    { name: 'Wk 2', completed: 55, pending: 15 },
    { name: 'Wk 3', completed: 75, pending: 10 },
    { name: 'Wk 4', completed: 85, pending: 5 },
];

const quizPerformance = [
    { subject: 'Q1', avgScore: 85 },
    { subject: 'Q2', avgScore: 72 },
    { subject: 'Q3', avgScore: 90 },
    { subject: 'Q4', avgScore: 65 },
];

const studentsProgress = [
    { id: 1, name: 'Amelia', progress: 75, color: '#4f46e5' },
    { id: 2, name: 'Johen', progress: 64, color: '#f59e0b' },
    { id: 3, name: 'Micheal', progress: 59, color: '#10b981' },
    { id: 4, name: 'Amanda', progress: 45, color: '#ef4444' },
];

interface MetricsData {
  total_courses: number;
  total_lectures_generated: number;
  pending_validation_count: number;
  total_validated_lectures: number;
}

const TeacherDashboardPage = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Avatar URL (Professional Man Avatar)
  const avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";

  // --- INTERACTIVE CALENDAR LOGIC ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && 
    currentDate.getMonth() === today.getMonth() && 
    currentDate.getFullYear() === today.getFullYear();

  // --- API FETCHING ---
  const handleCourseCreated = (newCourse: CourseSummary) => {
    setCourses((prev) => [newCourse, ...prev]);
    if (metrics) {
      setMetrics({ ...metrics, total_courses: metrics.total_courses + 1 });
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get("/dashboard/metrics/teacher/", {});
        const course_response = await apiClient.get("/lectures/courses");

        if (response.status !== 200 || course_response.status !== 200) {
          throw new Error("Failed to fetch dashboard data.");
        }

        setMetrics(response.data);
        setCourses(course_response.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) return <div className={styles.loader}>Loading SmartLearn...</div>;

  return (
    <div className={styles.pageWrapper}>
      
      <header className={styles.topHeader}>
        <div style={{ flex: 1 }}></div> 
        
        <div className={styles.headerActions}>
          <div className={styles.userProfile}>
            <div className={styles.userText}>
              <span className={styles.userName}>Johen Doe</span>
            </div>
            {/* Updated Avatar Image */}
            <img src={avatarUrl} alt="User Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        
        <div className={styles.mainContent}>
          
          <div className={styles.welcomeBanner}>
            <div className={styles.bannerLeft}>
                <h2 className={styles.bannerTitle}>Welcome back, <span className={styles.highlight}>Johen!</span></h2>
                <p className={styles.bannerSub}>Your students completed <span className={styles.boldText}>80%</span> of the tasks. Progress is <span className={styles.successText}>very good!</span></p>
                <button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
                   <Plus size={18} /> Create New Course
                </button>
            </div>
            <div className={styles.bannerIllustration}>
                <GraduationCap size={120} className={styles.capIcon} opacity={0.1} />
            </div>
          </div>

          <div className={styles.statsRow}>
            {[
              { label: 'TOTAL COURSES', val: metrics?.total_courses ?? 0, icon: <BookOpen />, color: '#4f46e5' },
              { label: 'LECTURES', val: metrics?.total_lectures_generated ?? 0, icon: <Video />, color: '#10b981' },
              { label: 'PENDING', val: metrics?.pending_validation_count ?? 0, icon: <Clock />, color: '#f59e0b' },
              { label: 'VALIDATED', val: metrics?.total_validated_lectures ?? 0, icon: <CheckCircle />, color: '#8b5cf6' },
            ].map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: stat.color, background: `${stat.color}15` }}>
                  {stat.icon}
                </div>
                <div className={styles.statInfo}>
                  <p>{stat.label}</p>
                  <h3>{stat.val}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.analyticsRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '30px' }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '15px' }}>Assignment Record</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assignmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="pending" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '15px' }}>Quiz Performance</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={quizPerformance}>
                    <Tooltip />
                    <Area type="monotone" dataKey="avgScore" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                    <XAxis dataKey="subject" hide />
                    <YAxis hide domain={[0, 100]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '30px', marginBottom: '15px' }}>My Courses and Student Stats</h2>
          <div className={styles.middleRow} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
            <div className={styles.courseGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {courses.map((course) => (
                <div key={course.id} onClick={() => navigate(`/teacher/course/${course.id}`)} style={{ cursor: 'pointer' }}>
                  <CourseListCard course={course} />
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h3>Students Progress</h3>
              <div className={styles.studentList}>
                {studentsProgress.map(student => (
                  <div key={student.id} className={styles.studentRow}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className={styles.avatar} />
                    <div className={styles.progContainer}>
                      <div className={styles.progLabels}>
                        <span>{student.name}</span>
                        <span style={{ color: student.color }}>{student.progress}%</span>
                      </div>
                      <div className={styles.barBg}>
                        <div className={styles.barFill} style={{ width: `${student.progress}%`, backgroundColor: student.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
             <h2 className={styles.sectionTitle}>Lecture Validation Queue</h2>
             <LectureValidationQueueTable />
          </div>
        </div>

        <div className={styles.sideContent}>
          <div className={styles.card}>
            <div className={styles.calendarHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{monthName} {year}</h3>
              <div className={styles.calendarNav} style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrevMonth} className={styles.navBtn}><ChevronLeft size={16} /></button>
                <button onClick={handleNextMonth} className={styles.navBtn}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className={styles.calendarGrid}>
              {['S','M','T','W','T','F','S'].map(d => (
                <span key={d} className={styles.calHead}>{d}</span>
              ))}
              
              {emptySlots.map(slot => (
                <span key={`empty-${slot}`} className={styles.calEmpty}></span>
              ))}

              {calendarDays.map(day => (
                <span 
                  key={day} 
                  className={isToday(day) ? styles.calActive : styles.calDay}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.card} style={{ textAlign: 'center' }}>
            <h3 className={styles.cardTitle}>Overall Progress</h3>
            <div style={{ position: 'relative', height: '140px', margin: '15px auto', width: '140px' }}>
               <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#4f46e5" strokeWidth="3" 
                          strokeDasharray="80, 100" strokeLinecap="round" />
               </svg>
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '1.4rem', color: 'var(--foreground)' }}>
                  80%
               </div>
            </div>
            <p className={styles.bannerSub} style={{ fontSize: '0.85rem' }}>Course completion average.</p>
          </div>
        </div>

      </div>

      <CreateCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleCourseCreated} />
    </div>
  );
};

export default TeacherDashboardPage;
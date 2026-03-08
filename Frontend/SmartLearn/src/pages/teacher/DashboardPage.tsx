import { useState, useEffect } from "react";
import { 
  Users, CheckCircle, Clock, 
  GraduationCap, Star,
  ChevronLeft, ChevronRight, BookOpen
} from "lucide-react"; 
import styles from "./TeacherDashboard.module.css";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";

// Mock Data
const assignmentRecord = [
    { name: 'Wk 1', marked: 45, pending: 5 },
    { name: 'Wk 2', marked: 30, pending: 20 },
    { name: 'Wk 3', marked: 50, pending: 0 },
    { name: 'Wk 4', marked: 25, pending: 25 },
];

const quizPerformance = [
    { subject: 'Quiz 1', avgScore: 75 },
    { subject: 'Quiz 2', avgScore: 68 },
    { subject: 'Quiz 3', avgScore: 82 },
    { subject: 'Quiz 4', avgScore: 70 },
];

const weeklyTeacherActivity = [
    { name: 'Mon', hours: 6 }, { name: 'Tue', hours: 8 }, { name: 'Wed', hours: 5 },
    { name: 'Thu', hours: 9 }, { name: 'Fri', hours: 4 }, { name: 'Sat', hours: 2 }, { name: 'Sun', hours: 1 },
];

const studentProgressData = [
    { name: 'Amelia', progress: 75, color: '#4f46e5', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia' },
    { name: 'Johen', progress: 64, color: '#f59e0b', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Johen' },
    { name: 'Micheal', progress: 59, color: '#10b981', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Micheal' },
    { name: 'Amanda', progress: 45, color: '#ef4444', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' },
];

const TeacherDashboardPage = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  const user = useAuthStore((state) => state.user);
  const displayName = user?.full_name || "User";

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/dashboard/metrics/teacher/');
        if (response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getLectureStatsData = () => {
    return [
      { name: 'Total Courses', count: metrics?.total_courses ?? 0, fill: '#f59e0b' },
      { name: 'Generated', count: metrics?.total_lectures_generated ?? 0, fill: '#4f46e5' },
      { name: 'Pending', count: metrics?.pending_validation_count ?? 0, fill: '#ef4444' },
      { name: 'Validated', count: metrics?.total_validated_lectures ?? 0, fill: '#10b981' },
    ];
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<span key={`empty-${i}`} className={styles.calEmpty}></span>);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <span key={i} className={(isCurrentMonth && i === now.getDate()) ? styles.calActive : styles.calDay}>
          {i}
        </span>
      );
    }
    return days;
  };

  if (loading) return <div className={styles.loader}>Loading Teacher Portal...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Welcome back, Prof. <span className={styles.highlight}>{displayName}!</span></h2>
              <p className={styles.bannerSub}>
                Your students completed <span className={styles.boldText}>80%</span> of the tasks. 
                Progress is <span className={styles.successText}>very good!</span>
              </p>
          </div>
          <GraduationCap size={120} className={styles.capIcon} />
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          {[
            { label: 'TOTAL STUDENTS', val: 142, icon: <Users />, color: '#4f46e5' },
            { label: 'ACTIVE COURSES', val: metrics?.total_courses ?? 0, icon: <BookOpen />, color: '#f59e0b' },
            { label: 'AVG ATTENDANCE', val: '88%', icon: <CheckCircle />, color: '#10b981' },
            { label: 'PENDING TASKS', val: metrics?.pending_validation_count ?? 0, icon: <Clock />, color: '#ef4444' },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
              <div className={styles.statInfo}><p>{stat.label}</p><h3>{stat.val}</h3></div>
            </div>
          ))}
        </div>

        {/* ROW 1: Assignment & Quiz */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Assignment Record</h3>
            <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assignmentRecord}>
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Bar dataKey="marked" fill="#4f46e5" radius={4} />
                        <Bar dataKey="pending" fill="#cbd5e1" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quiz Performance</h3>
            <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={quizPerformance}>
                        <Tooltip />
                        <Area type="monotone" dataKey="avgScore" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 2: Lecture Progress & Calendar */}
        <div className={styles.unevenGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lecture Progress Analysis</h3>
            <div style={{ height: '250px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getLectureStatsData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                  />
                  {/* Legend removed here to hide "count" */}
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.calTitle}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className={styles.calendarNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}><ChevronLeft size={14} /></button>
                <button onClick={handleNextMonth} className={styles.navBtn}><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className={styles.calendarGrid}>{['S','M','T','W','T','F','S'].map(d => <span key={d} className={styles.calHead}>{d}</span>)}{renderCalendar()}</div>
          </div>
        </div>

        {/* ROW 3: Coverage, Circle, Goal */}
        <div className={styles.threeColumnGrid}>
           <div className={styles.card}>
              <h3 className={styles.cardTitle}>Syllabus Coverage</h3>
              <div className={styles.linearProg}>
                 <div className={styles.progLabel}><span>Advanced Java</span><span>70%</span></div>
                 <div className={styles.progBar}><div style={{width: '70%', background: '#4f46e5'}}></div></div>
                 <div className={styles.progLabel} style={{marginTop:'15px'}}><span>Data Structures</span><span>45%</span></div>
                 <div className={styles.progBar}><div style={{width: '45%', background: '#10b981'}}></div></div>
              </div>
           </div>
           <div className={`${styles.card} ${styles.centerText}`}>
              <h3 className={styles.cardTitle}>Overall Performance</h3>
              <div className={styles.circleContainer}>
                  <svg viewBox="0 0 36 36" className={styles.circularChart}>
                    <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={styles.circle} strokeDasharray="82, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className={styles.percentage}>82%</div>
              </div>
           </div>
           <div className={styles.goalCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Star size={20} fill="white" /><h4>Monthly Goal</h4></div>
              <p>Content: {metrics?.total_lectures_generated ?? 0}/10 uploaded</p>
              <div className={styles.miniProgBar}><div style={{ width: '80%', background: 'white', height: '100%' }}></div></div>
           </div>
        </div>

        {/* ROW 4: Weekly Hours + Student Progress */}
        <div className={styles.twoColumnGrid} style={{marginTop: '24px'}}>
           <div className={styles.card}>
              <h3 className={styles.cardTitle}>Weekly Active Hours</h3>
              <div style={{ height: '250px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyTeacherActivity}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: '#f8fafc'}} />
                     <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={60} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className={styles.card}>
            <h3 className={styles.cardTitle}>Students Progress</h3>
            <div className={styles.studentList}>
                {studentProgressData.map((student, idx) => (
                    <div key={idx} className={styles.studentItem}>
                        <img src={student.avatar} alt={student.name} className={styles.studentAvatar} />
                        <div className={styles.studentInfo}>
                            <div className={styles.studentHeader}>
                                <span className={styles.studentName}>{student.name}</span>
                                <span className={styles.studentPercent} style={{ color: student.color }}>{student.progress}%</span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${student.progress}%`, backgroundColor: student.color }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboardPage;
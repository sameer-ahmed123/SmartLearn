import { useState, useEffect } from "react";
import { 
  BookOpen, Clock, 
  GraduationCap, TrendingUp, Star,
  ChevronLeft, ChevronRight, HelpCircle
} from "lucide-react"; 
import styles from "./StudentDashboard.module.css";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import apiClient from "@/api/apiClient";

// Mock Data
const lectureData = [
    { name: 'Wk 1', watched: 10, total: 15 },
    { name: 'Wk 2', watched: 12, total: 15 },
    { name: 'Wk 3', watched: 8, total: 15 },
    { name: 'Wk 4', watched: 14, total: 15 },
];

const studyHoursData = [
    { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 4 }, { name: 'Wed', hours: 3 },
    { name: 'Thu', hours: 5 }, { name: 'Fri', hours: 2 }, { name: 'Sat', hours: 6 }, { name: 'Sun', hours: 4 },
];

const assignmentRecord = [
    { name: 'Wk 1', completed: 3, pending: 1 },
    { name: 'Wk 2', completed: 5, pending: 0 },
    { name: 'Wk 3', completed: 2, pending: 2 },
    { name: 'Wk 4', completed: 4, pending: 1 },
];

const quizPerformance = [
    { subject: 'Quiz 1', score: 85 },
    { subject: 'Quiz 2', score: 72 },
    { subject: 'Quiz 3', score: 90 },
    { subject: 'Quiz 4', score: 65 },
];

const StudentDashboardPage = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${metrics?.full_name || 'Student'}&backgroundColor=b6e3f4`;

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get('/dashboard/metrics/student/');
        console.log(response)
        setMetrics(response.data.metrics);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchMetrics();
  }, []);

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

  if (loading) return <div className={styles.loader}>Loading Student Portal...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Keep it up <span className={styles.highlight}>{metrics?.full_name?.split(' ')[0]}!</span></h2>
              <p className={styles.bannerSub}>Your learning journey is evolving! You've mastered new concepts.</p>
              <div className={styles.aiTip}><Star size={14} fill="#f59e0b" color="#f59e0b" /><span>AI Tip: Focus on Mathematics today!</span></div>
          </div>
          <GraduationCap size={120} className={styles.capIcon} />
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          {[
            { label: 'ENROLLED', val: metrics?.enrolled_courses || 0, icon: <BookOpen />, color: '#4f46e5' },
            { label: 'QUIZZES', val: metrics?.completed_quizzes || 0, icon: <HelpCircle />, color: '#f59e0b' },
            { label: 'AVG GRADE', val: metrics?.average_grade || 'N/A', icon: <TrendingUp />, color: '#10b981' },
            { label: 'ASSIGNMENTS', val: metrics?.pending_assignments || 0, icon: <Clock />, color: '#ef4444' },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
              <div className={styles.statInfo}><p>{stat.label}</p><h3>{stat.val}</h3></div>
            </div>
          ))}
        </div>

        {/* 1. Assignment & Quiz */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Assignment Record</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentRecord}>
                  <XAxis dataKey="name" hide />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4f46e5" radius={4} />
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
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. Lecture & Calendar */}
        <div className={styles.splitGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lecture Progress Analysis</h3>
            <div style={{ height: '250px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lectureData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="watched" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
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
            <div className={styles.calendarGrid}>
              {['S','M','T','W','T','F','S'].map(d => <span key={d} className={styles.calHead}>{d}</span>)}
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* 3. Progress, Circle, Goal */}
        <div className={styles.threeColumnGrid}>
           <div className={styles.card}>
              <h3 className={styles.cardTitle}>Course Completion</h3>
              <div className={styles.linearProg}>
                 <div className={styles.progLabel}><span>Business Math</span><span>85%</span></div>
                 <div className={styles.progBar}><div style={{width: '85%', background: '#4f46e5'}}></div></div>
                 <div className={styles.progLabel} style={{marginTop:'15px'}}><span>UX Design</span><span>60%</span></div>
                 <div className={styles.progBar}><div style={{width: '60%', background: '#10b981'}}></div></div>
              </div>
           </div>
           <div className={`${styles.card} ${styles.centerText}`}>
              <h3 className={styles.cardTitle}>Overall Progress</h3>
              <div className={styles.circleContainer}>
                  <svg viewBox="0 0 36 36" className={styles.circularChart}>
                    <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={styles.circle} strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className={styles.percentage}>75%</div>
              </div>
           </div>
           <div className={styles.goalCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Star size={20} fill="white" /><h4>Current Goal</h4></div>
              <p>Daily Lecture: 2/3 completed</p>
              <div className={styles.miniProgBar}><div style={{ width: '66%', background: 'white', height: '100%' }}></div></div>
           </div>
        </div>

        {/* 4. Weekly Activity */}
        <div className={styles.card} style={{marginTop: '24px'}}>
           <h3 className={styles.cardTitle}>Weekly Study Activity</h3>
           <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHoursData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;
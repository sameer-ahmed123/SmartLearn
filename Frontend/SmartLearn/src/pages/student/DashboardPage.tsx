import { useState, useEffect } from "react";
import { 
  BookOpen, Clock, Flame, 
  Bell, GraduationCap, TrendingUp, Star,
  ChevronLeft, ChevronRight, CheckCircle, HelpCircle
} from "lucide-react"; 
import styles from "./StudentDashboard.module.css";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import apiClient from "@/api/apiClient";

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
        const response = await apiClient.get('/dashboard/metrics/');
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
      <header className={styles.topHeader}>
        <div style={{ flex: 1 }}></div>
        <div className={styles.headerActions}>
          <div className={styles.userProfile}>
            <div className={styles.userText}>
              <span className={styles.userName}>{metrics?.full_name || "Student"}</span>
            </div>
            <img 
              src={avatarUrl} 
              alt="User Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
            />
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainContent}>
          
          {/* WELCOME BANNER - Updated text */}
          <div className={styles.welcomeBanner}>
            <div className={styles.bannerLeft}>
               <h2 className={styles.bannerTitle}>Keep it up <span className={styles.highlight}>{metrics?.full_name?.split(' ')[0]}!</span></h2>
               <p className={styles.bannerSub}>Your learning journey is evolving! You've mastered new concepts this week.</p>
               <div className={styles.aiTip}>
                 <Star size={14} fill="#f59e0b" color="#f59e0b" />
                 <span>AI Tip: You have assignments pending. Focus on Mathematics today!</span>
               </div>
            </div>
            <GraduationCap size={120} className={styles.capIcon} opacity={0.1} />
          </div>

          {/* STATS ROW - Streak replaced with Quizzes */}
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

          {/* ANALYTICS CHARTS */}
          <div className={styles.analyticsRow}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Assignment Record</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assignmentRecord}>
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
              <h3 className={styles.cardTitle}>Quiz Performance</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={quizPerformance}>
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                    <XAxis dataKey="subject" hide />
                    <YAxis hide domain={[0, 100]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* WEEKLY STUDY ACTIVITY */}
          <div className={styles.card} style={{ marginTop: '24px' }}>
            <h3 className={styles.cardTitle}>Weekly Study Activity</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHoursData}>
                  <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SIDE CONTENT RIGHT */}
        <div className={styles.sideContent}>
          <div className={styles.card}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.calTitle}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className={styles.calendarNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}><ChevronLeft size={16} /></button>
                <button onClick={handleNextMonth} className={styles.navBtn}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className={styles.calendarGrid}>
              {['S','M','T','W','T','F','S'].map(d => <span key={d} className={styles.calHead}>{d}</span>)}
              {renderCalendar()}
            </div>
          </div>

          {/* COURSE COMPLETION CIRCLE */}
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <h3 className={styles.cardTitle}>Course Completion</h3>
            <div style={{ position: 'relative', height: '140px', margin: '15px auto', width: '140px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#4f46e5" strokeWidth="3" 
                          strokeDasharray="75, 100" strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '1.4rem' }}>
                  75%
                </div>
            </div>
            <p className={styles.bannerSub} style={{ fontSize: '0.85rem', color: '#64748b' }}>Finish 2 more modules to reach 80%.</p>
          </div>

          {/* CURRENT GOAL CARD */}
          <div className={styles.card} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Star size={20} fill="white" />
                <h4 style={{ margin: 0 }}>Current Goal</h4>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Daily Lecture: 2/3 completed</p>
              <div className={styles.miniProgBar} style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '10px', marginTop: '10px' }}>
                <div style={{ width: '66%', background: 'white', height: '100%', borderRadius: '10px' }}></div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
import { 
  TrendingUp, Clock, Target, PlayCircle, 
  CheckCircle2, AlertCircle, BarChart3, ArrowUpRight,
  Zap, Layers, Award, FileText 
} from "lucide-react";
import "./StudentAnalytics.css";

const StudentAnalyticsPage = () => {
  // Stats Data
  const performanceMetrics = [
    { label: "Course Completion", value: "72%", icon: <CheckCircle2 />, color: "#10b981", trend: "+5%" },
    { label: "Avg. Quiz Score", value: "84%", icon: <Target />, color: "#6366f1", trend: "+12%" },
    { label: "Study Hours", value: "48h", icon: <Clock />, color: "#f59e0b", trend: "+8h" },
    { label: "Overall Progress", value: "B+", icon: <Award />, color: "#8b5cf6", trend: "Top 10%" },
  ];

  // Assignment Data
  const assignments = [
    { title: "Quantum Physics Lab", deadline: "2 Days left", progress: 100, status: "Submitted" },
    { title: "Python Data Analysis", deadline: "5 Days left", progress: 45, status: "In Progress" },
    { title: "Neural Networks Intro", deadline: "Overdue", progress: 10, status: "Late" },
  ];

  // Logic: Green > 80, Orange > 70, Yellow-Orange > 60, Yellow > 50, Red < 50
  const getStatusColor = (score: number) => {
    if (score >= 80) return "#10b981"; 
    if (score >= 70) return "#f59e0b"; 
    if (score >= 60) return "#fb923c"; 
    if (score >= 50) return "#eab308";
    return "#ef4444";                 
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* LEARNING ANALYTICS BANNER */}
        <div className="dashboard-banner analytics-banner">
          <div className="banner-content">
            <h2 style={{ margin: 0, fontSize: '2.4rem' }}>Learning Analytics</h2>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '10px' }}>
              Visualize your academic growth and optimize your study patterns.
            </p>
          </div>
          <BarChart3 size={180} className="banner-icon-bg" />
        </div>

        {/* TOP METRICS GRID */}
        <div className="stats-grid">
          {performanceMetrics.map((m, i) => (
            <div key={i} className="stat-item-card analytics-card">
              <div className="card-top">
                <div style={{ color: m.color, background: `${m.color}15`, padding: '10px', borderRadius: '12px' }}>
                  {m.icon}
                </div>
                <span className="trend-label" style={{ color: '#10b981' }}>
                  {m.trend} <ArrowUpRight size={14} />
                </span>
              </div>
              <div style={{ marginTop: '15px' }}>
                <p className="metric-label">{m.label}</p>
                <h2 className="metric-value">{m.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN ANALYTICS SECTION */}
        <div className="analytics-main-grid">
          {/* COURSE PERFORMANCE */}
          <div className="content-card">
            <div className="card-header">
              <PlayCircle size={22} color="#6366f1" />
              <h3 style={{ margin: 0 }}>Course-wise Performance</h3>
            </div>
            <div className="performance-list">
              {[
                { name: "Quantum Mechanics", watch: "85%", quiz: 90 },
                { name: "Advanced Python", watch: "60%", quiz: 75 },
                { name: "Machine Learning", watch: "40%", quiz: 55 },
              ].map((c, idx) => (
                <div key={idx} className="performance-item">
                  <div className="item-info"><span className="course-title">{c.name}</span></div>
                  <div className="progress-group">
                    <div className="progress-label"><span>Video Progress</span><span>{c.watch}</span></div>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: c.watch, background: '#6366f1' }}></div></div>
                  </div>
                  <div className="progress-group">
                    <div className="progress-label"><span>Quiz Average</span><span>{c.quiz}%</span></div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${c.quiz}%`, background: getStatusColor(c.quiz) }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card focus-card">
             <div className="card-header"><AlertCircle size={20} color="#ef4444" /><h3>Recommended Focus</h3></div>
             <ul className="focus-list">
                <li>Review "Matrix Multiplications" in Linear Algebra</li>
                <li>Complete "Inheritance" Quiz in Python</li>
                <li>Watch 2 more lectures to reach your weekly goal</li>
             </ul>
          </div>

          {/* ASSIGNMENT TRACKER */}
          <div className="content-card">
            <div className="card-header">
              <FileText size={22} color="#f59e0b" />
              <h3 style={{ margin: 0 }}>Assignment Tracker</h3>
            </div>
            <div className="assignment-list" style={{ marginTop: '20px' }}>
              {assignments.map((asgn, i) => (
                <div key={i} className="asgn-item">
                  <div className="asgn-info">
                    <p className="asgn-title">{asgn.title}</p>
                    <span className={`asgn-status`} style={{ color: asgn.deadline === 'Overdue' ? '#ef4444' : 'inherit', fontSize: '0.75rem', fontWeight: 700 }}>
                      {asgn.deadline}
                    </span>
                  </div>
                  <div className="asgn-progress-container" style={{ marginTop: '10px' }}>
                    <div className="asgn-progress-bar" style={{ width: `${asgn.progress}%`, background: asgn.progress === 100 ? '#10b981' : (asgn.progress < 20 ? '#ef4444' : '#f59e0b') }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default StudentAnalyticsPage;
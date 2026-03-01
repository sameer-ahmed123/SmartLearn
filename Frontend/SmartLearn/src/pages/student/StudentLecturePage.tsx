import { useState, useEffect } from "react";
import { 
  PlayCircle, Clock, CheckCircle, ArrowLeft, 
  BookOpen, Lock, MessageCircle, Star, GraduationCap 
} from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import "./StudentLecturePage.css"; 
import apiClient from "@/api/apiClient";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import type { CourseSummary } from "@/types/Courses/Types";

const StudentLecturePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedLecture, setSelectedLecture] = useState(0);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lectures = [
    { id: 1, title: "01. Introduction to Quantum Mechanics", duration: "12:45", status: "completed", progress: 100 },
    { id: 2, title: "02. Wave-Particle Duality", duration: "18:20", status: "in-progress", progress: 45 },
    { id: 3, title: "03. The Uncertainty Principle", duration: "15:10", status: "locked", progress: 0 },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get("/lectures/courses");
        setCourses(response.data);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchCourses();
  }, []);

  if (isLoading) return <div style={{padding: '100px', textAlign: 'center', fontSize: '1.2rem'}}>Loading Portal...</div>;

  return (
    <div className="student-page-wrapper">
      <div className="student-main-container">
        
        {/* PRO BANNER - Teacher Dashboard Style */}
        <div className="student-banner">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <ArrowLeft size={18}/> Back to Dashboard
          </button>
          <h1>Learning Portal</h1>
          <p>Review your course materials and track your daily learning goals.</p>
          <GraduationCap size={180} style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.15, color: 'white' }} />
        </div>

        {/* 4 STATS CARDS - Teacher Dashboard Style */}
        <div className="stats-grid">
          {[
            { label: 'COURSES', val: courses.length, icon: <BookOpen />, color: '#6366f1' },
            { label: 'COMPLETED', val: '12', icon: <CheckCircle />, color: '#10b981' },
            { label: 'HOURS', val: '45h', icon: <Clock />, color: '#f59e0b' },
            { label: 'POINTS', val: '850', icon: <Star />, color: '#a855f7' },
          ].map((s, i) => (
            <div key={i} className="stat-item-card">
              <div style={{ color: s.color, background: `${s.color}15`, padding: '15px', borderRadius: '15px' }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{s.label}</p>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{s.val}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN VIDEO SECTION */}
        <div className="main-layout-grid">
          <div className="video-box-card">
            <div className="video-player-area">
              <PlayCircle size={80} style={{ opacity: 0.9, cursor: 'pointer', color: '#6366f1' }} />
              <h3 style={{ marginTop: '20px' }}>{lectures[selectedLecture].title}</h3>
              <p style={{ opacity: 0.7 }}>Playing from Quantum Physics Masterclass</p>
            </div>
            
            <div style={{ marginTop: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Lecture Details</h3>
                <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={18} /> Ask AI Assistant
                </button>
              </div>
              <p style={{ color: '#64748b', lineHeight: '1.7', marginTop: '15px', fontSize: '1rem' }}>
                This video covers the core foundations of the subject. Please pay attention to the mathematical formulas discussed in the second half of the lecture.
              </p>
            </div>
          </div>

          {/* SIDEBAR PLAYLIST */}
          <aside className="sidebar-card">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#6366f1" /> Course Playlist
            </h3>
            <div className="lecture-list">
              {lectures.map((lecture, index) => (
                <div 
                  key={lecture.id} 
                  className={`lecture-row ${selectedLecture === index ? 'active' : ''}`}
                  onClick={() => setSelectedLecture(index)}
                >
                  <div style={{ color: lecture.status === 'completed' ? '#10b981' : lecture.status === 'locked' ? '#94a3b8' : '#6366f1' }}>
                    {lecture.status === 'completed' ? <CheckCircle size={22} /> : lecture.status === 'locked' ? <Lock size={22} /> : <PlayCircle size={22} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{lecture.title}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.6 }}>Progress: {lecture.progress}%</p>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px' }}>
                      <div style={{ width: `${lecture.progress}%`, height: '100%', background: '#6366f1', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ENROLLED COURSES CARDS */}
        <h2 style={{ margin: '50px 0 25px 0', fontSize: '1.8rem' }}>My Courses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', paddingBottom: '50px' }}>
          {courses.map((course) => (
            <CourseListCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentLecturePage;
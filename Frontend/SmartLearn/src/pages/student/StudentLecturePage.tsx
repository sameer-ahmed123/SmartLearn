import { useState, useEffect } from "react";
import { 
  PlayCircle, Clock, CheckCircle, 
  BookOpen, Lock, MessageCircle, Star, GraduationCap, Plus, X, Users 
} from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import "./StudentLecturePage.css"; 
import apiClient from "@/api/apiClient";

const StudentLecturePage = () => {
  const [selectedLecture, setSelectedLecture] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // My Enrolled Courses
  const [courses, setCourses] = useState([
    { id: 1, title: "Quantum Physics Masterclass", instructor: "Dr. Sarah", students: 120, rating: 4.8, price: "Enrolled", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800" },
    { id: 2, title: "Advanced Web Development", instructor: "Alex Rivera", students: 850, rating: 4.9, price: "Enrolled", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800" },
    { id: 3, title: "AI & Machine Learning", instructor: "Prof. Zaid", students: 430, rating: 4.7, price: "Enrolled", img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800" },
  ]);

  const lectures = [
    { id: 1, title: "01. Introduction to Quantum Mechanics", duration: "12:45", status: "completed", progress: 100 },
    { id: 2, title: "02. Wave-Particle Duality", duration: "18:20", status: "in-progress", progress: 45 },
    { id: 3, title: "03. The Uncertainty Principle", duration: "15:10", status: "locked", progress: 0 },
  ];

  const getProgressColor = (status: string) => {
    if (status === "completed") return "#10b981"; 
    if (status === "in-progress") return "#f59e0b"; 
    return "#ef4444"; 
  };

  const handleRegister = (course: any) => {
    const newCourse = {
      id: Date.now(),
      title: course.title,
      instructor: course.instructor,
      students: 1,
      rating: 5,
      price: "Enrolled",
      img: course.img
    };
    setCourses([...courses, newCourse]);
    setIsModalOpen(false);
  };

  // Common Dynamic Style for Cards
  const cardStyle = {
    backgroundColor: 'var(--card, #ffffff)',
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)'
  };

  return (
    <div className="student-page-wrapper">
      <div className="student-main-container">
        
        {/* BANNER */}
        <div className="student-banner">
          <div className="banner-content">
            <h1 style={{ color: 'white',fontSize: '2rem', margin: 0 }}>Learning Portal</h1>
            <p style={{ color: 'white', opacity: 0.9 }}>Review your course materials and track your daily learning goals.</p>
            <button className="enroll-trigger-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Enroll in New Course
            </button>
          </div>
          <GraduationCap size={180} className="banner-bg-icon" />
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          {[
            { label: 'COURSES', val: courses.length, icon: <BookOpen />, color: '#6366f1' },
            { label: 'COMPLETED', val: '12', icon: <CheckCircle />, color: '#10b981' },
            { label: 'HOURS', val: '45h', icon: <Clock />, color: '#f59e0b' },
            { label: 'POINTS', val: '850', icon: <Star />, color: '#a855f7' },
          ].map((s, i) => (
            <div key={i} className="stat-item-card" style={cardStyle}>
              <div className="stat-icon-box" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
              <div>
                <p className="stat-label" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <h2 className="stat-value" style={{ color: 'var(--foreground)' }}>{s.val}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* VIDEO & PLAYLIST */}
        <div className="main-layout-grid">
          <div className="video-box-card" style={cardStyle}>
            <div className="video-player-area">
              <PlayCircle size={80} style={{ color: '#6366f1' }} />
              <h3 style={{ marginTop: '20px', color: 'white' }}>{lectures[selectedLecture].title}</h3>
              <p style={{ opacity: 0.7, color: 'white' }}>Playing from Masterclass Series</p>
            </div>
            
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Lecture Details</h3>
                <button className="ai-btn"><MessageCircle size={18} /> Ask AI Assistant</button>
            </div>
            <p className="lecture-desc" style={{ color: 'var(--muted-foreground)' }}>This video covers the core foundations. Please review the mathematical formulas.</p>
          </div>

          <aside className="sidebar-card" style={cardStyle}>
            <h3 className="sidebar-title" style={{ color: 'var(--foreground)' }}>
              <BookOpen size={20} color="#6366f1" /> Course Playlist
            </h3>
            <div className="lecture-list">
              {lectures.map((lecture, index) => (
                <div 
                  key={lecture.id} 
                  className={`lecture-row ${selectedLecture === index ? 'active' : ''}`} 
                  onClick={() => setSelectedLecture(index)}
                  style={selectedLecture === index ? { backgroundColor: 'var(--muted)', borderColor: '#6366f1' } : {}}
                >
                  <div className="status-icon" style={{ color: getProgressColor(lecture.status) }}>
                    {lecture.status === 'completed' ? <CheckCircle size={22} /> : lecture.status === 'locked' ? <Lock size={22} /> : <PlayCircle size={22} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="lecture-row-title" style={{ color: 'var(--foreground)', margin: 0, fontWeight: 700 }}>{lecture.title}</p>
                    <div className="progress-bar-bg" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className="progress-bar-fill" style={{ width: `${lecture.progress || 5}%`, background: getProgressColor(lecture.status) }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* MY COURSES */}
        <h2 className="section-heading" style={{ color: 'var(--foreground)' }}>My Enrolled Courses</h2>
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card" style={cardStyle}>
              <div className="course-thumb">
                <img src={course.img} alt={course.title} />
                <span className="badge">{course.price}</span>
              </div>
              <div className="course-body">
                <h3 className="course-title" style={{ color: 'var(--foreground)', margin: '0 0 10px 0' }}>{course.title}</h3>
                <p className="course-instructor" style={{ color: 'var(--muted-foreground)' }}>By {course.instructor}</p>
                <div className="course-meta" style={{ color: 'var(--muted-foreground)' }}>
                  <span><Users size={14} /> {course.students}</span>
                  <span><Star size={14} color="#f59e0b" fill="#f59e0b" /> {course.rating}</span>
                </div>
                <button className="view-btn">Continue Learning</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="enroll-modal" style={cardStyle}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Available Courses</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn" style={{ color: 'var(--foreground)' }}><X size={24} /></button>
            </div>
            <div className="modal-body">
              {[
                { title: "Ethical Hacking", instructor: "Cyber Expert", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400" },
                { title: "Graphic Design", instructor: "Emma G.", img: "https://images.unsplash.com/photo-1572044162444-ad60f128bde2?w=400" }
              ].map((item, idx) => (
                <div key={idx} className="enroll-item" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={item.img} alt="" style={{ width: '50px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--foreground)' }}>{item.title}</p>
                  </div>
                  <button className="register-btn" onClick={() => handleRegister(item)}>Register</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLecturePage;
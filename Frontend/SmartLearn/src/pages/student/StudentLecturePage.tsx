import { useState, useEffect } from "react";
import { 
  PlayCircle, Clock, CheckCircle, 
  BookOpen, Lock, MessageCircle, Star, GraduationCap, Plus, X, Users 
} from "lucide-react"; 
import { useNavigate } from "react-router-dom"; // Added navigate for routing
import "./StudentLecturePage.css"; 
import apiClient from "@/api/apiClient";

const StudentLecturePage = () => {
  const navigate = useNavigate(); // Hook initialize kiya
  const [selectedLecture, setSelectedLecture] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]); 
  const [courses, setCourses] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  // 1. Static Images for Courses (Different Placeholder images)
  const courseImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80", // Tech
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80", // Laptop
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80", // Robot
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&q=80", // Developer
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80", // Team
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", // Electronics
  ];

  // 2. Logic to generate a different image for each course based on its ID
  const getCourseImage = (courseId: number) => {
    if (!courseId) return courseImages[0];
    const index = courseId % courseImages.length;
    return courseImages[index];
  };

  const fetchCoursesData = async () => {
    try {
      const response = await apiClient.get("lectures/courses/"); 
      const allData = response.data || [];
      setAvailableCourses(allData.filter((c: any) => !c.is_enrolled));
      setCourses(allData.filter((c: any) => c.is_enrolled));
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const handleRegister = async (course: any) => {
    try {
      setLoading(true);
      // Enrollment check: Matching serializer logic
      await apiClient.post("lectures/courses/", { course: course.id }); 
      await fetchCoursesData(); 
      setIsModalOpen(false);
      alert("Successfully enrolled!");
    } catch (err) {
      alert("Enrollment failed.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Learning Portal</h1>
            <p style={{ color: 'white',  }}>Review your course materials and track your goals.</p>
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

        {/* VIDEO & PLAYLIST SECTION */}
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

        {/* MY ENROLLED COURSES */}
        <h2 className="section-heading" style={{ color: 'var(--foreground)' }}>My Enrolled Courses</h2>
        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="course-card" style={cardStyle}>
                <div className="course-thumb">
                  <img src={getCourseImage(course.id)} alt={course.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <span className="badge">Enrolled</span>
                </div>
                <div className="course-body" style={{ padding: '15px' }}>
                  {/* Fixed Title Display */}
                  <h3 className="course-title" style={{ color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    {course.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <Users size={16} color="#6366f1" />
                     <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: 0 }}>
                       Instructor: {course.teacher_name || "Teacher"}
                     </p>
                  </div>
                  <button 
                    className="view-btn" 
                    onClick={() => navigate(`/student/course/${course.id}`)}
                    style={{ width: '100%', backgroundColor: '#6366f1', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--muted-foreground)' }}>No enrolled courses.</p>
          )}
        </div>
      </div>

      {/* ENROLL MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="enroll-modal" style={{ ...cardStyle, width: '90%', maxWidth: '600px', borderRadius: '16px' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Available Courses</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '450px', overflowY: 'auto', padding: '20px' }}>
              {availableCourses.map((item) => (
                <div key={item.id} className="enroll-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '10px', background: 'var(--muted)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <img src={getCourseImage(item.id)} alt="" style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--foreground)' }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6366f1' }}>{item.teacher_name || "Instructor"}</p>
                    </div>
                  </div>
                  <button className="register-btn" onClick={() => handleRegister(item)} disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? "..." : "Enroll"}
                  </button>
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
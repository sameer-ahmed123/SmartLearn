import { useState, useEffect } from "react";
import { 
  PlayCircle, Clock, CheckCircle, 
  BookOpen, Lock, MessageCircle, Star, GraduationCap, Plus, X, Users, Video
} from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import "./StudentLecturePage.css"; 
import apiClient from "@/api/apiClient";

const StudentLecturePage = () => {
  const { id } = useParams(); // URL se course ID lene ke liye
  const navigate = useNavigate(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]); 
  const [courses, setCourses] = useState<any[]>([]); 
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // New States for Video Functionality
  const [lectures, setLectures] = useState<any[]>([]); 
  const [recentLectures, setRecentLectures] = useState<any[]>([]); 
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("video");

  const courseImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
  ];

  const getCourseImage = (courseId: number) => {
    if (!courseId) return courseImages[0];
    const index = courseId % courseImages.length;
    return courseImages[index];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#10b981"; 
    if (progress >= 30) return "#4f46e5"; 
    return "#ef4444"; 
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        apiClient.get('/dashboard/metrics/student/'),
        apiClient.get("lectures/courses/")
      ]);
      
      setMetrics(mRes.data);
      const allCourses = cRes.data || [];
      setAvailableCourses(allCourses.filter((c: any) => !c.is_enrolled));
      const enrolled = allCourses.filter((c: any) => c.is_enrolled);
      setCourses(enrolled);

      let allLectures: any[] = [];
      
      if (enrolled.length > 0) {
        const contents = await Promise.all(
          enrolled.slice(0, 5).map((course: any) => 
            apiClient.get(`/lectures/courses/${course.id}/content/`)
          )
        );
        
        contents.forEach(res => {
          allLectures = [...allLectures, ...res.data];
        });

        allLectures.sort((a, b) => (b.review_progress || 0) - (a.review_progress || 0));
        const top3 = allLectures.slice(0, 3);
        setRecentLectures(top3);

        if (id) {
            const lRes = await apiClient.get(`/lectures/courses/${id}/content/`);
            setLectures(lRes.data);
            if (lRes.data.length > 0) setSelectedLecture(lRes.data[0]);
        } else if (top3.length > 0) {
            setSelectedLecture(top3[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleVideoProgress = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!selectedLecture) return;
    const video = e.currentTarget;
    const progress = Math.floor((video.currentTime / video.duration) * 100);

    if (progress > (selectedLecture.review_progress || 0) && progress % 5 === 0) {
      try {
        await apiClient.post(`/lectures/${selectedLecture.id}/validate/`, {
          review_progress: progress
        });
        const update = (list: any[]) => list.map(l => l.id === selectedLecture.id ? {...l, review_progress: progress} : l);
        setRecentLectures(prev => update(prev));
        if (id) setLectures(prev => update(prev));
      } catch (err) { 
        console.error("Progress Save Error:", err); 
      }
    }
  };

  const handleRegister = async (course: any) => {
    try {
      setLoading(true);
      await apiClient.post("lectures/courses/", { course: course.id }); 
      await fetchData(); 
      setIsModalOpen(false);
      alert("Successfully enrolled!");
    } catch (err) {
      alert("Enrollment failed.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: 'var(--card, #ffffff)',
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)'
  };

  // Logic for Completed and Pending counts
  const completedCount = (id ? lectures : recentLectures).filter(l => (l.review_progress || 0) >= 100).length;
  const pendingCount = (id ? lectures : recentLectures).filter(l => (l.review_progress || 0) < 100).length;

  return (
    <div className="student-page-wrapper">
      <div className="student-main-container">
        
        {/* BANNER */}
        <div className="student-banner">
          <div className="banner-content">
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Learning Portal</h1>
            <p style={{ color: 'white', opacity: 0.9 }}>Review your course materials and track your goals.</p>
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
                    { label: 'LECTURES', val: metrics?.completed_lectures || 0, icon: <PlayCircle />, color: '#f59e0b' },
            { label: 'COMPLETED', val: completedCount, icon: <CheckCircle />, color: '#10b981' },
            { label: 'PENDING', val: pendingCount, icon: <Clock />, color: '#ef4444' },
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
          <div className="video-box-card" style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="video-player-area" style={{ width: '100%', flex: 1, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              {activeTab === "video" ? (
                selectedLecture?.video_url ? (
                  <video 
                    key={selectedLecture.id} 
                    controls 
                    src={selectedLecture.video_url} 
                    onTimeUpdate={handleVideoProgress} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '16/9' }} 
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <PlayCircle size={64} style={{ color: '#6366f1', opacity: 0.8, marginBottom: '15px' }} />
                    <p>Select a lecture to start learning</p>
                  </div>
                )
              ) : (
                <div className="transcript-area" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', padding: '24px', width: '100%', height: '100%', overflowY: 'auto' }}>
                  <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{selectedLecture?.topic}</h3>
                  <div style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {selectedLecture?.summary_text || selectedLecture?.summary || "No summary available for this lecture."}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, color: 'var(--foreground)' }}>{selectedLecture?.topic || "Lesson Details"}</h3>
                <p className="lecture-desc" style={{ color: 'var(--muted-foreground)', marginTop: '10px', fontSize: '0.9rem' }}>
                    {selectedLecture?.description }
                </p>
            </div>
          </div>

          <aside className="sidebar-card" style={cardStyle}>
            <div className="playlist-header" style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={18} color="#6366f1" />
              <span style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>
                {id ? "Course Playlist" : "Recently Viewed"}
              </span>
            </div>
            <div className="lecture-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {(id ? lectures : recentLectures).map((lecture) => (
                <div 
                  key={lecture.id} 
                  className={`lecture-row ${selectedLecture?.id === lecture.id ? 'active' : ''}`} 
                  onClick={() => setSelectedLecture(lecture)}
                  style={selectedLecture?.id === lecture.id ? { backgroundColor: 'var(--muted)', borderColor: '#6366f1', cursor: 'pointer' } : { cursor: 'pointer' }}
                >
                  <div className="status-icon" style={{ color: getProgressColor(lecture.review_progress || 0) }}>
                    {lecture.review_progress >= 100 ? <CheckCircle size={22} /> : <PlayCircle size={22} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="lecture-row-title" style={{ color: 'var(--foreground)', margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{lecture.topic}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', margin: '4px 0' }}>Progress: {lecture.review_progress || 0}%</p>
                    <div className="progress-bar-bg" style={{ backgroundColor: 'var(--muted)', height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${lecture.review_progress || 0}%`, background: getProgressColor(lecture.review_progress || 0), height: '100%', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* MY ENROLLED COURSES */}
        <h2 className="section-heading" style={{ color: 'var(--foreground)', marginTop: '40px' }}>My Enrolled Courses</h2>
        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="course-card" style={cardStyle}>
                <div className="course-thumb">
                  <img src={getCourseImage(course.id)} alt={course.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <span className="badge">Enrolled</span>
                </div>
                <div className="course-body" style={{ padding: '15px' }}>
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
            <p style={{ color: 'var(--muted-foreground)' }}>No enrolled courses found.</p>
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
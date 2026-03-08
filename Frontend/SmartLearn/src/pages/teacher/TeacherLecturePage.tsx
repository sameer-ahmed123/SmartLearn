import { useState, useEffect } from "react";
import { 
  BookOpen, Video, Clock, CheckCircle, Plus, 
  GraduationCap, PlayCircle, Lock 
} from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import "./TeacherLecture.css"; 
import CreateCourseModal from "../../components/Dashboard/teacher/CreateCourseModal";
import LectureValidationQueueTable from "@/components/Dashboard/teacher/LectureValidationQueueTable";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";

const TeacherLecturePage = () => {
  const { id } = useParams();
  const [metrics, setMetrics] = useState<any>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("video"); 

  const lectureVideos = [
    { id: 1, title: "01. Introduction to Quantum Mechanics", progress: 100, status: 'completed' },
    { id: 2, title: "02. Wave-Particle Duality", progress: 45, status: 'playing' },
    { id: 3, title: "03. The Uncertainty Principle", progress: 10, status: 'locked' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#10b981"; 
    if (progress >= 30) return "#f59e0b"; 
    return "#ef4444"; 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          apiClient.get("/dashboard/metrics/teacher/"),
          apiClient.get("/lectures/courses")
        ]);
        setMetrics(mRes.data);
        setCourses(cRes.data);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  // Shared Inline Styles for Dark Mode Force
  const cardBgStyle = { 
    backgroundColor: 'var(--card, #ffffff)', 
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)' 
  };

  if (isLoading) return <div className="dashboard-wrapper" style={{textAlign: 'center', paddingTop: '100px', color: 'var(--foreground)'}}>Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div className="dashboard-banner">
          <div>
             <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>Lecture Dashboard</h2>
             <p style={{ opacity: 0.9, color: 'white' }}>Review AI content and track student watch progress.</p>
             <button onClick={() => setIsModalOpen(true)} className="new-course-btn">
                <Plus size={18} /> New Course
             </button>
          </div>
          <GraduationCap size={150} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          {[
            { label: 'COURSES', val: metrics?.total_courses ?? 2, icon: <BookOpen size={22} />, color: '#4f46e5' },
            { label: 'LECTURES', val: metrics?.total_lectures_generated ?? 0, icon: <Video size={22} />, color: '#10b981' },
            { label: 'PENDING', val: metrics?.pending_validation_count ?? 0, icon: <Clock size={22} />, color: '#f59e0b' },
            { label: 'VALIDATED', val: metrics?.total_validated_lectures ?? 0, icon: <CheckCircle size={22} />, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="stat-item-card" style={cardBgStyle}>
              <div style={{ padding: '10px', borderRadius: '10px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div className="stat-text-container">
                <p style={{ color: 'var(--muted-foreground, #64748b)', margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</p>
                <h3 style={{ margin: 0, color: 'var(--foreground)' }}>{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="tabs-row" style={{ backgroundColor: 'var(--muted, #f1f5f9)' }}>
          <button 
            onClick={() => setActiveTab("video")} 
            className={activeTab === 'video' ? 'tab-active' : 'tab-btn'}
            style={activeTab === 'video' ? { backgroundColor: 'var(--card)', color: '#4f46e5' } : { color: 'var(--foreground)' }}
          >
            Video Preview
          </button>
          <button 
            onClick={() => setActiveTab("transcript")} 
            className={activeTab === 'transcript' ? 'tab-active' : 'tab-btn'}
            style={activeTab === 'transcript' ? { backgroundColor: 'var(--card)', color: '#4f46e5' } : { color: 'var(--foreground)' }}
          >
            Transcript
          </button>
        </div>

        <div className="main-content-split">
          <div className="video-container-box" style={cardBgStyle}>
            {activeTab === "video" ? (
              <div className="video-dark-screen">
                <PlayCircle size={64} style={{ marginBottom: '15px', opacity: 0.8 }} />
                <p>Video Preview Interface</p>
              </div>
            ) : (
              <textarea 
                className="transcript-area" 
                defaultValue="Transcript content here..." 
                style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              />
            )}
          </div>

          <div className="playlist-card" style={cardBgStyle}>
            <div className="playlist-header">
              <BookOpen size={18} color="#6366f1" />
              <span style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>Course Playlist</span>
            </div>
            <div className="playlist-items">
              {lectureVideos.map((v) => (
                <div 
                  key={v.id} 
                  className={`playlist-item ${v.status === 'playing' ? 'item-active' : ''}`}
                  style={v.status === 'playing' ? { backgroundColor: 'var(--muted)', border: '1px solid rgba(99, 102, 241, 0.2)' } : {}}
                >
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <div className="item-icon" style={{ marginTop: '2px' }}>
                      {v.status === 'completed' && <CheckCircle size={18} color="#10b981" />}
                      {v.status === 'playing' && <PlayCircle size={18} color="#6366f1" />}
                      {v.status === 'locked' && <Lock size={18} color="#cbd5e1" />}
                    </div>
                    <div className="item-content" style={{ width: '100%' }}>
                      <h4 style={{ fontWeight: '800', color: 'var(--foreground)', margin: 0 }}>{v.title}</h4>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', margin: '4px 0' }}>Progress: {v.progress}%</p>
                      <div className="mini-progress-bg" style={{ backgroundColor: 'var(--muted)' }}>
                        <div 
                          className="mini-progress-fill" 
                          style={{ 
                            width: `${v.progress}%`, 
                            background: getProgressColor(v.progress) 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 style={{ margin: '30px 0 20px 0', color: 'var(--foreground)' }}>My Courses</h2>
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseListCard key={course.id} course={course} />
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
           <h2 style={{ marginBottom: '20px', color: 'var(--foreground)' }}>Lecture Validation Queue</h2>
           <LectureValidationQueueTable />
        </div>
      </div>
      <CreateCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={(nc) => setCourses([nc, ...courses])} />
    </div>
  );
};

export default TeacherLecturePage;
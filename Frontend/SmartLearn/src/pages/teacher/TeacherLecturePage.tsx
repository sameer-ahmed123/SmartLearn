import { useState, useEffect } from "react";
import { 
  BookOpen, Video, Clock, CheckCircle, Plus, 
  GraduationCap, PlayCircle, ArrowLeft, 
  FileText, MessageSquare 
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
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("video"); 

  const lectureVideos = [
    { id: 1, title: "01. Introduction to React Hooks", progress: 85, color: "#4f46e5" },
    { id: 2, title: "02. State Management Patterns", progress: 45, color: "#f59e0b" },
    { id: 3, title: "03. Advanced Routing Techniques", progress: 10, color: "#10b981" },
  ];

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

  if (isLoading) return <div className="dashboard-wrapper" style={{textAlign: 'center', paddingTop: '100px'}}>Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* BANNER */}
        <div className="dashboard-banner">
          <div>
             <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16}/> Back
             </button>
             <h2 style={{ margin: 0, fontSize: '2rem' }}>Lecture Dashboard</h2>
             <p style={{ opacity: 0.9 }}>Review AI content and track student watch progress.</p>
             <button onClick={() => setIsModalOpen(true)} style={{ marginTop: '15px', background: 'white', color: '#4f46e5', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> New Course
             </button>
          </div>
          <GraduationCap size={150} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
        </div>

        {/* STATS ROW */}
        <div className="stats-grid">
          {[
            { label: 'COURSES', val: metrics?.total_courses ?? 2, icon: <BookOpen />, color: '#4f46e5' },
            { label: 'LECTURES', val: metrics?.total_lectures_generated ?? 0, icon: <Video />, color: '#10b981' },
            { label: 'PENDING', val: metrics?.pending_validation_count ?? 0, icon: <Clock />, color: '#f59e0b' },
            { label: 'VALIDATED', val: metrics?.total_validated_lectures ?? 0, icon: <CheckCircle />, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="stat-item-card">
              <div style={{ color: s.color, background: `${s.color}15`, padding: '10px', borderRadius: '12px' }}>{s.icon}</div>
              <div><p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{s.label}</p><h3 style={{ margin: 0 }}>{s.val}</h3></div>
            </div>
          ))}
        </div>

        {/* MAIN SPLIT */}
        <div className="main-content-split">
          <div>
            <div className="tabs-row">
              <button onClick={() => setActiveTab("video")} style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: activeTab === 'video' ? 'var(--card, white)' : 'transparent', color: activeTab === 'video' ? '#4f46e5' : 'inherit' }}>Video Preview</button>
              <button onClick={() => setActiveTab("transcript")} style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: activeTab === 'transcript' ? 'var(--card, white)' : 'transparent', color: activeTab === 'transcript' ? '#4f46e5' : 'inherit' }}>Transcript</button>
            </div>

            <div className="video-container-box">
              {activeTab === "video" ? (
                <div className="video-dark-screen">
                  <PlayCircle size={64} style={{ marginBottom: '15px', opacity: 0.8 }} />
                  <p>Video Preview Interface</p>
                </div>
              ) : (
                <textarea style={{ width: '100%', height: '400px', border: '1px solid var(--border, #e2e8f0)', borderRadius: '10px', padding: '15px', background: 'var(--background, #f8fafc)', color: 'inherit' }} defaultValue="Transcript content here..." />
              )}
            </div>
          </div>

          <aside>
            <div className="sidebar-box">
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Validation Status</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '10px', fontWeight: 500 }}><CheckCircle size={16} /> AI Generated</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 500 }}><MessageSquare size={16} /> Needs Review</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* PROGRESS */}
        <h2 style={{ margin: '40px 0 20px 0' }}>Video Watch Progress</h2>
        <div className="progress-section-box">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lectureVideos.map((v) => (
              <div key={v.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>{v.title}</span>
                  <span style={{ color: v.color }}>{v.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div style={{ width: `${v.progress}%`, height: '100%', background: v.color, borderRadius: '10px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COURSE LIST */}
        <h2 style={{ margin: '30px 0 20px 0' }}>My Courses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map((course) => (
            <CourseListCard key={course.id} course={course} />
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
           <h2 style={{ marginBottom: '20px' }}>Lecture Validation Queue</h2>
           <LectureValidationQueueTable />
        </div>
      </div>
      <CreateCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={(nc) => setCourses([nc, ...courses])} />
    </div>
  );
};

export default TeacherLecturePage;
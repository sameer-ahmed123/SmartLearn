import { useState, useEffect } from "react";
import { 
  BookOpen, Video, Clock, CheckCircle, Plus, 
  GraduationCap, PlayCircle, Lock, XCircle 
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
  const [lectures, setLectures] = useState<any[]>([]); 
  const [recentLectures, setRecentLectures] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("video"); 
  const [selectedLecture, setSelectedLecture] = useState<any>(null);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#10b981"; 
    if (progress >= 30) return "#4f46e5"; 
    return "#ef4444"; 
  };

  const fetchData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        apiClient.get("/lectures/dashboard/metrics/"),
        apiClient.get("/lectures/courses/")
      ]);
      setMetrics(mRes.data);
      setCourses(cRes.data);

      let allLectures: any[] = [];
      
      if (cRes.data.length > 0) {
        const contents = await Promise.all(
          cRes.data.slice(0, 5).map((course: any) => 
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
      console.error("Fetch Error:", err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleValidationAction = async (status: 'validated' | 'rejected') => {
    if (!selectedLecture) return;
    try {
      await apiClient.post(`/lectures/${selectedLecture.id}/validate/`, {
        validation_status: status,
        review_progress: 100
      });
      fetchData();
    } catch (err) {
      console.error("Validation Error:", err);
    }
  };

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
             <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>Teacher Dashboard</h2>
             <p style={{ opacity: 0.9, color: 'white' }}>Continue where you left off with your recently viewed lectures.</p>
             <button onClick={() => setIsModalOpen(true)} className="new-course-btn">
                <Plus size={18} /> New Course
             </button>
          </div>
          <GraduationCap size={150} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
        </div>

        <div className="stats-grid">
          {[
            { label: 'COURSES', val: metrics?.total_courses ?? 0, icon: <BookOpen size={22} />, color: '#4f46e5' },
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
          <button onClick={() => setActiveTab("video")} className={activeTab === 'video' ? 'tab-active' : 'tab-btn'} style={activeTab === 'video' ? { backgroundColor: 'var(--card)', color: '#4f46e5' } : { color: 'var(--foreground)' }}>Video Preview</button>
          <button onClick={() => setActiveTab("transcript")} className={activeTab === 'transcript' ? 'tab-active' : 'tab-btn'} style={activeTab === 'transcript' ? { backgroundColor: 'var(--card)', color: '#4f46e5' } : { color: 'var(--foreground)' }}>Review Summary</button>
        </div>

        <div className="main-content-split">
          <div className="video-container-box" style={{ ...cardBgStyle, padding: 0, overflow: 'hidden' }}>
            {activeTab === "video" ? (
              <div className="video-dark-screen" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                {selectedLecture?.video_url ? (
                  <video 
                    key={selectedLecture.id} 
                    controls 
                    src={selectedLecture.video_url} 
                    onTimeUpdate={handleVideoProgress} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '16/9' }} 
                  />
                ) : (
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <PlayCircle size={64} style={{ marginBottom: '15px', opacity: 0.8 }} />
                        <p>Select a lecture to start reviewing</p>
                    </div>
                )}
              </div>
            ) : (
              <div className="transcript-area" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', padding: '24px', borderRadius: '8px', height: '100%', overflowY: 'auto' }}>
                  <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{selectedLecture?.topic}</h3>
                  <div style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {selectedLecture?.summary_text || selectedLecture?.summary || "No summary available for this lecture."}
                  </div>
              </div>
            )}
          </div>

          <div className="playlist-card" style={cardBgStyle}>
            <div className="playlist-header">
              <Video size={18} color="#6366f1" />
              <span style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{id ? "Course Playlist" : "Recently Viewed"}</span>
            </div>
            <div className="playlist-items">
              {(id ? lectures : recentLectures).map((v) => (
                <div key={v.id} onClick={() => setSelectedLecture(v)} className={`playlist-item ${selectedLecture?.id === v.id ? 'item-active' : ''}`} style={selectedLecture?.id === v.id ? { backgroundColor: 'var(--muted)', border: '1px solid rgba(99, 102, 241, 0.2)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <div className="item-icon" style={{ marginTop: '2px' }}>
                      {v.validation_status === 'validated' ? <CheckCircle size={18} color="#10b981" /> : <Clock size={18} color="#f59e0b" />}
                    </div>
                    <div className="item-content" style={{ width: '100%' }}>
                      <h4 style={{ fontWeight: '800', color: 'var(--foreground)', margin: 0, fontSize: '0.9rem' }}>{v.topic}</h4>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', margin: '4px 0' }}>Progress: {v.review_progress}%</p>
                      <div className="mini-progress-bg" style={{ backgroundColor: 'var(--muted)' }}><div className="mini-progress-fill" style={{ width: `${v.review_progress}%`, background: getProgressColor(v.review_progress) }}></div></div>
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
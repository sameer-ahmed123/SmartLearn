import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayCircle, CheckCircle, ArrowLeft, Globe, BookOpen } from "lucide-react";
import apiClient from "@/api/apiClient";
import "./StudentCourseDetail.css";

const StudentCourseDetailPage = () => {
  const { courseid } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backend Base URL
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseid || courseid === "undefined") {
        setError("Invalid Course ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Call 1: Get Course Basic Info (Matches: path('courses/<int:pk>/', course_detail_actions))
        const courseResponse = await apiClient.get(`lectures/courses/${courseid}/`);
        setCourse(courseResponse.data);

        // Call 2: Get Lectures List (Matches: path('courses/<int:course_id>/content/', course_lecture_list))
        const lecturesResponse = await apiClient.get(`lectures/courses/${courseid}/content/`);
        
        // Ensure we are handling the array correctly
        const lectureData = Array.isArray(lecturesResponse.data) ? lecturesResponse.data : [];
        
        const approved = lectureData.filter(
          (l: any) => l.validation_status === 'validated' || l.validation_status === 'Approved'
        );

        setLectures(approved);
      } catch (err: any) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseid]);

  if (loading) return <div className="loading-state">Loading Course...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const getFullImageUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1350&q=80";
    if (path.startsWith('http')) return path; 
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const courseBannerImage = getFullImageUrl(course?.thumbnail || course?.image);

  return (
    <div className="course-detail-container">
      <button onClick={() => navigate(-1)} className="back-navigation">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {course && (
        <>
          <div 
            className="course-banner-card" 
            style={{ 
              backgroundImage: `url(${courseBannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="banner-overlay">
              <div className="banner-content">
                <div className="course-icon-wrapper">
                  <BookOpen size={32} color="white" />
                </div>
                <div className="course-info-text">
                  <h1 className="course-title">{course.title}</h1>
                  <p className="course-desc">{course.description}</p>
                </div>
              </div>
              <div className="status-badge-container">
                <div className="published-badge">
                  <Globe size={14} /> PUBLISHED
                </div>
              </div>
            </div>
          </div>

          <div className="course-info-bar">
            <div className="status-label">
              COURSE STATUS: <span className="status-active">Active (Learning)</span>
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-heading">
              <PlayCircle color="#6366f1" size={24} /> Available Lectures
            </h2>

            <div className="lectures-grid">
              {/* Dummy/Demo Lecture matching your Route: /student/lecture/:id/review */}
              <div className="lecture-card-modern" style={{ borderLeft: "5px solid #f39c12" }}>
                <div className="lecture-info-main">
                  <div className="lecture-number">0</div>
                  <div className="lecture-text-details">
                    <h3 className="lecture-topic">Demo Lecture (Testing Route)</h3>
                    <div className="approved-tag" style={{ color: "#f39c12" }}>
                      <CheckCircle size={14} /> Sample
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/student/lecture/demo-id/review`)} 
                  className="start-lecture-btn"
                  style={{ background: "#f39c12" }}
                >
                  View Lecture
                </button>
              </div>

              {/* Real Lectures from API matching your Route: /student/lecture/:id/review */}
              {lectures.map((lecture, index) => (
                <div key={lecture.id} className="lecture-card-modern">
                  <div className="lecture-info-main">
                    <div className="lecture-number">{index + 1}</div>
                    <div className="lecture-text-details">
                      <h3 className="lecture-topic">{lecture.topic}</h3>
                      <div className="approved-tag">
                        <CheckCircle size={14} /> Approved
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/lecture/${lecture.id}/review`)}
                    className="start-lecture-btn"
                  >
                    View Lecture
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCourseDetailPage;
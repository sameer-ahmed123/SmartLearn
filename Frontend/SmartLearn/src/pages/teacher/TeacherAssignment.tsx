import { useState, useEffect } from "react";
import { 
  Plus, FileText, Users, Calendar, 
  Search, ArrowRight, 
  CheckCircle, Clock, BarChart, Loader2, X, Settings
} from "lucide-react"; 
import styles from "./TeacherAssignment.module.css";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";
import { useNavigate } from "react-router-dom";

const TeacherAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseImages = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignResponse, courseResponse] = await Promise.all([
          apiClient.get("/assessments/teacher-list/"),
          apiClient.get("/lectures/courses")
        ]);
        setAssignments(assignResponse.data || []);
        setCourses(courseResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalAssigned = assignments.length;
  const totalSubmissions = assignments.reduce((acc, curr) => acc + (Number(curr.submission_count) || 0), 0);
  
  // Logic updated to match modal status checks
  const publishedAssignments = assignments.filter(a => (a.status || a.assignment_data?.status)?.toLowerCase() === 'published').length;
  const draftAssignments = assignments.filter(a => (a.status || a.assignment_data?.status)?.toLowerCase() !== 'published').length;

  const filteredData = assignments.filter(a => 
    a.title?.toLowerCase().includes(search.toLowerCase()) || 
    a.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Shared Inline Styles for Dynamic Theme
  const cardBgStyle = { 
    backgroundColor: 'var(--card, #ffffff)', 
    color: 'var(--foreground, #1e293b)',
    borderColor: 'var(--border, #e2e8f0)' 
  };

  if (loading) return (
    <div className={styles.pageWrapper} style={{textAlign: 'center', paddingTop: '100px'}}>
      <Loader2 size={40} className="animate-spin" style={{margin: '0 auto 10px', color: '#6366f1'}} />
      <p style={{color: 'var(--foreground)'}}>Loading Assignments...</p>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.assignBanner}>
        <div style={{ flex: 1, zIndex: 2 }}>
          <h2 className={styles.bannerTitle}>Assignments</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Track student submissions and grade their work.</p>
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create Assignment
          </button>
        </div>
        <FileText size={130} className={styles.bgIcon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={cardBgStyle}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Select Course</h3>
              <X size={24} className={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
            </div>
            <div className={styles.modalList}>
              {courses.map((course, index) => (
                <div key={`course-${course.id}-${index}`} className={styles.modalItem} style={{borderBottom: '1px solid var(--border)'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={courseImages[index % courseImages.length]} alt="" className={styles.modalCourseImg} />
                    <div>
                      <span className={styles.modalCourseTitle}>{course.title}</span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>
                        {course.lecture_count || 0} Lectures
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/teacher/course/${course.id}?tab=assessments`)} className={styles.modalManageBtn}>
                    <Settings size={14} /> Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsRow}>
        {[
          { label: 'Total Assigned', val: totalAssigned, icon: <BarChart size={22} />, color: '#3b82f6' },
          { label: 'Total Submissions', val: totalSubmissions, icon: <Users size={22} />, color: '#10b981' },
          { label: 'Active (Published)', val: publishedAssignments, icon: <CheckCircle size={22} />, color: '#f59e0b' },
          { label: 'Draft', val: draftAssignments, icon: <Clock size={22} />, color: '#ef4444' },
        ].map((s, i) => (
          <div key={`stat-${i}`} className={styles.statCardBox} style={cardBgStyle}>
            <div style={{ padding: '10px', borderRadius: '10px', background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className={styles.statTextContainer}>
              <p style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              <h3 style={{ color: 'var(--foreground)' }}>{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search by title or course..." 
          className={styles.searchInput}
          style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.assignGrid}>
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => {
            const rawDate = item.deadline || item.assignment_data?.deadline || item.due_date || item.created_at;
            const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : 'No deadline';
            
            // Logic integrated from Editor Modal with fallback for nested data
            const currentStatus = (item.status || item.assignment_data?.status || 'draft').toLowerCase();
            
            const statusDisplay = 
              currentStatus === 'published' ? 'Published (Live)' : 
              currentStatus === 'draft' ? 'Draft (Private)' : 
              currentStatus === 'archived' ? 'Archived' : 'Draft (Private)';

            // Status styling logic
            const statusClass = currentStatus === 'published' ? styles.open : styles.closed;

            return (
              <div key={item.id || `assignment-${idx}`} className={styles.assignCard} style={cardBgStyle}>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                  {statusDisplay}
                </span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: '5px 0' }}>
                  <strong>Course:</strong> {item.course_name || 'General'}
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                    <Users size={14} style={{ marginRight: '5px' }} /> {item.submission_count || 0} Submissions
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} style={{ marginRight: '5px' }} /> {formattedDate}
                  </div>
                </div>
                <div className={styles.cardFooter} style={{borderTop: '1px solid var(--border)'}} onClick={() => navigate(`/teacher/lecture/${item.lecture_id || item.lecture}/assignment`)}>
                  <span style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>View Submissions</span>
                  <ArrowRight size={16} color="#3b82f6" />
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noData} style={{backgroundColor: 'var(--card)', color: 'var(--muted-foreground)'}}>No assignments found.</div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignment;
import { useState, useEffect } from "react";
import { 
  Plus, FileText, Users, Calendar, 
  Search, ArrowRight, 
  CheckCircle, Clock, AlertCircle, BarChart
} from "lucide-react"; 
import styles from "./TeacherAssignment.module.css";
import apiClient from "@/api/apiClient";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import type { CourseSummary } from "@/types/Courses/Types";

const TeacherAssignment = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignData = [
          { id: 1, title: "Quantum Mechanics Essay", course: "Physics II", submissions: 28, total: 30, status: 'Open', due: "20 Mar" },
          { id: 2, title: "UI Case Study", course: "Design Systems", submissions: 15, total: 45, status: 'Open', due: "25 Mar" },
          { id: 3, title: "Backend API Docs", course: "Web Dev", submissions: 40, total: 40, status: 'Closed', due: "10 Mar" },
        ];
        
        const courseResponse = await apiClient.get("/lectures/courses");
        
        setAssignments(assignData);
        setCourses(courseResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      
      {/* BLUE-TEAL GRADIENT BANNER */}
      <div className={styles.assignBanner}>
        <div>
          <h2 className={styles.bannerTitle}>Assignments</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Track student submissions and grade their work.</p>
        </div>
        <FileText size={130} className={styles.bgIcon} />
      </div>

      {/* STATS BOXES */}
      <div className={styles.statsRow}>
        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <BarChart size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Total Assigned</p>
            <h3>{assignments.length}</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Submissions</p>
            <h3>83%</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Pending Review</p>
            <h3>12</h3>
          </div>
        </div>

        <div className={styles.statCardBox}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertCircle size={22} />
          </div>
          <div className={styles.statTextContainer}>
            <p>Overdue</p>
            <h3>05</h3>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search assignments..." 
          className={styles.searchInput}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ASSIGNMENT GRID */}
      <div className={styles.assignGrid}>
        {filteredData.map((item) => (
          <div key={item.id} className={styles.assignCard}>
            <span className={`${styles.statusBadge} ${item.status === 'Open' ? styles.open : styles.closed}`}>
              {item.status}
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>{item.course}</p>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                <Users size={14} style={{ marginRight: '5px' }} /> 
                {item.submissions}/{item.total} Done
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                <Calendar size={14} style={{ marginRight: '5px' }} /> 
                Due: {item.due}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                Grade Now
              </span>
              <ArrowRight size={16} color="#3b82f6" />
            </div>
          </div>
        ))}
      </div>

      {/* MY COURSES SECTION */}
      <h2 style={{ margin: '50px 0 20px 0', fontSize: '1.5rem', fontWeight: '700' }} className={styles.cardTitle}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {courses.map((course) => (
          <CourseListCard key={course.id} course={course} />
        ))}
      </div>

    </div>
  );
};

export default TeacherAssignment;
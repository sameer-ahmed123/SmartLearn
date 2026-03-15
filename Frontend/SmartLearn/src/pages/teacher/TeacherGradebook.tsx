import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, 
  Edit2, Trash2, TrendingUp, 
  Award, BookOpen, Users, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from "./TeacherGradeBook.module.css";
import apiClient from '@/api/apiClient';

interface StudentGrade {
  id: number;
  student_name: string;
  student_id_num: string;
  assignments_marks: number;
  quizzes_marks: number;
  exam_marks: number;
  score: number;
  grade: string;
}

interface Course {
  id: number;
  title: string;
}

const GradeBookPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [dynamicStats, setDynamicStats] = useState({
    avgGrade: "0%",
    passRate: "0%"
  });

  const navigate = useNavigate();

  // Student Portal wala Color Logic
  const getProgressColor = (score: number) => {
    const s = Number(score) || 0;
    if (s >= 80) return "#10b981"; // Green
    if (s >= 70) return "#f59e0b"; // Orange/Yellow
    if (s >= 60) return "#fb923c"; // Dark Orange
    if (s >= 50) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  const updateStats = (currentGrades: StudentGrade[]) => {
    if (currentGrades.length === 0) {
      setDynamicStats({ avgGrade: "0%", passRate: "0%" });
      return;
    }

    let totalSum = 0;
    let passCount = 0;

    currentGrades.forEach(student => {
      const score = student.score || 0;
      totalSum += score;
      if (score >= 50) passCount++; 
    });

    const avg = (totalSum / currentGrades.length).toFixed(1);
    const rate = ((passCount / currentGrades.length) * 100).toFixed(0);

    setDynamicStats({
      avgGrade: `${avg}%`,
      passRate: `${rate}%`
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const authData = localStorage.getItem('smartlearn-auth-storage');
        const token = authData ? JSON.parse(authData).state?.accessToken : null;

        if (!token) {
          navigate('/login');
          return;
        }

        const courseRes = await apiClient.get('/lectures/courses/teacher-courses/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const fetchedCourses = Array.isArray(courseRes.data) ? courseRes.data : [];
        setCourses(fetchedCourses);

        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0].id.toString());
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [navigate]);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedCourse) return;
      
      try {
        setLoading(true);
        const authData = localStorage.getItem('smartlearn-auth-storage');
        const token = authData ? JSON.parse(authData).state?.accessToken : null;

        const res = await apiClient.get(`/assessments/teacher-gradebook-summary/?course_id=${selectedCourse}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const fetchedGrades = Array.isArray(res.data) ? res.data : [];
        setGrades(fetchedGrades);
        updateStats(fetchedGrades); 
      } catch (err: any) {
        console.error("Error fetching gradebook:", err);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedCourse, navigate]);

  const handleExport = () => {
    if (grades.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Student Name,Student ID,Assignments (%),Quizzes (%),Final Exam (%),Total (%),Grade"];
    const rows = grades.map(row => {
      return `${row.student_name},${row.student_id_num},${row.assignments_marks || 0},${row.quizzes_marks || 0},${row.exam_marks || 0},${row.score},${row.grade}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GradeBook_Course_${selectedCourse}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGrades = grades.filter(item => 
    item.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && courses.length === 0) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Gradebook...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Academic <span className={styles.highlight}>Grade Book</span></h2>
              <p className={styles.bannerSub}>Monitor student performance and manage academic records effectively.</p>
          </div>
          < GraduationCap size={140} className={styles.capIcon} />
        </div>

        <div className={styles.statsRow}>
          {[
            { label: 'AVG GRADE', val: dynamicStats.avgGrade, icon: <TrendingUp size={22} />, color: '#6366f1' },
            { label: 'PASS RATE', val: dynamicStats.passRate, icon: <Award size={22} />, color: '#10b981' },
            { label: 'STUDENTS', val: grades.length.toString(), icon: <Users size={22} />, color: '#f59e0b' },
            { label: 'COURSES', val: courses.length.toString(), icon: <BookOpen size={22} />, color: '#f43f5e' },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
              <div className={styles.statInfo}><p>{stat.label}</p><h3>{stat.val}</h3></div>
            </div>
          ))}
        </div>

        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className={styles.actionGroup}>
            <select className={styles.courseSelect} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Select a Course</option>
                {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
            <button className={styles.roundActionBtn}><Filter size={18} /></button>
            <button className={styles.exportBtnActions} onClick={handleExport}><Download size={18} /> Export</button>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            {loading ? <div style={{padding: '40px', textAlign: 'center'}}>Updating records...</div> : (
              <table className={styles.gradeTable}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Quiz</th>
                    <th>Final Exam</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.length > 0 ? filteredGrades.map((row) => {
                    const studentColor = getProgressColor(row.score);
                    return (
                      <tr key={row.id}>
                        <td>
                          <div className={styles.studentCell}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student_name}`} alt="" className={styles.avatar} />
                            <div><p className={styles.sName}>{row.student_name}</p><span className={styles.sId}>{row.student_id_num}</span></div>
                          </div>
                        </td>
                        <td><div className={styles.scoreBadge}>{row.assignments_marks || 0}%</div></td>
                        <td><div className={styles.scoreBadge}>{row.quizzes_marks || 0}%</div></td>
                        <td><div className={styles.scoreBadge}>{row.exam_marks || 0}%</div></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 850, color: studentColor }}>{row.score}%</span>
                            <div style={{ width: '60px', height: '4px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${row.score}%`, height: '100%', background: studentColor }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.gradeBadge} style={{ 
                            color: studentColor, 
                            backgroundColor: `${studentColor}15`,
                            padding: '6px 18px',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            {row.grade}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <button className={styles.circleEdit} onClick={() => navigate(`/teacher/student-report/${row.id}?course_id=${selectedCourse}`)}><Edit2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>No students found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeBookPage;
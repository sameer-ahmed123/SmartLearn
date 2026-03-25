import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  PlayCircle,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./TeacherGradeBook.module.css";
import apiClient from "@/api/apiClient";

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
  const [loading, setLoading] = useState(false);

  const [dynamicStats, setDynamicStats] = useState({
    avgGrade: "0%",
    passRate: "0%",
  });

  const navigate = useNavigate();

  const getProgressColor = (score: number) => {
    const s = Number(score) || 0;
    if (s >= 80) return "#10b981"; 
    if (s >= 70) return "#f59e0b"; 
    if (s >= 60) return "#fb923c"; 
    if (s >= 50) return "#eab308"; 
    return "#ef4444"; 
  };

  // Memoized to prevent re-render loops
  const updateStats = useCallback((currentGrades: StudentGrade[]) => {
    if (currentGrades.length === 0) {
      setDynamicStats({ avgGrade: "0%", passRate: "0%" });
      return;
    }

    let totalSum = 0;
    let passCount = 0;

    currentGrades.forEach((student) => {
      const score = student.score || 0;
      totalSum += score;
      if (score >= 50) passCount++;
    });

    const avg = (totalSum / currentGrades.length).toFixed(1);
    const rate = ((passCount / currentGrades.length) * 100).toFixed(0);

    setDynamicStats({
      avgGrade: `${avg}%`,
      passRate: `${rate}%`,
    });
  }, []);

  // Effect 1: Fetch Courses once on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const courseRes = await apiClient.get("/lectures/courses/teacher-courses/");
        const fetchedCourses = Array.isArray(courseRes.data) ? courseRes.data : [];
        setCourses(fetchedCourses);

        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0].id.toString());
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effect 2: Fetch Grades when selectedCourse changes
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchGrades = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/dashboard/teacher/gradebook-summary/${selectedCourse}/`);
        const fetchedGrades = Array.isArray(res.data) ? res.data : [];
        console.log(fetchedGrades)
        setGrades(fetchedGrades);
        updateStats(fetchedGrades);
      } catch (err: any) {
        console.error("Error fetching gradebook:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedCourse, navigate, updateStats]);

  const handleExport = () => {
    if (grades.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Student Name,Student ID,Assignments (%),Quizzes (%),Final Exam (%),Total (%),Grade"];
    const rows = grades.map((row) => 
      `${row.student_name},${row.student_id_num},${row.assignments_marks || 0},${row.quizzes_marks || 0},${row.exam_marks || 0},${row.score},${row.grade}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GradeBook_Course_${selectedCourse}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGrades = grades.filter((item) =>
    item.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>
              Academic <span className={styles.highlight}>Grade Book</span>
            </h2>
            <p className={styles.bannerSub}>
              Monitor student performance and manage academic records effectively.
            </p>
          </div>
          <GraduationCap size={140} className={styles.capIcon} />
        </div>

        <div className={styles.statsRow}>
          {[
            { label: "AVG GRADE", val: dynamicStats.avgGrade, icon: <TrendingUp size={22} />, color: "#6366f1" },
            { label: "PASS RATE", val: dynamicStats.passRate, icon: <Award size={22} />, color: "#10b981" },
            { label: "STUDENTS", val: grades.length.toString(), icon: <Users size={22} />, color: "#f59e0b" },
            { label: "COURSES", val: courses.length.toString(), icon: <BookOpen size={22} />, color: "#f43f5e" },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div
                className={styles.statIconCircle}
                style={{ color: stat.color, background: `${stat.color}15` }}
              >
                {stat.icon}
              </div>
              <div className={styles.statInfo}>
                <p>{stat.label}</p>
                <h3>{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.actionGroup}>
            <select
              className={styles.courseSelect}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="" disabled>Select a Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <button className={styles.roundActionBtn}>
              <Filter size={18} />
            </button>
            <button className={styles.exportBtnActions} onClick={handleExport}>
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Updating records...</div>
            ) : (
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
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((row) => {
                      const studentColor = getProgressColor(row.score);
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className={styles.studentCell}>
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student_name}`}
                                alt=""
                                className={styles.avatar}
                              />
                              <div>
                                <p className={styles.sName}>{row.student_name}</p>
                                <span className={styles.sId}>{row.student_id_num}</span>
                              </div>
                            </div>
                          </td>
                          <td><div className={styles.scoreBadge}>{row.assignments_marks || 0}%</div></td>
                          <td><div className={styles.scoreBadge}>{row.quizzes_marks || 0}%</div></td>
                          <td><div className={styles.scoreBadge}>{row.exam_marks || 0}%</div></td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontWeight: 850, color: studentColor }}>{row.score}%</span>
                              <div style={{ width: "60px", height: "4px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${row.score}%`, height: "100%", background: studentColor }}></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={styles.gradeBadge}
                              style={{ color: studentColor, backgroundColor: `${studentColor}15`, padding: "6px 18px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 800 }}
                            >
                              {row.grade}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCell}>
                              <button
                                className={styles.circleEdit}
                                title="View Report"
                                onClick={() => navigate(`/teacher/student-report/${row.id}/${selectedCourse}`)}
                              >
                                <BookOpen size={14} />
                              </button>
                              <button
                                className={styles.circleEdit}
                                title="View Video Progress"
                                onClick={() => navigate(`/teacher/student-video-progress/${row.id}/${selectedCourse}`)}
                              >
                                <PlayCircle size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px" }}>No students found.</td>
                    </tr>
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
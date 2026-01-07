// OVERALL TEACHER_DASHBOARD
// ASSEMBELS STATS --- UPLOAD FORM --- VALIDATION QUEUE
import { useState, useEffect } from "react";
import StatsCard from "../../components/Dashboard/shared/StatsCard";
import LectureValidationQueueTable from "@/components/Dashboard/teacher/LectureValidationQueueTable";
import CreateCourseModal from "../../components/Dashboard/teacher/CreateCourseModal";
import CourseListCard from "@/components/Dashboard/teacher/CourseListCard";
import styles from "./TeacherDashboard.module.css";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";
import { Link } from "react-router-dom";

interface MetricsData {
  total_courses: number;
  total_lectures_generated: number;
  pending_validation_count: number;
  total_validated_lectures: number;
}

const DummyChart = () => (
  <svg viewBox="0 0 100 100" width="150" height="150">
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="transparent"
      stroke="#e0e0e0"
      strokeWidth="20"
    />
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="transparent"
      stroke="#3498db"
      strokeWidth="20"
      strokeDasharray="180 251"
      transform="rotate(-90 50 50)"
    />
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="transparent"
      stroke="#f1c40f"
      strokeWidth="20"
      strokeDasharray="50 251"
      transform="rotate(168 50 50)"
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      fontSize="12"
      fill="#2c3e50"
      fontWeight="bold"
    >
      Stats
    </text>
  </svg>
);

const TeacherDashboardPage = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const role = useAuthStore((state) => state.role);

  const handleCourseCreated = (newCourse: CourseSummary) => {
    // Add the new course to the top of the list
    setCourses((prev) => [newCourse, ...prev]);
    // Also optionally update the 'total_courses' metric locally to avoid a refetch
    if (metrics) {
      setMetrics({ ...metrics, total_courses: metrics.total_courses + 1 });
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get("/dashboard/metrics/teacher/", {});
        const course_response = await apiClient.get("/lectures/courses");

        if (!response.status || !course_response.status) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MetricsData = response.data;
        const course_data: CourseSummary[] = course_response.data;
        console.log(course_data);
        setMetrics(data);
        setCourses(course_data);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) return <p>Loading Dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* Header can be added in future */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 className={styles.sectionTitle}>My Courses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Create New Course
        </button>
      </div>
      <h1 className={styles.pageTitle}>Teacher Dashboard Overview</h1>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Courses"
          value={metrics?.total_courses ?? 0}
          icon="📚"
          color="#2980b9"
        />
        <StatsCard
          title="Lectures Generated"
          value={metrics?.total_lectures_generated ?? 0}
          icon="💡"
          color="#27ae60"
        />
        <StatsCard
          title="Pending Validation"
          value={metrics?.pending_validation_count ?? 0}
          icon="⏳"
          color="#f39c12"
        />
        <StatsCard
          title="Validated Lectures"
          value={metrics?.total_validated_lectures ?? 0}
          icon="✅"
          color="#8e44ad"
        />
      </div>

      <h2 className={styles.sectionTitle}>My Courses and Student Stats</h2>
      <div className={styles.dashboardSplitSection}>
        {/* LEFT SIDE: Course Grid (2 Columns) */}
        <div className={styles.courseGrid}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Link key={course.id} to={`/teacher/course/${course.id}`}>
                <CourseListCard course={course} />
              </Link>
            ))
          ) : (
            <p>No Courses available. Create your first Course</p>
          )}
        </div>

        {/* RIGHT SIDE: Chart Card */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Course Engagement</div>

          <div style={{ marginBottom: "25px" }}>
            <DummyChart />
          </div>

          {/* New Stats Grid Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              width: "100%",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                142
              </div>
              <div style={{ fontSize: "0.8rem", color: "#7f8c8d" }}>
                Active Students
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#27ae60",
                }}
              >
                85%
              </div>
              <div style={{ fontSize: "0.8rem", color: "#7f8c8d" }}>
                Completion
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Lecture Validation Queue</h2>
      <LectureValidationQueueTable />

      {/* Modal for creating Course */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCourseCreated}
      />
    </>
  );
};

export default TeacherDashboardPage;

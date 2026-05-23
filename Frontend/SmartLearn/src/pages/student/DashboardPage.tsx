import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import styles from "./StudentDashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import apiClient from "@/api/apiClient";

const studyHoursData = [
  { name: "Mon", hours: 2 },
  { name: "Tue", hours: 4 },
  { name: "Wed", hours: 3 },
  { name: "Thu", hours: 5 },
  { name: "Fri", hours: 2 },
  { name: "Sat", hours: 6 },
  { name: "Sun", hours: 4 },
];

const COLORS = ["#8b5cf6", "#10b981", "#ef4444"];

const StudentDashboardPage = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  // Real Data States for Charts
  const [assignChartData, setAssignChartData] = useState<any[]>([]);
  const [quizPieData, setQuizPieData] = useState<any[]>([]);
  const [lectureChartData, setLectureChartData] = useState<any[]>([]);

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/dashboard/metrics/student/");
        console.log(response);
        setMetrics(response.data.metrics);

        setLoading(true);

        // 1. Fetch main metrics
        const metricsRes = await apiClient.get("/dashboard/metrics/student/");
        const m = metricsRes.data;
        setMetrics(m);

        // 2. Fetch Assignment Stats
        const assignRes = await apiClient.get(
          "/assessments/student-assignments/",
        );
        const as = assignRes.data.stats;
        console.log(as)
        setAssignChartData([
          { name: "Total", count: as.total },
          { name: "Completed", count: as.completed },
          { name: "Pending", count: as.pending },
          { name: "Graded", count: as.graded },
        ]);

        // 3. Fetch Quiz Stats
        const quizRes = await apiClient.get("/assessments/student-quizzes/");
        const qs = quizRes.data.stats;
        setQuizPieData([
          { name: "Assigned", value: qs.assigned },
          { name: "Completed", value: qs.completed },
          { name: "Pending", value: qs.pending },
        ]);

        // 4. Lecture Chart - Values matched with Lecture Page Logic
        // 'Completed' uses completed_lectures, 'Pending' uses pending_assignments
        setLectureChartData([
          { name: "Courses", value: m?.enrolled_courses || 0, fill: "#6366f1" },
          {
            name: "Lectures",
            value: m?.completed_lectures || 0,
            fill: "#f59e0b",
          },
          { name: "Completed", value: 0 || 0, fill: "#10b981" },
          { name: "Pending", value: 0 || 0, fill: "#ef4444" },
        ]);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === year && now.getMonth() === month;
    const days = [];
    for (let i = 0; i < firstDay; i++)
      days.push(<span key={`empty-${i}`} className={styles.calEmpty}></span>);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <span
          key={i}
          className={
            isCurrentMonth && i === now.getDate()
              ? styles.calActive
              : styles.calDay
          }
        >
          {i}
        </span>,
      );
    }
    return days;
  };

  if (loading)
    return <div className={styles.loader}>Loading Student Portal...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>
              Keep it up{" "}
              <span className={styles.highlight}>
                {metrics?.full_name?.split(" ")[0] || "Student"}!
              </span>
            </h2>
            <p className={styles.bannerSub}>
              Your learning journey is evolving! You've mastered new concepts.
            </p>
            <div className={styles.aiTip}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>AI Tip: Focus on Mathematics today!</span>
            </div>
          </div>
          <GraduationCap size={120} className={styles.capIcon} />
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          {[
            {
              label: "ENROLLED",
              val: metrics?.enrolled_courses || 0,
              icon: <BookOpen />,
              color: "#4f46e5",
            },
            {
              label: "QUIZZES",
              val: metrics?.completed_quizzes || 0,
              icon: <HelpCircle />,
              color: "#f59e0b",
            },
            {
              label: "LECTURES",
              val: metrics?.completed_lectures || 0,
              icon: <PlayCircle />,
              color: "#10b981",
            },
            {
              label: "ASSIGNMENTS",
              val: metrics?.pending_assignments || 0,
              icon: <Clock />,
              color: "#ef4444",
            },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div
                className={styles.statIcon}
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

        <div className={styles.twoColumnGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Assignment Analysis</h3>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assignChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ stroke: "#4f46e5", strokeWidth: 2 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{
                      r: 6,
                      fill: "#4f46e5",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quiz Distribution</h3>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quizPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {quizPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.splitGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lecture Activity Overview</h3>
            <div style={{ height: "250px", marginTop: "10px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lectureChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.calTitle}>
                {viewDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className={styles.calendarNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={handleNextMonth} className={styles.navBtn}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className={styles.calendarGrid}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`header-${index}`} className={styles.calHead}>
                  {day}
                </span>
              ))}
              {renderCalendar()}
            </div>
          </div>
        </div>

        <div className={styles.threeColumnGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Course Completion</h3>
            <div className={styles.linearProg}>
              {metrics?.course_progress?.length > 0 ? (
                metrics.course_progress.map((course: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: "15px" }}>
                    <div className={styles.progLabel}>
                      <span>{course.name}</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className={styles.progBar}>
                      <div
                        style={{
                          width: `${course.progress}%`,
                          background: idx % 2 === 0 ? "#4f46e5" : "#10b981",
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  No courses enrolled yet.
                </p>
              )}
            </div>
          </div>
          <div className={`${styles.card} ${styles.centerText}`}>
            <h3 className={styles.cardTitle}>Overall Progress</h3>
            <div className={styles.circleContainer}>
              <svg viewBox="0 0 36 36" className={styles.circularChart}>
                <path
                  className={styles.circleBg}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.circle}
                  style={{ stroke: "#10b981" }}
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className={styles.percentage}>75%</div>
            </div>
          </div>
          <div className={styles.goalCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Star size={20} fill="white" />
              <h4>Current Goal</h4>
            </div>
            <p>Daily Lecture: 2/3 completed</p>
            <div className={styles.miniProgBar}>
              <div
                style={{ width: "66%", background: "white", height: "100%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: "24px" }}>
          <h3 className={styles.cardTitle}>Weekly Study Activity</h3>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="hours"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;

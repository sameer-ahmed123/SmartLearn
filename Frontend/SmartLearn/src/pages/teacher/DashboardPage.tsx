import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart as BarIcon,
  Trophy,
  ClipboardList,
  Layout,
} from "lucide-react";
import styles from "./TeacherDashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";

// Static Data for Weekly Activity
const weeklyTeacherActivity = [
  { name: "Mon", hours: 6 },
  { name: "Tue", hours: 8 },
  { name: "Wed", hours: 5 },
  { name: "Thu", hours: 9 },
  { name: "Fri", hours: 4 },
  { name: "Sat", hours: 2 },
  { name: "Sun", hours: 1 },
];

const TeacherDashboardPage = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  
  // 🔥 New State: For storing teacher's created lectures events
  const [lectureEvents, setLectureEvents] = useState<any[]>([]);

  const user = useAuthStore((state) => state.user);
  const displayName = user?.full_name || "User";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Analytics endpoint se student progress uhtane ke liye call (Same as Analytics Page logic)
        const [metricsRes, assignRes, quizRes, courseRes, analyticsRes] =
          await Promise.all([
            apiClient.get("/dashboard/metrics/teacher/"),
            apiClient.get("/assessments/teacher-list/"), // LOOK AT WHAT THIS ENDPOINT RETUNS FROM BACKEND
            apiClient.get("/assessments/teacher-quizzes/"), // LOOK AT WHAT THIS ENDPOINT RETUNS FROM BACKEND
            apiClient.get("/lectures/courses/"),
            apiClient.get("/dashboard/teacher-analytics/"), // Student progress yahan se aayega
          ]);

        setMetrics(metricsRes.data);
        setAssignments(assignRes.data || []);
        setQuizzes(quizRes.data.results || quizRes.data || []);
        setCourses(courseRes.data.results || courseRes.data || []);
        // Student progress mapping
        const sProgress = analyticsRes.data.studentProgress || [];
        setStudentProgress(sProgress);

        // 🔥 Fetching Teacher's explicit calendar lecture data inside asynchronous block
        try {
          const lecturesEventRes = await apiClient.get("/lectures/teacher-calendar-lectures/");
          setLectureEvents(lecturesEventRes.data.events || []);
        } catch (calendarErr) {
          console.error("Failed to load teacher calendar metrics", calendarErr);
        }

        console.log("metricsRes from dashboardPage", metricsRes);
        console.log("assignRes from dashboardPage", assignRes);
        console.log("quizRes from dashboardPage", quizRes);
        console.log("courseRes from dashboardPage", courseRes);
        console.log("analyticsRes from dashboardPage", analyticsRes);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const displayStudentCount =
    metrics?.total_students ||
    courses.reduce((acc, c) => acc + Number(c.enrolled_count || 0), 0) ||
    0;
  const activeCoursesCount = courses.length || metrics?.total_courses || 0;
  const totalAssigned = assignments.length;
  const totalQuizzes = quizzes.length;

  // --- Charts Data ---
  const totalSubmissions = assignments.reduce(
    (acc, curr) => acc + (Number(curr.submission_count) || 0),
    0,
  );
  const publishedAssignments = assignments.filter(
    (a) =>
      (a.status || a.assignment_data?.status)?.toLowerCase() === "published",
  ).length;

  const assignmentLineData = [
    { name: "Total", value: totalAssigned },
    { name: "Published", value: publishedAssignments },
    { name: "Submissions", value: totalSubmissions },
    { name: "Drafts", value: totalAssigned - publishedAssignments },
  ];

  const activeQuizzes = quizzes.filter(
    (q) => q.status === "published" || q.status === "active",
  ).length;
  const draftQuizzes = quizzes.filter((q) => q.status === "draft").length;

  const quizPieData = [
    { name: "Active", value: activeQuizzes, color: "#10b981" },
    { name: "Drafts", value: draftQuizzes, color: "#f59e0b" },
    { name: "Total", value: totalQuizzes, color: "#8b5cf6" },
  ];

  const getLectureStatsData = () => [
    { name: "Courses", count: activeCoursesCount, fill: "#f59e0b" },
    {
      name: "Generated",
      count: metrics?.total_lectures_generated ?? 0,
      fill: "#6366f1",
    },
    {
      name: "Pending",
      count: metrics?.pending_validation_count ?? 0,
      fill: "#ef4444",
    },
    {
      name: "Validated",
      count: metrics?.total_validated_lectures ?? 0,
      fill: "#10b981",
    },
  ];

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
      // 🔥 ISO format match logic tracking to check lecture creation trace mapping 
      const currentSlotDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      
      const dayLecture = lectureEvents.find((event: any) => {
        if (!event.created_date) return false;
        return event.created_date === currentSlotDateStr;
      });

      const isToday = isCurrentMonth && i === now.getDate();
      const isLectureDay = !!dayLecture;

      let dayClassName = styles.calDay;
      if (isToday) {
        dayClassName = styles.calActive;
      } else if (isLectureDay) {
        dayClassName = `${styles.calDay} ${styles.calLectureHighlight || ""}`;
      }

      days.push(
        <span
          key={i}
          className={dayClassName}
          title={isLectureDay ? `${dayLecture.title} (${dayLecture.course})` : undefined}
          style={isLectureDay && !isToday ? { 
            background: "rgba(16, 185, 129, 0.15)", // Premium green translucent wrap
            color: "#10b981", 
            border: "1px solid #10b981", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontWeight: "bold"
          } : {}}
        >
          {i}
        </span>,
      );
    }
    return days;
  };

  if (loading)
    return <div className={styles.loader}>Loading Teacher Portal...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>
              Welcome back, Prof.{" "}
              <span className={styles.highlight}>{displayName}!</span>
            </h2>
            <p className={styles.bannerSub}>
              Your dashboard is now synced with all your latest assessments and
              lectures.
            </p>
          </div>
          <GraduationCap size={120} className={styles.capIcon} />
        </div>

        {/* Top Stats Row */}
        <div className={styles.statsRow}>
          {[
            {
              label: "TOTAL STUDENTS",
              val: displayStudentCount,
              icon: <Users />,
              color: "#6366f1",
            },
            {
              label: "ACTIVE COURSES",
              val: activeCoursesCount,
              icon: <Layout />,
              color: "#10b981",
            },
            {
              label: "ASSIGNMENTS",
              val: totalAssigned,
              icon: <ClipboardList />,
              color: "#f59e0b",
            },
            {
              label: "TOTAL QUIZZES",
              val: totalQuizzes,
              icon: <Trophy />,
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

        {/* Charts Row */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Assignment Analytics</h3>
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assignmentLineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quiz Distribution</h3>
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quizPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    animationDuration={1200}
                  >
                    {quizPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Lecture Progress & Calendar */}
        <div className={styles.unevenGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lecture Progress Analysis</h3>
            <div style={{ height: "250px", marginTop: "10px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getLectureStatsData()}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
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
                <button
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className={styles.navBtn}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className={styles.navBtn}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className={styles.calendarGrid}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span key={d} className={styles.calHead}>
                  {d}
                </span>
              ))}
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Row 3: Syllabus & Performance */}
        <div className={styles.threeColumnGrid} style={{ marginTop: "24px" }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Syllabus Coverage</h3>
            {/* here syllabus coverage means coverage per Course */}
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course, idx) => {
                const percent = course.completion_percentage || 0;
                return (
                  <div
                    key={idx}
                    className={styles.linearProg}
                    style={{ marginBottom: "15px" }}
                  >
                    <div className={styles.progLabel}>
                      <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        {course.title}
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <div className={styles.progBar}>
                      <div
                        style={{
                          width: `${percent}%`,
                          background:
                            idx === 0
                              ? "#6366f1"
                              : idx === 1
                                ? "#10b981"
                                : "#f59e0b",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                No course data available
              </p>
            )}
          </div>
          <div className={`${styles.card} ${styles.centerText}`}>
            <h3 className={styles.cardTitle}>Overall Performance</h3>
            <div className={styles.circleContainer}>
              <svg viewBox="0 0 36 36" className={styles.circularChart}>
                <path
                  className={styles.circleBg}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.circle}
                  style={{ stroke: "#10b981" }}
                  strokeDasharray="82, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className={styles.percentage}>82%</div>
            </div>
          </div>
          <div className={styles.goalCard}>
            <Star size={20} fill="white" />
            <h4>Monthly Goal</h4>
            <p>{metrics?.total_lectures_generated ?? 0}/20 uploaded</p>
          </div>
        </div>

        {/* LAST ROW: Weekly Hours + Student Progress (Functionality matched with Analytics) */}
        <div className={styles.twoColumnGrid} style={{ marginTop: "24px" }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Weekly Active Hours</h3>
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTeacherActivity}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="hours"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                    animationDuration={1300}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Students Progress</h3>
            <div className={styles.studentList}>
              {studentProgress.map((student, idx) => (
                <div key={idx} className={styles.studentItem}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                    alt={student.name}
                    className={styles.studentAvatar}
                  />
                  <div className={styles.studentInfo}>
                    <div className={styles.studentHeader}>
                      <span className={styles.studentName}>{student.name}</span>
                      <span
                        className={styles.studentPercent}
                        style={{ color: student.color || "#6366f1" }}
                      >
                        {student.progress}%
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${student.progress}%`,
                          backgroundColor: student.color || "#6366f1",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboardPage;
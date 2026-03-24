import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  Target,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  Zap,
  Layers,
  Award,
  FileText,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import "./StudentAnalytics.css";
import apiClient from "@/api/apiClient";

const StudentAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showCourseDrop, setShowCourseDrop] = useState(false);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get("/dashboard/student-analytics/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });


        // DEBUG: Check this in your browser console!
        console.log("Full API Response:", response);

        setData(response.data);

        if (response.data.courses && response.data.courses.length > 0) {
          const firstCourse = response.data.courses[0];
          // Store ID as string to avoid type bugs
          const initialId = firstCourse.id
            ? String(firstCourse.id)
            : firstCourse.name;
          setSelectedCourseId(initialId);
        }
        setLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getStatusColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return "#10b981";
    if (numScore >= 70) return "#f59e0b";
    if (numScore >= 60) return "#fb923c";
    if (numScore >= 50) return "#eab308";
    return "#ef4444";
  };

  if (loading) return <div className="loading">Loading Analytics...</div>;
  if (!data) return <div className="error">Failed to load data.</div>;

  // Optimized selection logic
  const selectedCourseData = data?.courses?.find(c => {
    const courseIdStr = c.id ? String(c.id) : c.name;
    return courseIdStr === String(selectedCourseId);
  });

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* LEARNING ANALYTICS BANNER */}
        <div className="dashboard-banner analytics-banner">
          <div className="banner-content">
            <h2 style={{ margin: 0, fontSize: "2.4rem" }}>
              Learning Analytics
            </h2>
            <p style={{ opacity: 0.9, fontSize: "1.1rem", marginTop: "10px" }}>
              Visualize your academic growth and optimize your study patterns.
            </p>
          </div>
          <BarChart3 size={180} className="banner-icon-bg" />
        </div>

        {/* TOP METRICS GRID */}
        <div className="stats-grid">
          {[
            {
              label: "Course Completion",
              value: `${data.stats?.completion || 0}%`,
              icon: <CheckCircle2 />,
              color: "#10b981",
              trend: data.stats?.completion_trend,
            },
            {
              label: "Avg. Quiz Score",
              value: `${data.stats?.avg_quiz || 0}%`,
              icon: <Target />,
              color: "#6366f1",
              trend: data.stats?.quiz_trend,
            },
            {
              label: "Study Hours",
              value: `${data.stats?.study_hours || 0}h`,
              icon: <Clock />,
              color: "#f59e0b",
              trend: data.stats?.hours_trend,
            },
            {
              label: "Current GPA / Grade",
              value: data.stats?.grade || "N/A",
              icon: <Award />,
              color: "#8b5cf6",
              trend: "Top Progress",
            },
          ].map((m, i) => (
            <div key={i} className="stat-item-card analytics-card">
              <div className="card-top">
                <div
                  style={{
                    color: m.color,
                    background: `${m.color}15`,
                    padding: "10px",
                    borderRadius: "12px",
                  }}
                >
                  {m.icon}
                </div>
                <span className="trend-label" style={{ color: "#10b981" }}>
                  {m.trend} <ArrowUpRight size={14} />
                </span>
              </div>
              <div style={{ marginTop: "15px" }}>
                <p className="metric-label">{m.label}</p>
                <h2 className="metric-value">{m.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN ANALYTICS SECTION */}
        <div className="analytics-main-grid">
          {/* COURSE PROGRESS - Title Visibility Fix */}
          <div className="content-card">
            <div className="card-header">
              <PlayCircle size={22} color="#6366f1" />
              <h3 style={{ margin: 0, color: "#1e293b" }}>Course Progress</h3>
            </div>
            <div className="performance-list">
              {data.courses?.length > 0 ? (
                data.courses.map((c, idx) => (
                  <div
                    key={idx}
                    className="performance-item"
                    style={{ display: "block", marginBottom: "20px" }}
                  >
                    {/* Explicitly styled title to ensure visibility */}
                    <div style={{ marginBottom: "8px" }}>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "1rem",
                          color: "#1e293b",
                          display: "block",
                        }}
                      >
                        {c.name}
                      </span>
                    </div>
                    <div className="progress-group">
                      <div
                        className="progress-label"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Lecture Watch Progress</span>
                        <span style={{ fontWeight: "600", color: "#6366f1" }}>
                          {c.watch}%
                        </span>
                      </div>
                      <div
                        className="progress-bar-bg"
                        style={{
                          background: "#e2e8f0",
                          borderRadius: "10px",
                          height: "8px",
                        }}
                      >
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${c.watch}%`,
                            background: "#6366f1",
                            height: "100%",
                            borderRadius: "10px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No courses enrolled.</p>
              )}
            </div>
          </div>

          {/* RECOMMENDED FOCUS */}
          <div className="content-card focus-card">
            <div className="card-header">
              <AlertCircle size={20} color="#ef4444" />
              <h3>Recommended Focus</h3>
            </div>
            <ul className="focus-list">
              {data.recommendations?.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
              {(data.stats?.completion || 0) < 50 && (
                <li>Increase your daily study time to meet course goals.</li>
              )}
            </ul>
          </div>

          {/* QUIZ PERFORMANCE */}
          <div className="content-card">
            <div className="card-header">
              <Target size={22} color="#10b981" />
              <h3 style={{ margin: 0 }}>Recent Quiz Performance</h3>
            </div>
            <div className="performance-list" style={{ marginTop: "20px" }}>
              {data.quizzes_performance?.length > 0 ? (
                data.quizzes_performance.map((c, idx) => (
                  <div
                    key={idx}
                    className="performance-item"
                    style={{
                      marginBottom: "20px",
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: "10px",
                    }}
                  >
                    <div
                      className="item-info"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className="course-title"
                        style={{
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          color: "#334155",
                        }}
                      >
                        {c.name || "Average Score"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          color: getStatusColor(c.quiz),
                        }}
                      >
                        {c.quiz}%
                      </span>
                    </div>
                    <div className="progress-group">
                      <div
                        className="progress-bar-bg"
                        style={{
                          height: "8px",
                          backgroundColor: "#e2e8f0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${c.quiz}%`,
                            height: "100%",
                            background: getStatusColor(c.quiz),
                            transition: "width 1s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ padding: "20px", color: "#64748b" }}>
                  No quiz attempts yet.
                </p>
              )}
            </div>
          </div>

          {/* ASSIGNMENT TRACKER */}
          <div className="content-card">
            <div className="card-header">
              <FileText size={22} color="#f59e0b" />
              <h3 style={{ margin: 0 }}>Assignment Tracker</h3>
            </div>
            <div className="assignment-list" style={{ marginTop: "20px" }}>
              {data.assignments?.length > 0 ? (
                data.assignments.map((asgn, i) => (
                  <div
                    key={i}
                    className="asgn-card"
                    style={{
                      padding: "15px",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      marginBottom: "15px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          color: "#1e293b",
                          flex: 1,
                        }}
                      >
                        {asgn.title}
                      </p>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background:
                            asgn.progress === 100 ? "#dcfce7" : "#fee2e2",
                          color: asgn.progress === 100 ? "#166534" : "#991b1b",
                          fontWeight: "700",
                          marginLeft: "10px",
                        }}
                      >
                        {asgn.deadline}
                      </span>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      <div
                        style={{
                          height: "6px",
                          background: "#e2e8f0",
                          borderRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: `${asgn.progress}%`,
                            height: "100%",
                            background:
                              asgn.progress === 100 ? "#10b981" : "#f59e0b",
                            borderRadius: "10px",
                            transition:
                              "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ padding: "20px", color: "#64748b" }}>
                  No assignments assigned.
                </p>
              )}
            </div>
          </div>

          {/* NEW STUDENT VIDEO PROGRESS SECTION */}
          <div className="content-card" style={{ gridColumn: "1 / -1" }}>
            <div
              className="card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <PlayCircle size={22} color="#8b5cf6" />
                <h3 style={{ margin: 0, color: "#1e293b" }}>
                  Student Video Progress
                </h3>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowCourseDrop(!showCourseDrop)}
                  className="course-drop-btn"
                >
                  {selectedCourseData?.name || "Select Course"}{" "}
                  <ChevronDown size={16} />
                </button>

                {showCourseDrop && (
                  <div className="dropdown-menu-custom">
                    {data.courses?.map((course, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedCourseId(String(course.id || course.name));
                          setShowCourseDrop(false);
                        }}
                        className={`dropdown-item-custom ${String(selectedCourseId) === String(course.id || course.name) ? "active" : ""}`}
                      >
                        {course.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className="video-progress-list"
              style={{
                marginTop: "25px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {selectedCourseData?.lectures &&
              selectedCourseData.lectures.length > 0 ? (
                selectedCourseData.lectures.map((lecture, lIdx) => (
                  <div key={lIdx} className="video-lecture-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#334155",
                        }}
                      >
                        {lecture.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: "#8b5cf6",
                        }}
                      >
                        {lecture.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "#e2e8f0",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${lecture.progress}%`,
                          height: "100%",
                          background: "#8b5cf6",
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  <BookOpen
                    size={40}
                    style={{ opacity: 0.2, marginBottom: "10px" }}
                  />
                  <p style={{ color: "#94a3b8" }}>
                    No lectures found for{" "}
                    {selectedCourseData?.name || "this course"}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsPage;

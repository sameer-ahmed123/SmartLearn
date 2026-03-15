import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  Search,
  ArrowRight,
  Edit2, // Added Edit2
  CheckCircle,
  Clock,
  BarChart,
  Loader2,
  X,
  Settings,
} from "lucide-react";
import styles from "./TeacherAssignment.module.css";
import apiClient from "@/api/apiClient";
import type { CourseSummary } from "@/types/Courses/Types";
import { useNavigate } from "react-router-dom";
import AssignmentEditorModal from "@/components/Dashboard/teacher/AssignmentEditorModal"; // Import the modal

const TeacherAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- New State for Editing ---
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const courseImages = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignResponse, courseResponse] = await Promise.all([
        apiClient.get("/assessments/teacher-list/"),
        apiClient.get("/lectures/courses"),
      ]);
      setAssignments(assignResponse.data || []);
      setCourses(courseResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAssigned = assignments.length;
  const totalSubmissions = assignments.reduce(
    (acc, curr) => acc + (Number(curr.submission_count) || 0),
    0,
  );

  const publishedAssignments = assignments.filter(
    (a) =>
      (a.status || a.assignment_data?.status)?.toLowerCase() === "published",
  ).length;
  const draftAssignments = assignments.filter(
    (a) =>
      (a.status || a.assignment_data?.status)?.toLowerCase() !== "published",
  ).length;

  const filteredData = assignments.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.course_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const cardBgStyle = {
    backgroundColor: "var(--card, #ffffff)",
    color: "var(--foreground, #1e293b)",
    borderColor: "var(--border, #e2e8f0)",
  };

  if (loading)
    return (
      <div
        className={styles.pageWrapper}
        style={{ textAlign: "center", paddingTop: "100px" }}
      >
        <Loader2
          size={40}
          className="animate-spin"
          style={{ margin: "0 auto 10px", color: "#6366f1" }}
        />
        <p style={{ color: "var(--foreground)" }}>Loading Assignments...</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.assignBanner}>
        <div style={{ flex: 1, zIndex: 2 }}>
          <h2 className={styles.bannerTitle}>Assignments</h2>
          <p style={{ opacity: 0.9, marginBottom: "20px" }}>
            Track student submissions and grade their work.
          </p>
          <button
            className={styles.createBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> Create Assignment
          </button>
        </div>
        <FileText size={130} className={styles.bgIcon} />
      </div>

      {/* Course Selection Modal (Create Flow) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={cardBgStyle}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                Select Course
              </h3>
              <X
                size={24}
                className={styles.closeIcon}
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className={styles.modalList}>
              {courses.map((course, index) => (
                <div
                  key={`course-${course.id}-${index}`}
                  className={styles.modalItem}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={courseImages[index % courseImages.length]}
                      alt=""
                      className={styles.modalCourseImg}
                    />
                    <div>
                      <span className={styles.modalCourseTitle}>
                        {course.title}
                      </span>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--muted-foreground)",
                          margin: 0,
                        }}
                      >
                        {course.lecture_count || 0} Lectures
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/teacher/course/${course.id}?tab=assessments`)
                    }
                    className={styles.modalManageBtn}
                  >
                    <Settings size={14} /> Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Assignment Editor Modal --- */}
      {isEditorOpen && (
        <AssignmentEditorModal
          isOpen={isEditorOpen}
          assignmentId={editingAssignmentId}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingAssignmentId(null);
          }}
          onSaveSuccess={() => {
            fetchData(); // Refresh the list to update statuses/data
          }}
        />
      )}

      <div className={styles.statsRow}>
        {[
          {
            label: "Total Assigned",
            val: totalAssigned,
            icon: <BarChart size={22} />,
            color: "#3b82f6",
          },
          {
            label: "Total Submissions",
            val: totalSubmissions,
            icon: <Users size={22} />,
            color: "#10b981",
          },
          {
            label: "Active (Published)",
            val: publishedAssignments,
            icon: <CheckCircle size={22} />,
            color: "#f59e0b",
          },
          {
            label: "Draft",
            val: draftAssignments,
            icon: <Clock size={22} />,
            color: "#ef4444",
          },
        ].map((s, i) => (
          <div
            key={`stat-${i}`}
            className={styles.statCardBox}
            style={cardBgStyle}
          >
            <div
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: `${s.color}15`,
                color: s.color,
              }}
            >
              {s.icon}
            </div>
            <div className={styles.statTextContainer}>
              <p style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
              <h3 style={{ color: "var(--foreground)" }}>{s.val}</h3>
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
          style={{
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
            borderColor: "var(--border)",
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.assignGrid}>
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => {
            const rawDate =
              item.deadline ||
              item.assignment_data?.deadline ||
              item.due_date ||
              item.created_at;
            const formattedDate = rawDate
              ? new Date(rawDate).toLocaleDateString()
              : "No deadline";
            const currentStatus = (
              item.status ||
              item.assignment_data?.status ||
              "draft"
            ).toLowerCase();
            const statusDisplay =
              currentStatus === "published"
                ? "Published (Live)"
                : currentStatus === "draft"
                  ? "Draft (Private)"
                  : "Draft (Private)";
            const statusClass =
              currentStatus === "published" ? styles.open : styles.closed;

            return (
              <div
                key={item.id || `assignment-${idx}`}
                className={styles.assignCard}
                style={cardBgStyle}
              >
                <span className={`${styles.statusBadge} ${statusClass}`}>
                  {statusDisplay}
                </span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--muted-foreground)",
                    margin: "5px 0",
                  }}
                >
                  <strong>Course:</strong> {item.course_name || "General"}
                </p>
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--muted-foreground)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Users size={14} style={{ marginRight: "5px" }} />{" "}
                    {item.submission_count || 0} Submissions
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--muted-foreground)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Calendar size={14} style={{ marginRight: "5px" }} />{" "}
                    {formattedDate}
                  </div>
                </div>

                {/* Updated Footer with Edit Button */}
                <div
                  className={styles.cardFooter}
                  style={{
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    onClick={() =>
                      navigate(
                        `/teacher/lecture/${item.lecture_id || item.lecture}/assignment`,
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        color: "#3b82f6",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      View Submissions
                    </span>
                    <ArrowRight size={16} color="#3b82f6" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAssignmentId(item.id);
                      setIsEditorOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#f5f3ff")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <Edit2 size={15} /> Edit
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={styles.noData}
            style={{
              backgroundColor: "var(--card)",
              color: "var(--muted-foreground)",
            }}
          >
            No assignments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignment;

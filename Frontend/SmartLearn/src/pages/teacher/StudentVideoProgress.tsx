import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, PlayCircle, Calendar, Clock, Video } from "lucide-react";
import styles from "./StudentVideoProgress.module.css";
import apiClient from "@/api/apiClient";

const StudentVideoProgress = () => {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calling the new backend endpoint
        const res = await apiClient.get(
          `/dashboard/teacher/student-video-detail/${studentId}/${courseId}`,
        );

        setData(res.data);
      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.response?.data?.error || "Failed to load video progress.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && courseId) {
      fetchDetail();
    } else {
      setError("Missing student or course information.");
      setLoading(false);
    }
  }, [studentId, courseId]);

  if (loading)
    return <div className={styles.loading}>Loading Video Analytics...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;
  if (!data) return <div className={styles.loading}>No data found.</div>;

  return (
    <div className={styles.reportWrapper}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeft size={18} /> Back 
      </button>

      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.student_name}`}
            className={styles.largeAvatar}
            alt="Avatar"
          />
          <div className={styles.info}>
            <h1>{data.student_name}</h1>
            <p className={styles.courseSubtitle}>{data.course_name}</p>
            <span className={styles.headerBadge}>Student Learning Profile</span>
          </div>
        </div>

        <div className={styles.overallStatBox}>
          <div className={styles.statCircle}>
            <span className={styles.statVal}>{data.overall_watch}%</span>
            <span className={styles.statLabel}>Total Finished</span>
          </div>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {data.lectures && data.lectures.length > 0 ? (
          data.lectures.map((lecture: any, idx: number) => (
            <div key={idx} className={styles.videoCard}>
              <div className={styles.cardTop}>
                <div className={styles.indexTag}>Lecture {idx + 1}</div>
                <span
                  className={`${styles.statusBadge} ${styles[lecture.status.replace(/\s+/g, "")]}`}
                >
                  {lecture.status}
                </span>
              </div>

              <div className={styles.videoTitleArea}>
                <PlayCircle size={20} className={styles.playIcon} />
                <h3>{lecture.title}</h3>
              </div>

              <div className={styles.progressBox}>
                <div className={styles.progressHeader}>
                  <span>Completion</span>
                  <span className={styles.percentText}>
                    {lecture.progress}%
                  </span>
                </div>
                <div className={styles.barContainer}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${lecture.progress}%`,
                      background:
                        lecture.progress >= 95 ? "#10b981" : "#6366f1",
                    }}
                  />
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.activityInfo}>
                  <Clock size={14} />
                  <span>{lecture.last_watched || "No activity"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <Video size={48} />
            <p>No lectures available for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentVideoProgress;

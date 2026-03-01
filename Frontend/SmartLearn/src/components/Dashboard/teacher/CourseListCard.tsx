import React from "react";
import { Link } from "react-router-dom";
import type { CourseSummary } from "@/types/Courses/Types";
import styles from "./CourseListCard.module.css";
import { BookOpen, FileText } from "lucide-react";

interface CourseListCardProps {
  course: CourseSummary;
}

const CourseListCard: React.FC<CourseListCardProps> = ({ course }) => {
  const getStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (["published", "active"].includes(lowerStatus)) return styles.statusPublished;
    if (["draft", "pending"].includes(lowerStatus)) return styles.statusDraft;
    return styles.statusArchived;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{course.title}</h3>
        <span className={`${styles.status} ${getStatusClass(course.status)}`}>
          {course.status}
        </span>
      </div>

      <p className={styles.description}>
        {course.description
          ? course.description.substring(0, 80) + "..."
          : "No description provided."}
      </p>

      <div className={styles.statsRow}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={16} /> {course.lecture_count} Lectures
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} /> {course.content_source_count} Sources
        </span>
      </div>

      <div className={styles.actions}>
        <Link to={`/teacher/course/${course.id}`} className={styles.manageBtn}>
          Manage Content
        </Link>
      </div>
    </div>
  );
};

export default CourseListCard;
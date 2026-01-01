// src/components/Dashboard/teacher/CourseListCard.tsx

import React from "react";
import { Link } from "react-router-dom";
import type { CourseSummary } from "@/types/Courses/Types";
import styles from "./CourseListCard.module.css"; // You'll create this CSS

interface CourseListCardProps {
  course: CourseSummary;
}

const CourseListCard: React.FC<CourseListCardProps> = ({ course }) => {
  const getStatusClass = (status: string) => {
    // Convert to lowercase to be safe
    const lowerStatus = status.toLowerCase();

    switch (lowerStatus) {
      case "published":
      case "active":
        return styles.statusPublished;
      case "draft":
      case "pending":
        return styles.statusDraft;
      case "archived":
      case "closed":
        return styles.statusArchived;
      case "rejected":
        return styles.statusRejected;
      default:
        return "";
    }
  };
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{course.title}</h3>
        <span className={`styles.status ${getStatusClass(course.status)}`}>
          {course.status}
        </span>
      </div>

      <p className={styles.description}>
        {course.description
          ? course.description.substring(0, 100) + "..."
          : "No description provided."}
      </p>

      <div className={styles.statsRow}>
        <span>📚 {course.lecture_count} Lectures</span>
        <span>📄 {course.content_source_count} Sources</span>
      </div>

      <div className={styles.actions}>
        {/* THIS LINK POINTS TO YOUR NEW MANAGEMENT PAGE */}
        <Link to={`/teacher/courses/${course.id}`} className={styles.manageBtn}>
          Manage Content
        </Link>
      </div>
    </div>
  );
};

export default CourseListCard;

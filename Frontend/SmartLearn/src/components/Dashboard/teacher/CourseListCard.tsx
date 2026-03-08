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

  // 1. Fallback image define karein (Taake onError par error na aaye)
  const defaultPlaceholder = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  // 2. Different images ka array (Student portal ki tarah)
  const images = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
  ];

  // 3. Course ID ke mutabiq image select karein
  const selectedImg = images[course.id % images.length];

  return (
    <div className={styles.card}>
      {/* Thumbnail Section */}
      <div className={styles.courseThumb}>
        <img 
          src={(course as any).image_url || selectedImg} 
          alt={course.title} 
          className={styles.thumbImage}
          // Yahan error isliye tha kyunke fallbackImg define nahi tha
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultPlaceholder;
          }}
        />
        <span className={`${styles.statusBadge} ${getStatusClass(course.status)}`}>
          {course.status}
        </span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{course.title}</h3>
        </div>

        <p className={styles.description}>
          {course.description
            ? course.description.substring(0, 80) + "..."
            : "No description provided for this AI course."}
        </p>

        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            <BookOpen size={16} /> {course.lecture_count} Lectures
          </span>
          <span className={styles.statItem}>
            <FileText size={16} /> {course.content_source_count} Sources
          </span>
        </div>

        <div className={styles.actions}>
          <Link to={`/teacher/course/${course.id}`} className={styles.manageBtn}>
            Manage Content
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseListCard;
// src/pages/teacher/TeacherCourseDetailPage.tsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../Layout/DashboardLayout";
import CourseContentTable from "../../components/Dashboard/teacher/CourseContentTable";
import type { CourseContentItem } from "../../types/Lectures/Types";
import styles from "./TeacherCourseDetailPage.module.css";
import apiClient from "@/api/apiClient";

const TeacherCourseDetailPage: React.FC = () => {
  // We use 'course_pk' here to match the URL structure we settled on
  const { courseid } = useParams<{ courseid: string }>();
  const courseId = courseid;
  console.log(courseId)

  const [lectures, setLectures] = useState<CourseContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for Course Metadata (e.g., full course title, description)
  const [courseTitle, setCourseTitle] = useState("Loading Course...");

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseContent = async () => {
      try {
        // Endpoint: /api/v1/lectures/courses/{course_pk}/content/
        const response = await apiClient.get(
          `/lectures/courses/${courseId}/content/`,);

        if (response.status === 403) {
          throw new Error(
            "Permission Denied: You are not the owner of this course."
          );
        }
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CourseContentItem[] = response.data;
        console.log(data)
        setLectures(data);

        // --- Extract Course Title for the Header ---
        if (data.length > 0) {
          // The CourseContentItem has the course_topic field
          setCourseTitle(data[0].course_topic);
        } else {
          // If no lectures exist, you'd typically fetch the title from a dedicated /courses/{id}/ endpoint
          setCourseTitle(`Course ID ${courseId}`);
        }
        // ------------------------------------------
      } catch (err) {
        console.error("Failed to fetch course content:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load course content."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId]);

  if (isLoading)
    return (
      <DashboardLayout userRole="teacher">
        Loading Course Management Hub...
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout userRole="teacher">
        <h2 className={styles.error}>Error: {error}</h2>
      </DashboardLayout>
    );

  return (
    <DashboardLayout userRole="teacher">
      {/* 1. Header & Metadata Section */}
      <h1 className={styles.courseTitle}>Course Management: {courseTitle}</h1>
      <p className={styles.courseMetadata}>Total Lectures: {lectures.length}</p>

      <div className={styles.headerActions}>
        {/* 2. Primary Action Panel (Placeholder) */}
        <button className={styles.actionButton}>+ Generate New Lecture</button>
        {/* Placeholder for CourseStatsBar/Metrics */}
      </div>

      <h2 className={styles.sectionTitle}>Content List</h2>

      {/* 3. Core Content Management Table */}
      <CourseContentTable lectures={lectures} />
    </DashboardLayout>
  );
};

export default TeacherCourseDetailPage;

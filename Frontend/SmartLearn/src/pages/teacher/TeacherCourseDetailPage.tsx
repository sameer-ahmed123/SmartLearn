// src/pages/teacher/TeacherCourseDetailPage.tsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../src/Layout/DashboardLayout";
import CourseContentTable from "../../components/Dashboard/teacher/CourseContentTable";
import CourseManagementHeader from "../../components/Dashboard/teacher/CourseManagementHeader"; // New Import
import apiClient from "../../api/apiClient";
import type { CourseContentItem } from "../../types/Lectures/Types"; // Ensure this path is correct
import GenerateLectureModal from "@/components/Dashboard/teacher/GenerateLectureModal";
// Define a local interface for the course detail if not in your types yet
interface CourseDetail {
  id: number;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
}

const TeacherCourseDetailPage: React.FC = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const courseId = courseid;

  // for Lectures (The Table)
  const [lectures, setLectures] = useState<CourseContentItem[]>([]);
  // for Course Details (The Header)
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both Course Details and Lectures in parallel
        const [courseRes, lectureRes] = await Promise.all([
          apiClient.get(`/lectures/courses/${courseId}/`), // Hits the new course_detail view
          apiClient.get(`/lectures/courses/${courseId}/content/`), // Hits the course_lecture_list view
        ]);
        console.log(courseRes.data);
        console.log(lectureRes.data);
        setCourse(courseRes.data);
        setLectures(lectureRes.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Failed to load course data:", err);
        if (err.response && err.response.status === 404) {
          setError("Course not found");
        } else {
          setError("Failed to load course details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Handler to update local state when Header updates status
  const handleCourseUpdate = (updatedCourse: CourseDetail) => {
    setCourse(updatedCourse);
  };

  if (isLoading)
    return (
      <DashboardLayout userRole="teacher">
        <p style={{ color: "black" }}>Loading Course Management Hub...</p>
      </DashboardLayout>
    );
  if (error || !course)
    return (
      <DashboardLayout userRole="teacher">
        <p style={{ color: "black" }}>Error: {error || "Course not found"}</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout userRole="teacher">
      {/* 1. The New Header Component */}
      <CourseManagementHeader
        course={course}
        onCourseUpdate={handleCourseUpdate}
      />

      {/* 2. Existing "Generate" Button & Table Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0, color: "#34495e" }}>
          Content List ({lectures.length})
        </h3>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => setIsGenerateOpen(true)}
        >
          + Generate New Lecture
        </button>
      </div>

      {/* 3. The Content Table */}
      <CourseContentTable lectures={lectures} />
      {course && (
        <GenerateLectureModal
          isOpen={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          onSuccess={() => {
            //  trigger re-fetch of lectures here
            // or maybe a toast notification...
            // as soon a lecture is generated then backend should send a notification
            // that i can show as toast on frontend
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TeacherCourseDetailPage;

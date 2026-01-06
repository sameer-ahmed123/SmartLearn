import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../src/Layout/DashboardLayout";
import CourseContentTable from "../../components/Dashboard/teacher/CourseContentTable";
import CourseManagementHeader from "../../components/Dashboard/teacher/CourseManagementHeader";
import apiClient from "../../api/apiClient";
import type { CourseContentItem } from "../../types/Lectures/Types";
import GenerateLectureModal from "@/components/Dashboard/teacher/GenerateLectureModal";
import AssessmentList from "@/components/Dashboard/teacher/AssessmentList";

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
}

const TeacherCourseDetailPage = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const courseId = courseid;

  const [lectures, setLectures] = useState<CourseContentItem[]>([]);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "assessments">(
    "content"
  );

  const refreshData = async () => {
    if (!courseId) return;
    try {
      const [courseRes, lectureRes] = await Promise.all([
        apiClient.get(`/lectures/courses/${courseId}/`),
        apiClient.get(`/lectures/courses/${courseId}/content/`),
      ]);
      setCourse(courseRes.data);
      setLectures(lectureRes.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to refresh data", err);
    }
  };

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [courseRes, lectureRes] = await Promise.all([
          apiClient.get(`/lectures/courses/${courseId}/`),
          apiClient.get(`/lectures/courses/${courseId}/content/`),
        ]);
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
      <CourseManagementHeader
        course={course}
        onCourseUpdate={handleCourseUpdate}
      />

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #eee" }}>
        <button
          onClick={() => setActiveTab("content")}
          style={{
            color: "#434343",
            padding: "10px 20px",
            marginRight: "10px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "content" ? "3px solid #3498db" : "none",
            fontWeight: activeTab === "content" ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          📚 Lecture Content
        </button>
        <button
          onClick={() => setActiveTab("assessments")}
          style={{
            color: "#434343",
            padding: "10px 20px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "assessments" ? "3px solid #9b59b6" : "none",
            fontWeight: activeTab === "assessments" ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          📝 Assessments (Quiz)
        </button>
      </div>

      {activeTab === "content" ? (
        <CourseContentTable
          lectures={lectures}
          onGenerateClick={() => setIsGenerateOpen(true)}
        />
      ) : (
        <AssessmentList onRefresh={refreshData} lectures={lectures} />
      )}

      {course && (
        <GenerateLectureModal
          isOpen={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          onSuccess={() => {
            refreshData(); // Re-fetch logic
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TeacherCourseDetailPage;

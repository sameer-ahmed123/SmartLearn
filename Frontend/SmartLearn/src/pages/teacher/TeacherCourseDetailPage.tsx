import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom"; // useLocation add kiya
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
  const location = useLocation(); // URL location track karne ke liye
  const courseId = courseid;

  const [lectures, setLectures] = useState<CourseContentItem[]>([]);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "assessments">(
    "content"
  );

  // Check if we should hide tabs based on URL param (for content, assignments and quizzes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryParams = new URLSearchParams(location.search);
  const isAssignmentMode = queryParams.get("tab") === "assessments";
  const isQuizMode = queryParams.get("tab") === "quizzes";
  const isContentMode = queryParams.get("tab") === "content"; // Added content mode check
  const hideTabs = isAssignmentMode || isQuizMode || isContentMode; // Updated hideTabs logic

  // URL query parameter check karne ke liye logic
  useEffect(() => {
    const tabParam = queryParams.get("tab");
    if (tabParam === "assessments" || tabParam === "quizzes") {
      setActiveTab("assessments");
    } else {
      setActiveTab("content");
    }
  }, [location.search, queryParams]);

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
    return <p style={{ color: "black" }}>Loading Course Management Hub...</p>;
  if (error || !course)
    return (
      <p style={{ color: "black" }}>Error: {error || "Course not found"}</p>
    );

  return (
    <>
      <CourseManagementHeader
        course={course}
        onCourseUpdate={handleCourseUpdate}
      />


      {/* Tabs - Hidden if hideTabs is true */}
      {!hideTabs && (
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
      )}

      {/* Conditional Heading Title - Only show if NOT in hidden mode */}
      {!hideTabs && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ color: "#434343", fontSize: "1.5rem" }}>
            {activeTab === "content" ? "Course Content" : "Course Assessments"}
          </h2>
        </div>
      )}


      {activeTab === "content" ? (
        <CourseContentTable
          lectures={lectures}
          onGenerateClick={() => setIsGenerateOpen(true)}
        />
      ) : (
        /* Yahan isAssignmentOnly aur isQuizOnly props pass kiye gaye hain */
        <AssessmentList 
          onRefresh={refreshData} 
          lectures={lectures} 
          isAssignmentOnly={isAssignmentMode} 
          isQuizOnly={isQuizMode}
        />
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
    </>
  );
};

export default TeacherCourseDetailPage;
// src/components/LectureStatusTable.tsx
import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient"; // Assuming your configured API client
import { Link } from "react-router-dom"; // Assuming you are using react-router-dom

// --- Interface Definitions (Based on LectureListSerializer) ---
interface Lecture {
  id: number;
  title: string;
  validation_status: "pending" | "validated" | "rejected";
  created_at: string;
  source_file_name: string;
  course_title: string;
  ai_prompt: string;
}

const LectureStatusTable = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API URL confirmed from previous request: /api/v1/lectures/
  const API_LECTURES_URL = "/lectures/";

  const loadLectures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // API call to fetch all generated lectures for the teacher
      const response = await apiClient.get<Lecture[]>(API_LECTURES_URL);
      setLectures(response.data);
    } catch (err) {
      console.error("Failed to load lectures:", err);
      setError("Could not load lecture data. Please try again.");
    } finally {
      setIsLoading(false); // Ensure loading is false after the fetch finishes
    }
  };

  useEffect(() => {
    // IMMEDIATE FETCH ON MOUNT
    loadLectures();

    // POLLING LOGIC IS REMOVED as requested.
    // The component will only update its data if manually refreshed 
    // (e.g., user navigating away and back, or a refresh button is added).
  }, []); // Empty dependency array ensures it runs only once on mount

  // Helper to render the status badge
  const renderStatusBadge = (status: Lecture["validation_status"]) => {
    switch (status) {
      case "validated":
        return <span className="badge badge-success">🟢 Validated</span>;
      case "rejected":
        return <span className="badge badge-danger">🔴 Rejected</span>;
      case "pending":
        return <span className="badge badge-warning">🟡 Pending Review</span>;
      default:
        return <span className="badge badge-secondary">❓ Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="card text-center">Loading AI lecture statuses...</div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="card lecture-status-table">
      <h3>📝 Generated Lecture Review</h3>
      <p className="text-muted">
        List of all AI-generated lectures awaiting your validation.
      </p>

      {lectures.length === 0 ? (
        <p className="text-center mt-4">
          No lectures have been generated yet for your courses.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover" width="100%">
            <thead>
              <tr>
                <th>Lecture Title</th>
                <th>Course</th>
                <th>Source File</th>
                <th>AI Prompt</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((lecture) => (
                <tr key={lecture.id}>
                  <td>{lecture.title || "Untitled Lecture"}</td>
                  <td>{lecture.course_title}</td>
                  <td>{lecture.source_file_name.split("/").pop()}</td>
                  <td title={lecture.ai_prompt}>
                    {lecture.ai_prompt.substring(0, 40)}...
                  </td>
                  <td>{renderStatusBadge(lecture.validation_status)}</td>
                  <td>
                    <Link
                      to={`/lectures/${lecture.id}/review`}
                      className={`btn btn-sm ${
                        lecture.validation_status === "pending"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                    >
                      {lecture.validation_status === "pending"
                        ? "Review Now"
                        : "View Detail"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LectureStatusTable;
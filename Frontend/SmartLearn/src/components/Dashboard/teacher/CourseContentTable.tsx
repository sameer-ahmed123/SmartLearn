import { useState } from "react";
import type { CourseContentItem } from "../../../types/Lectures/Types";
import styles from "./CourseContentTable.module.css";
import { Link } from "react-router-dom";

interface CourseContentTableProps {
  lectures: CourseContentItem[];
  onGenerateClick: () => void;
}

const CourseContentTable = ({
  lectures,
  onGenerateClick,
}: CourseContentTableProps) => {
  const [filter, setFilter] = useState<
    "all" | "pending" | "validated" | "rejected" | "draft"
  >("all");

  const getFilteredLectures = () => {
    if (filter === "all") return lectures;
    return lectures.filter((lecture) => lecture.validation_status === filter);
  };

  const filteredLectures = getFilteredLectures();

  const getStatusPillClass = (
    status: CourseContentItem["validation_status"]
  ) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "validated":
        return styles.statusValidated;
      case "rejected":
        return styles.statusRejected;
      default:
        return "";
    }
  };

  const renderVideoStatus = (status?: string) => {
    switch (status) {
      case "processing":
        return <span style={{ color: '#f39c12', fontWeight: 'bold' }}>⏳ Processing...</span>;
      case "completed":
        return <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✅ Ready</span>;
      case "failed":
        return <span style={{ color: '#c0392b', fontWeight: 'bold' }}>❌ Failed</span>;
      case "none":
      default:
        return <span style={{ color: '#7f8c8d' }}>—</span>;
    }
  };

  const renderActions = (lecture: CourseContentItem) => {
    switch (lecture.validation_status) {
      case "pending":
        return (
          <Link to={lecture.review_url} className={styles.actionReview}>
            Review & Validate
          </Link>
        );
      case "rejected":
        return (
          <Link to={lecture.review_url} className={styles.actionEdit}>
            View Rejection / Edit
          </Link>
        );
      case "validated":
        return (
          <Link to={lecture.review_url} className={styles.actionView}>
            View Live
          </Link>
        );
      default:
        return "N/A";
    }
  };

  return (
    <div className={styles.tableContainer}>
      {/* Filter Bar with Inline Generate Button */}
      <div className={styles.filterBar}>
        <button
          onClick={() => setFilter("all")}
          className={`${styles.filterButton} ${
            filter === "all" ? styles.active : ""
          }`}
        >
          All ({lectures.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`${styles.filterButton} ${
            filter === "pending" ? styles.active : ""
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("validated")}
          className={`${styles.filterButton} ${
            filter === "validated" ? styles.active : ""
          }`}
        >
          Validated
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`${styles.filterButton} ${
            filter === "rejected" ? styles.active : ""
          }`}
        >
          Rejected
        </button>

        {/* --- MOVED: Generate Button into CourseContent Table  --- */}
        <button onClick={onGenerateClick} className={styles.generateActionBtn}>
          + Generate New Lecture
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Topic</th>
            <th className={styles.createdCol}>Generated On</th>
            <th>Lecture Status</th>
            <th>Video Status</th>
            <th className={styles.actionCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLectures.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.noData}>
                No {filter} lectures found for this course.
              </td>
            </tr>
          ) : (
            filteredLectures.map((item) => (
              <tr key={item.id}>
                <td className={styles.topicCol}>{item.topic}</td>
                <td className={styles.createdCol}>
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${getStatusPillClass(
                      item.validation_status
                    )}`}
                  >
                    {item.status_display}
                  </span>
                </td>
                <td>
                  {renderVideoStatus(item.video_status)}
                </td>
                <td className={styles.actionCol}>{renderActions(item)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseContentTable;

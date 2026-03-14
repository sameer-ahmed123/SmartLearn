import { useState } from "react";
import type { CourseContentItem } from "../../../types/Lectures/Types";
import styles from "./CourseContentTable.module.css";
import { Link } from "react-router-dom";
import { 
  FileText, Calendar, CheckCircle2, Clock, AlertCircle, 
  Eye, Edit3, Plus, Filter 
} from "lucide-react";

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


  const getStatusIcon = (status: CourseContentItem["validation_status"]) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "validated": return <CheckCircle2 size={14} />;
      case "rejected": return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const renderActions = (lecture: CourseContentItem) => {
    // FIX: Manual path construction to match App.tsx routes
    const reviewPath = `/teacher/lecture/${lecture.id}/review`;

    switch (lecture.validation_status) {
      case "pending":
        return (
          <Link to={reviewPath} className={styles.actionReview}>
            <Edit3 size={14} /> Review
          </Link>
        );
      case "rejected":
        return (
          <Link to={reviewPath} className={styles.actionEdit}>
            <AlertCircle size={14} /> Fix
          </Link>
        );
      case "validated":
        return (
          <Link to={reviewPath} className={styles.actionView}>
            <Eye size={14} /> View
          </Link>
        );
      default:
        return "N/A";
    }
  };

  return (
    <div className={styles.tableCard}>
      {/* HEADER AREA */}
      <div className={styles.tableHeader}>
        <div className={styles.titleGroup}>
          <Filter size={18} className={styles.filterIcon} />
          <h3>Course Content</h3>
        </div>
        
        <button onClick={onGenerateClick} className={styles.generateActionBtn}>
          <Plus size={18} /> Generate New Lecture
        </button>
      </div>

      {/* FILTER TABS */}
      <div className={styles.filterBar}>
        <button
          onClick={() => setFilter("all")}
          className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
        >
          All ({lectures.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`${styles.filterButton} ${filter === "pending" ? styles.active : ""}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("validated")}
          className={`${styles.filterButton} ${filter === "validated" ? styles.active : ""}`}
        >
          Validated
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`${styles.filterButton} ${filter === "rejected" ? styles.active : ""}`}
        >
          Rejected
        </button>
      </div>


      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>

            <tr>
              <th><FileText size={16} style={{marginRight: '8px'}} /> Topic</th>
              <th className={styles.createdCol}><Calendar size={16} style={{marginRight: '8px'}} /> Date</th>
              <th>Status</th>
              <th className={styles.actionCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLectures.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.noData}>
                  <div className={styles.emptyState}>
                    <p>No {filter} lectures found for this course.</p>
                  </div>
                </td>

              </tr>
            ) : (
              filteredLectures.map((item) => (
                <tr key={item.id}>
                  <td className={styles.topicCol}>
                    <span className={styles.topicText}>{item.topic}</span>
                  </td>
                  <td className={styles.createdCol}>
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${getStatusPillClass(item.validation_status)}`}>
                      {getStatusIcon(item.validation_status)}
                      {item.status_display}
                    </span>
                  </td>
                  <td className={styles.actionCol}>
                    <div className={styles.actionFlex}>
                      {renderActions(item)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseContentTable;
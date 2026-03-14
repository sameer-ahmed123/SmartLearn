import type { LectureQueueItem } from "@/types/Lectures/Types";
import styles from "./LectureValidationQueueTable.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import { Clock, ExternalLink } from "lucide-react";

const LectureValidationQueueTable = () => {
  const [queue, setQueue] = useState<LectureQueueItem[]>([]);
  const [isloading, setIsloading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await apiClient.get("/lectures/pending/");
        console.log(response.data);
        if (!response.status) {
          throw new Error(`Http error! status: ${response.status}`);
        }
        const data: LectureQueueItem[] = Array.isArray(response.data)
          ? response.data
          : [];
        setQueue(data);
      } catch (err: any) {
        console.error("failed to load pending validation queue", err);
        setError("Failed to load Validation Queue data.");
      } finally {
        setIsloading(false);
      }
    };
    fetchQueue();
  }, []);

  if (isloading) return <div className={styles.loadingState}><p>Queue is loading ...</p></div>;
  if (error) return <div className={styles.errorState}><p className={styles.error}>Error: {error}</p></div>;
  
  if (queue.length === 0)
    return (
      <div className={styles.noData}>
        <Clock size={48} className={styles.noDataIcon} />
        <p>All Clear! No lectures to validate.</p>
      </div>
    );

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Course</th>
            <th>Generated On</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr key={item.id}>
              <td className={styles.topicCell}>{item.topic}</td>
              <td>
                <span className={styles.courseBadge}>
                  {item.content_source?.course?.title ?? "Unassigned Course"}
                </span>
              </td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td>
                <span className={styles.statusPill}>{item.status_display}</span>
              </td>
              <td>
                <Link to={item.review_url} className={styles.reviewLink}>
                  Review Details <ExternalLink size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LectureValidationQueueTable;
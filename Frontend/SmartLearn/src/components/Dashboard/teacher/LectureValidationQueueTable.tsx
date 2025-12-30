// DISPLAY LIST OF COURSES WITH ( VALIDATION STATUS OF "pending" )
import type { LectureQueueItem } from "@/types/Lectures/Types";
import styles from "./LectureValidationQueueTable.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
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
        const data: LectureQueueItem[] = response.data;
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

  if (isloading) return <p>Queue is loading ...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (queue.length === 0)
    return (
      <div className={styles.noData}>
        <p>All Clear! ...No lectures to validate.</p>
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
              <td>{item.topic}</td>
              <td>{item.content_source.course.title}</td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td>
                <span className={styles.statusPill}>{item.status_display}</span>
              </td>
              <td>
                <Link to={item.review_url} className={styles.reviewLink}>
                  Review Details
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

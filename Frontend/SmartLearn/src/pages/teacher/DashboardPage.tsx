// OVERALL TEACHER_DASHBOARD
// ASSEMBELS STATS --- UPLOAD FORM --- VALIDATION QUEUE
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Layout/DashboardLayout";
import StatsCard from "../../components/Dashboard/shared/StatsCard";
import LectureValidationQueueTable from "@/components/Dashboard/teacher/LectureValidationQueueTable";
import styles from "./TeacherDashboard.module.css";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/api/apiClient";
interface MetricsData {
  total_courses: number;
  total_lectures_generated: number;
  pending_validation_count: number;
  total_validated_lectures: number;
}

const TeacherDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient("/dashboard/metrics/teacher/", {});

        if (!response.status) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MetricsData = response.data;
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading)
    return (
      <DashboardLayout userRole={role}>Loading Dashboard...</DashboardLayout>
    );
  if (error)
    return <DashboardLayout userRole={role}>Error: {error}</DashboardLayout>;

  return (
    <DashboardLayout userRole={role}>
      <h1 className={styles.pageTitle}>Teacher Dashboard Overview</h1>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Courses"
          value={metrics?.total_courses ?? 0}
          icon="📚"
          color="#2980b9"
        />
        <StatsCard
          title="Lectures Generated"
          value={metrics?.total_lectures_generated ?? 0}
          icon="💡"
          color="#27ae60"
        />
        <StatsCard
          title="Pending Validation"
          value={metrics?.pending_validation_count ?? 0}
          icon="⏳"
          color="#f39c12"
        />
        <StatsCard
          title="Validated Lectures"
          value={metrics?.total_validated_lectures ?? 0}
          icon="✅"
          color="#8e44ad"
        />
      </div>

      <h2 className={styles.sectionTitle}>Lecture Validation Queue</h2>
      <LectureValidationQueueTable />
    </DashboardLayout>
  );
};

export default TeacherDashboardPage;

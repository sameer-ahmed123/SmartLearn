import DashboardLayout from "@/Layout/DashboardLayout";
import WelcomeSection from "@/components/Dashboard/WelcomeSection";
import StatsGrid from "@/components/Dashboard/StatsGrid";
import ContentGrid from "@/components/Dashboard/ContentGrid";
import { studentData, teacherData } from "@/lib/dashboardData";
import { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [role, setRole] = useState<"student" | "teacher">("student");

  const data = role === "student" ? studentData : teacherData;

  return (
    <DashboardLayout>
      <div className="main-content">
        <WelcomeSection
          title={
            role === "student"
              ? `Welcome Back, ${data.name}! 👋`
              : `Instructor Panel: ${data.name}`
          }
          subtitle={
            role === "student"
              ? "Your learning progress is looking great."
              : "Manage your students and courses."
          }
        />

        <StatsGrid stats={data.stats} />

        {role === "student" && (
          <ContentGrid
            left={
              <p>
                <strong>{studentData.course}</strong> – Next Lesson Tomorrow
              </p>
            }
            right={<p>{studentData.notification}</p>}
          />
        )}

        <button
          className="btn-primary"
          style={{ marginTop: "30px" }}
          onClick={() => setRole(role === "student" ? "teacher" : "student")}
        >
          Switch to {role === "student" ? "Teacher" : "Student"}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

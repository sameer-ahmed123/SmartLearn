import { useState } from "react";
import StudentDashboard from "./student/StudentDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import "./Dashboard.css";

const Dashboard = () => {
    const [role, setRole] = useState<"student" | "teacher">("student");

    return (
        <div>
            {role === "student" ? <StudentDashboard /> : <TeacherDashboard />}
            <button
                className="btn-primary"
                style={{ margin: "2rem" }}
                onClick={() => setRole(role === "student" ? "teacher" : "student")}
            >
                Switch to {role === "student" ? "Teacher" : "Student"} View
            </button>
        </div>
    );
};

export default Dashboard;

import { useState } from "react";

const RoleSwitcher = () => {
    const [role, setRole] = useState<"student" | "teacher">("student");

    return (
        <div style={{ marginTop: "20px" }}>
            <button
                className="btn-primary"
                onClick={() => setRole(role === "student" ? "teacher" : "student")}
            >
                Switch to {role === "student" ? "Teacher" : "Student"}
            </button>
        </div>
    );
};

export default RoleSwitcher;

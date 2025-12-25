import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const CoursePreview = () => {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get("/courses/").then(res => setCourses(res.data));
    }, []);

    return (
        <div className="card">
            <h3>My Courses</h3>

            {courses.length === 0 && <p>No courses created yet.</p>}

            {courses.slice(0, 3).map(course => (
                <div key={course.id} style={{ marginTop: "10px" }}>
                    <strong>{course.title}</strong>
                    <span style={{ marginLeft: "10px", color: "#64748b" }}>
                        ({course.status})
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CoursePreview;

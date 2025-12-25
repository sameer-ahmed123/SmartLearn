import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const CourseOverview = () => {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get("/courses/").then((res) => setCourses(res.data));
    }, []);

    return (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            {courses.map((course) => (
                <div
                    key={course.id}
                    style={{
                        padding: "16px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        width: "250px",
                    }}
                >
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p>Lectures: {course.lecture_count}</p>
                    <p>Sources: {course.content_source_count}</p>
                </div>
            ))}
        </div>
    );
};

export default CourseOverview;

import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import LectureList from "./LectureList";

const CourseList = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

    useEffect(() => {
        apiClient.get("/courses/").then((res) => setCourses(res.data));
    }, []);

    return (
        <div>
            {courses.map((course) => (
                <div
                    key={course.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: "16px",
                        borderRadius: "8px",
                        marginBottom: "12px",
                    }}
                >
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>

                    <button onClick={() => setActiveCourseId(course.id)}>
                        View Lectures
                    </button>

                    {activeCourseId === course.id && (
                        <LectureList courseId={course.id} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default CourseList;

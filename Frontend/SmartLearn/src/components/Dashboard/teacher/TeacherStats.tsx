import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const TeacherStats = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        publishedCourses: 0,
        contentSources: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const coursesRes = await apiClient.get("/lectures/courses/");
            const contentRes = await apiClient.get("/lectures/content-sources/");

            const published = coursesRes.data.filter(
                (c: any) => c.status === "published"
            ).length;

            setStats({
                totalCourses: coursesRes.data.length,
                publishedCourses: published,
                contentSources: contentRes.data.length,
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h3>Total Courses</h3>
                <p>{stats.totalCourses}</p>
            </div>
            <div className="stat-card">
                <h3>Published Courses</h3>
                <p>{stats.publishedCourses}</p>
            </div>
            <div className="stat-card">
                <h3>Content Uploaded</h3>
                <p>{stats.contentSources}</p>
            </div>
        </div>
    );
};

export default TeacherStats;

import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const ContentUploadCard = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [courseId, setCourseId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        apiClient.get("/lectures/courses/").then(res => setCourses(res.data));
    }, []);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("course", courseId);
        formData.append("raw_file", file!);
        formData.append("ai_prompt", prompt);

        await apiClient.post("/lectures/content-sources/", formData);
        alert("Content uploaded. AI lecture generation started.");
    };

    return (
        <div className="card">
            <h3>Upload Content for AI Lecture</h3>

            <select onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                ))}
            </select>

            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <textarea
                placeholder="AI instructions..."
                onChange={(e) => setPrompt(e.target.value)}
            />

            <button className="btn-primary" onClick={handleSubmit}>
                Upload & Generate
            </button>
        </div>
    );
};

export default ContentUploadCard;

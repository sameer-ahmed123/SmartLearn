import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import LectureReviewModal from "./LectureReviewModal";

const ContentSourceTable = () => {
    const [sources, setSources] = useState<any[]>([]);
    const [selectedLecture, setSelectedLecture] = useState<any>(null);

    const loadData = async () => {
        const res = await apiClient.get("/content-sources/");
        setSources(res.data);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div>
            <h2>AI Generated Lectures</h2>

            <table width="100%" cellPadding={10}>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Prompt</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {sources.map((src) => {
                        const lecture = src.generated_lectures?.[0];

                        return (
                            <tr key={src.id}>
                                <td>{src.course}</td>
                                <td>{src.ai_prompt}</td>

                                <td>
                                    {!lecture && "⏳ Generating"}
                                    {lecture?.validation_status === "pending" && "🟡 Pending"}
                                    {lecture?.validation_status === "validated" && "🟢 Validated"}
                                    {lecture?.validation_status === "rejected" && "🔴 Rejected"}
                                </td>

                                <td>
                                    {lecture && (
                                        <button
                                            onClick={() => setSelectedLecture(lecture)}
                                        >
                                            Review
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedLecture && (
                <LectureReviewModal
                    lecture={selectedLecture}
                    onClose={() => setSelectedLecture(null)}
                    onActionComplete={loadData}
                />
            )}
        </div>
    );
};

export default ContentSourceTable;

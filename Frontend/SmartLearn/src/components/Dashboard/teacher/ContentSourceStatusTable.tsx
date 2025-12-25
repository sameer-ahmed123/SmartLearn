import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const ContentSourceStatusTable = () => {
    const [sources, setSources] = useState<any[]>([]);

    const loadSources = async () => {
        const res = await apiClient.get("/content-sources/");
        setSources(res.data);
    };

    useEffect(() => {
        loadSources();
    }, []);

    const handleValidate = async (lectureId: number) => {
        await apiClient.patch(`/lectures/${lectureId}/`, {
            validation_status: "validated",
        });
        loadSources();
    };

    const handleReject = async (lectureId: number) => {
        const reason = prompt("Reason for rejection?");
        if (!reason) return;

        await apiClient.patch(`/lectures/${lectureId}/`, {
            validation_status: "rejected",
            rejection_comment: reason,
        });
        loadSources();
    };

    return (
        <div className="card">
            <h3>AI Lecture Status</h3>

            <table width="100%">
                <thead>
                    <tr>
                        <th>Course</th>
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

                                <td>
                                    {!lecture && "⏳ Processing"}
                                    {lecture?.validation_status === "pending" && "🟡 Pending"}
                                    {lecture?.validation_status === "validated" && "🟢 Validated"}
                                    {lecture?.validation_status === "rejected" && "🔴 Rejected"}
                                </td>

                                <td>
                                    {lecture?.validation_status === "pending" && (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleValidate(lecture.id)}
                                            >
                                                Validate
                                            </button>
                                            <button
                                                onClick={() => handleReject(lecture.id)}
                                                style={{ marginLeft: "8px" }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {lecture?.validation_status !== "pending" && "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ContentSourceStatusTable;

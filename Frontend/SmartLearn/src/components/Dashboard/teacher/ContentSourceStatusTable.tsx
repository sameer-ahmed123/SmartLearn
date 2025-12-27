import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
// Assuming LectureReviewModal is defined and imported correctly
import LectureReviewModal from "./LectureReviewModal"; 

// The original component name was ContentSourceStatusTable, I will use that.
const ContentSourceStatusTable = () => {
    // This state holds the list of ContentSource objects fetched from the backend.
    const [sources, setSources] = useState<any[]>([]);
    // State to hold the specific lecture object to be reviewed in the modal.
    const [selectedLecture, setSelectedLecture] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadSources = async () => {
        setIsLoading(true);
        try {
            // API Endpoint confirmed by backend code: /lectures/content-sources/
            const res = await apiClient.get("/lectures/content-sources/");
            // The response data is an array of ContentSource objects
            setSources(res.data);
        } catch (error) {
            console.error("Failed to load content sources:", error);
            // Optionally set an error state
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSources();
        // Set up polling to refresh the status since lecture generation is async
        const pollInterval = setInterval(loadSources, 15000); // Poll every 15 seconds

        return () => clearInterval(pollInterval); // Cleanup on unmount
    }, []);

    // Helper to render the status
    const renderStatus = (lecture: any) => {
        if (!lecture) return "⏳ Processing";
        
        switch (lecture.validation_status) {
            case "pending":
                return "🟡 Pending Review";
            case "validated":
                return "🟢 Validated";
            case "rejected":
                return `🔴 Rejected (${lecture.rejection_comment || 'No Reason'})`;
            default:
                return "❓ Unknown Status";
        }
    };

    if (isLoading) {
        return <div className="card">Loading lecture statuses...</div>;
    }

    return (
        <div className="card content-source-status-table">
            <h3>AI Lecture Status</h3>

            {sources.length === 0 ? (
                <p>No content has been uploaded yet for AI lecture generation.</p>
            ) : (
                <table width="100%">
                    <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>AI Prompt</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sources.map((src) => {
                            // Extract the first generated lecture (assuming one per source)
                            const lecture = src.generated_lectures?.[0];

                            return (
                                <tr key={src.id}>
                                    <td>Course {src.course}</td>
                                    <td title={src.ai_prompt}>
                                        {/* Truncate long prompts for readability */}
                                        {src.ai_prompt.substring(0, 50)}...
                                    </td>

                                    <td>{renderStatus(lecture)}</td>

                                    <td>
                                        {/* Show Review button ONLY if a lecture exists and is pending */}
                                        {lecture && lecture.validation_status === "pending" && (
                                            <button
                                                className="btn-primary"
                                                onClick={() => setSelectedLecture(lecture)}
                                            >
                                                Review
                                            </button>
                                        )}
                                        
                                        {/* Show View button if validated/rejected */}
                                        {lecture && lecture.validation_status !== "pending" && (
                                            <button
                                                onClick={() => setSelectedLecture(lecture)}
                                                style={{ background: "#9ca3af", borderColor: "#9ca3af" }}
                                            >
                                                View
                                            </button>
                                        )}

                                        {!lecture && "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Modal for Lecture Review/Validation */}
            {selectedLecture && (
                <LectureReviewModal
                    lecture={selectedLecture}
                    // Close button action
                    onClose={() => setSelectedLecture(null)}
                    // onActionComplete should reload the table data to update status
                    onActionComplete={loadSources} 
                />
            )}
        </div>
    );
};

export default ContentSourceStatusTable;
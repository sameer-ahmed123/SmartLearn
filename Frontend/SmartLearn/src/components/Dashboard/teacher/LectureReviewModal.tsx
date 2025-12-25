import apiClient from "@/api/apiClient";

const LectureReviewModal = ({ lecture, onClose, onActionComplete }: any) => {
    const validate = async () => {
        await apiClient.patch(`/lectures/${lecture.id}/`, {
            validation_status: "validated",
        });
        onActionComplete();
        onClose();
    };

    const reject = async () => {
        const reason = prompt("Enter rejection reason");
        if (!reason) return;

        await apiClient.patch(`/lectures/${lecture.id}/`, {
            validation_status: "rejected",
            rejection_comment: reason,
        });
        onActionComplete();
        onClose();
    };

    return (
        <div className="modal">
            <h3>{lecture.topic}</h3>

            <video src={lecture.video_url} controls width="100%" />

            <h4>Summary</h4>
            <p>{lecture.summary_text}</p>

            <div style={{ marginTop: "16px" }}>
                <button onClick={validate}>Validate</button>
                <button onClick={reject} style={{ marginLeft: "8px" }}>
                    Reject
                </button>
                <button onClick={onClose} style={{ marginLeft: "8px" }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default LectureReviewModal;

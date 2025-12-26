import { setProgress } from "@/utils/progress";
import { useAuthStore } from "@/store/useAuthStore";
import "./student.css"
const LectureViewer = ({ lecture, onClose }: any) => {
    const user = useAuthStore((s) => s.user);

    const markWatched = () => {
        if (user) setProgress(user.id, lecture.id, "watched");
    };

    const markCompleted = () => {
        if (user) setProgress(user.id, lecture.id, "completed");
    };

    return (
        <div className="lecture-viewer">
            <h3>{lecture.topic}</h3>

            <video
                src={lecture.video_url}
                controls
                width="100%"
                onPlay={markWatched}
            />

            <h4>Summary</h4>
            <p>{lecture.summary_text}</p>

            <div className="actions">
                <button onClick={markCompleted}>✔ Mark Completed</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default LectureViewer;

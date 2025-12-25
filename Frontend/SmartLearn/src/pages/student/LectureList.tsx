import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import LectureViewer from "./LectureViewer";
import { getProgress } from "@/utils/progress";
import { useAuthStore } from "@/store/useAuthStore";

const LectureList = ({ courseId }: { courseId: number }) => {
    const [lectures, setLectures] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedLecture, setSelectedLecture] = useState<any>(null);

    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        apiClient.get(`/courses/${courseId}/`).then((res) => {
            const validated = res.data.lectures.filter(
                (l: any) => l.validation_status === "validated"
            );
            setLectures(validated);
        });
    }, [courseId]);

    const progress = user ? getProgress(user.id) : {};

    const filteredLectures = lectures.filter((lec) => {
        const matchesSearch = lec.topic
            .toLowerCase()
            .includes(search.toLowerCase());

        const status = progress[lec.id] || "not_started";

        if (filter === "watched") return status === "watched";
        if (filter === "completed") return status === "completed";
        if (filter === "not_started") return !progress[lec.id];

        return matchesSearch;
    });

    return (
        <div>
            {/* SEARCH */}
            <input
                placeholder="Search lecture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* FILTER */}
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="watched">Watched</option>
                <option value="completed">Completed</option>
                <option value="not_started">Not Started</option>
            </select>

            <ul>
                {filteredLectures.map((lec) => {
                    const status = progress[lec.id] || "not_started";
                    return (
                        <li key={lec.id}>
                            <button onClick={() => setSelectedLecture(lec)}>
                                {lec.topic}
                            </button>
                            <span style={{ marginLeft: "8px" }}>
                                {status === "completed" && "✅"}
                                {status === "watched" && "👀"}
                                {status === "not_started" && "⏳"}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {selectedLecture && (
                <LectureViewer
                    lecture={selectedLecture}
                    onClose={() => setSelectedLecture(null)}
                />
            )}
        </div>
    );
};

export default LectureList;

export type ProgressStatus = "not_started" | "watched" | "completed";

const STORAGE_KEY = "lecture-progress";

export const getProgress = (userId: number) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data[userId] || {};
};

export const setProgress = (
    userId: number,
    lectureId: number,
    status: ProgressStatus
) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    if (!data[userId]) data[userId] = {};
    data[userId][lectureId] = status;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

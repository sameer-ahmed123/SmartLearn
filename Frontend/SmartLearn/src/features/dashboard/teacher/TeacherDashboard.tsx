import TeacherStats from "@/components/Dashboard/teacher/TeacherStats";
import CoursePreview from "@/components/Dashboard/teacher/CoursePreview";
import ContentUploadCard from "@/components/Dashboard/teacher/ContentUploadCard";
import ContentSourceStatusTable from "@/components/Dashboard/teacher/ContentSourceStatusTable";
import LectureStatusTable from "@/components/Dashboard/teacher/LectureStatusTable";


const TeacherDashboard = () => {
    return (
        <>
            <TeacherStats />
            <CoursePreview />
            <ContentUploadCard />
            <LectureStatusTable/>
            <ContentSourceStatusTable />
        </>
    );
};

export default TeacherDashboard;
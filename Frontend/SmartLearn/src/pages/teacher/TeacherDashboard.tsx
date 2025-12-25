import DashboardLayout from "@/components/Layout/DashboardLayout";
import TeacherStats from "@/components/Dashboard/teacher/TeacherStats";
import CoursePreview from "@/components/Dashboard/teacher/CoursePreview";
import ContentUploadCard from "@/components/Dashboard/teacher/ContentUploadCard";
import ContentSourceStatusTable from "@/components/Dashboard/teacher/ContentSourceStatusTable";


const TeacherDashboard = () => {
    return (
        <DashboardLayout>
            <div className="main-content">
                <TeacherStats />
                <CoursePreview />
                <ContentUploadCard />
                <ContentSourceStatusTable />
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;

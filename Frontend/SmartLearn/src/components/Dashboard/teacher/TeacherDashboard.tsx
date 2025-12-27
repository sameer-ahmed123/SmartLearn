import CourseOverview from "./CourseOverview";
import ContentSourceStatusTable from "./ContentSourceStatusTable";

const TeacherDashboard = () => {
    return (
        <div style={{ padding: "24px" }}>
            <h1>Teacher Dashboard</h1>

            <CourseOverview />
            
            <ContentSourceStatusTable />
        </div>
    );
};

export default TeacherDashboard;

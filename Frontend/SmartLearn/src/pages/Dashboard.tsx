import { useAuthStore } from "@/store/useAuthStore";
import TeacherDashboard from "./teacher/DashboardPage"; // Ensure path is correct
import StudentDashboard from "./student/DashboardPage"; // Ensure path is correct

const Dashboard = () => {
  const role = useAuthStore((state) => state.role);

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (role === 'student') {
    return <StudentDashboard />;
  }

  return <div className="p-10 text-center">Loading User Profile...</div>;
};

export default Dashboard;
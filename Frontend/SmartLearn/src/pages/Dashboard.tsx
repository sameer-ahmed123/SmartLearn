import DashboardLayout from "@/Layout/DashboardLayout";
import "./Dashboard.css";
import { useAuthStore } from "@/store/useAuthStore";


const Dashboard = () => {
  
  const role = useAuthStore((state)=>state.role)
  

  return (
    <DashboardLayout userRole={role}>
      a
    </DashboardLayout>
  );
};

export default Dashboard;

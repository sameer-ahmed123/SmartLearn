import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            {children}
        </div>
    );
};

export default DashboardLayout;

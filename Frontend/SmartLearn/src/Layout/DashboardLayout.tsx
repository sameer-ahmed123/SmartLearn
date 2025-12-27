// OVERALL PAGE STRUCTURE

import Sidebar from "./SideBar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            {children}
        </div>
    );
};

export default DashboardLayout;

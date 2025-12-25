import RoleSwitcher from "../Role-switch/RoleSwitcher";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h1>SmartLearn.</h1>

            <div className="nav-item active">🏠 Dashboard</div>
            <div className="nav-item">📚 Courses</div>
            <div className="nav-item">💬 Messages</div>
            <div className="nav-item">⚙️ Settings</div>

            <RoleSwitcher />

            <div className="nav-item" style={{ marginTop: "auto", color: "#fca5a5" }}>
                🚪 Logout
            </div>
        </div>
    );
};

export default Sidebar;

import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import LogoutButton from "@/components/Auth/LogoutButton";
// Icons import kar rahe hain emojis ki jagah professional look ke liye
import { 
  LayoutDashboard, BookOpen, PenTool, ClipboardList, 
  GraduationCap, BarChart3, Settings, ChevronLeft, 
  ChevronRight, LogOut, Video 
} from "lucide-react";

interface SidebarProps {
  userRole: "teacher" | "student" | null;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ userRole, isCollapsed, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  // // Links aur Path wahi hain jo aapne diye thay (No change in names)
  const teacherLinks = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: <LayoutDashboard size={20}/> },
    { name: "Lecture", path: "/teacher/lecture", icon: <BookOpen size={20}/> },
    { name: "Assignments", path: "/teacher/assignments", icon: <PenTool size={20}/> },
    { name: "Quiz", path: "/teacher/quiz", icon: <ClipboardList size={20}/> },
    { name: "Gradebook", path: "/teacher/grades", icon: <GraduationCap size={20}/> },
    { name: "Analytics", path: "/teacher/analytics", icon: <BarChart3 size={20}/> },
    { name: "Settings", path: "/teacher/settings", icon: <Settings size={20}/> },
  ];

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20}/> },
    { name: "Lecture", path: "/student/lecture", icon: <BookOpen size={20}/> },
    { name: "Assignments", path: "/student/assignments", icon: <PenTool size={20}/> },
    { name: "Quiz", path: "/student/quiz", icon: <ClipboardList size={20}/> },
    { name: "Gradebook", path: "/student/grades", icon: <GraduationCap size={20}/> },
    { name: "Analytics", path: "/student/analytics", icon: <BarChart3 size={20}/> },
    { name: "Virtual Room", path: "/student/virtualroom", icon: <Video size={20}/> },
    { name: "Settings", path: "/student/settings", icon: <Settings size={20}/> },
  ];

  // // Role base selection (Aapka original logic)
  const links = userRole === "teacher" ? teacherLinks : studentLinks;

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      
      {/* // --- HEADER: Logo aur Toggle Button --- */}
      <div className={styles.header}>
        {!isCollapsed && <h2 className={styles.logo}>SmartLearn</h2>}
      </div>

      {/* // --- NAVIGATION: Role base links --- */}
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            // // Active link ko highlight karne ki logic (No change)
            className={`${styles.link} ${
              location.pathname === link.path ? styles.active : ""
            }`}
            title={isCollapsed ? link.name : ""}
          >
            <span className={styles.icon}>{link.icon}</span>
            {!isCollapsed && <span className={styles.text}>{link.name}</span>}
          </Link>
        ))}
      </nav>

      {/* // --- FOOTER: Logout Button --- */}
      <div className={styles.footer}>
        <div className={styles.logoutBtn}>
          <span className={styles.icon}><LogOut size={20} /></span>
          {!isCollapsed && <LogoutButton />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
// src/components/Layout/SideBar.tsx

import React from 'react';
import styles from './SideBar.module.css';
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom
import LogoutButton from '@/components/Auth/LogoutButton';

interface SideBarProps {
  userRole: 'teacher' | 'student' | null;
}


const teacherLinks = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/teacher/courses/create', label: 'Create Course', icon: '+' },
  

];

const studentLinks = [
  { path: '/student/dashboard', label: 'My Courses', icon: '📊' },
  { path: '/student/catalog', label: 'Course Catalog', icon: '📚' },
];

const   SideBar: React.FC<SideBarProps> = ({ userRole }) => {
  const links = userRole === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>SMARTLEARN</div>
      <nav className={styles.nav}>
        <ul>
          {links.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className={styles.navLink}>
                <span className={styles.icon}>{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <LogoutButton/>
    </aside>
  );
};

export default SideBar;
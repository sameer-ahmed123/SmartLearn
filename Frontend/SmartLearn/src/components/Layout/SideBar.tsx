import React from 'react';
import {useAuthStore} from '../../store/useAuthStore';
import styles from './Layout.module.css';

// Import the LinkButton component for styled navigation links
import LinkButton from '../UI/LinkButton/LinkButton';
import Badge from '../UI/Badge/Badge'; // Used for notification counts

const Sidebar: React.FC = () => {
    const role = useAuthStore(state => state.role);

    // Placeholder for real-time counts from a store (e.g., useTeacherStore)
    const validationCount = 3; 

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
                {/* Always available links */}
                <LinkButton to="/dashboard" variant="sidebar">Dashboard</LinkButton>
                <LinkButton to="/courses" variant="sidebar">My Courses</LinkButton>

                {/* Conditional Rendering: Teacher-specific links */}
                {role === 'Teacher' && (
                    <>
                        <LinkButton to="/validation-queue" variant="sidebar">
                            Content Validation 
                            {validationCount > 0 && <Badge count={validationCount} />}
                        </LinkButton>
                        <LinkButton to="/upload-interface" variant="sidebar">
                            Upload AI Lessons
                        </LinkButton>
                    </>
                )}

                {/* Conditional Rendering: Student-specific links */}
                {role === 'Student' && (
                    <>
                        <LinkButton to="/classroom/find" variant="sidebar">Join Virtual Class</LinkButton>
                        <LinkButton to="/quizzes" variant="sidebar">Assessments & Quizzes</LinkButton>
                        <LinkButton to="/study-materials" variant="sidebar">Study Materials</LinkButton>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
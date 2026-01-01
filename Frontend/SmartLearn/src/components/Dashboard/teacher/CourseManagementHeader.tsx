import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import styles from './CourseManagementHeader.module.css';

interface CourseData {
    id: number;
    title: string;
    description: string;
    status: 'draft' | 'published' | 'archived';
}

interface CourseManagementHeaderProps {
    course: CourseData;
    onCourseUpdate: (updatedCourse: CourseData) => void;
}

const CourseManagementHeader: React.FC<CourseManagementHeaderProps> = ({ course, onCourseUpdate }) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Handle Status Change (Draft <-> Published)
    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await apiClient.patch(`/lectures/courses/${course.id}/`, {
                status: newStatus
            });
            onCourseUpdate(response.data); // Update parent state
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update course status.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This will delete the course and ALL its lectures. This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await apiClient.delete(`/lectures/courses/${course.id}/`);
            // Redirect back to dashboard on success
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error("Failed to delete course:", error);
            alert("Failed to delete course.");
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.headerContainer}>
            <div className={styles.infoSection}>
                <h1 className={styles.title}>{course.title}</h1>
                <p className={styles.description}>{course.description || "No description provided."}</p>
            </div>

            <div className={styles.controlSection}>
                <div className={styles.statusGroup}>
                    <label>Course Status:</label>
                    <select 
                        value={course.status} 
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className={`${styles.statusSelect} ${styles[course.status]}`}
                    >
                        <option value="draft">Draft (Hidden)</option>
                        <option value="published">Published (Live)</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className={styles.actionGroup}>
                    <button 
                        onClick={handleDelete} 
                        className={styles.deleteBtn}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Course'}
                    </button>
                    {/* You could add an "Edit Details" button here later for Title/Desc editing */}
                </div>
            </div>
        </div>
    );
};

export default CourseManagementHeader;
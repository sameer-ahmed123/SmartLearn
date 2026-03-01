import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronDown, BookOpen, Globe, Archive, AlertTriangle, Info } from 'lucide-react';
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

const CourseManagementHeader = ({ course, onCourseUpdate }: CourseManagementHeaderProps) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await apiClient.patch(`/lectures/courses/${course.id}/`, {
                status: newStatus
            });
            onCourseUpdate(response.data);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update course status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This will delete the course and ALL its lectures. This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await apiClient.delete(`/lectures/courses/${course.id}/`);
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error("Failed to delete course:", error);
            alert("Failed to delete course.");
            setIsDeleting(false);
        }
    };

    // Helper to get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <Globe size={16} />;
            case 'archived': return <Archive size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className={styles.headerWrapper}>
            {/* GRADIENT BANNER SECTION */}
            <div className={styles.banner}>
                <div className={styles.courseIdentity}>
                    <div className={styles.iconCircle}>
                        <BookOpen size={28} color="white" />
                    </div>
                    <div className={styles.textDetails}>
                        <h1 className={styles.title}>{course.title}</h1>
                        <p className={styles.description}>
                            {course.description || "No description provided."}
                        </p>
                    </div>
                </div>

                <div className={styles.statusBadgeRow}>
                    <span className={`${styles.statusBadge} ${styles[course.status]}`}>
                        {getStatusIcon(course.status)}
                        {course.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* CONTROLS SECTION */}
            <div className={styles.controlsBar}>
                <div className={styles.statusPicker}>
                    <label>Course Status</label>
                    <div className={styles.selectWrapper}>
                        <select 
                            value={course.status} 
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={isUpdating}
                            className={styles.styledSelect}
                        >
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Live)</option>
                            <option value="archived">Archived</option>
                        </select>
                        <ChevronDown className={styles.selectArrow} size={16} />
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button 
                        onClick={handleDelete} 
                        className={styles.deleteBtn}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            "Deleting..."
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete Course
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {isUpdating && <div className={styles.loadingLine}></div>}
        </div>
    );
};

export default CourseManagementHeader;
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
    image_url?: string; 
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <Globe size={16} />;
            case 'archived': return <Archive size={16} />;
            default: return <Info size={16} />;
        }
    };

    // --- DYNAMIC BACKGROUND LOGIC ---
    const fallbacks = [
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600",
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600"
    ];
    const selectedFallback = fallbacks[course.id % fallbacks.length];
    
    // Yahan se solid colors hata diye hain, sirf dark overlay hai taake text par koi asar na paray
    const headerBackground = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${course.image_url || selectedFallback})`;

    return (
        <div className={styles.headerWrapper}>
            <div 
                className={styles.banner} 
                style={{ backgroundImage: headerBackground, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
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
                        {isDeleting ? "Deleting..." : (
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
import React, { useState } from 'react';
import apiClient from '../../../api/apiClient'; 
import type { CourseSummary } from '../../../types/Courses/Types'; 
import styles from './CreateCourseModal.module.css';
import { X, BookOpen, AlignLeft } from 'lucide-react';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCourse: CourseSummary) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // POST request to your course_list_create view
            const response = await apiClient.post('/lectures/courses/', {
                title: title,
                description: description,
                // Adding default values for visual consistency
                thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
                price: 0,
                rating: 0,
                enrolledStudents: 0
            });

            onSuccess(response.data);
            
            setTitle('');
            setDescription('');
            onClose();

        } catch (err: any) {
            console.error("Create course error:", err);
            setError("Failed to create course. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <div className={styles.iconBox}><PlusIcon /></div>
                        <h2>Create New Course</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="title">
                            <BookOpen size={16} /> Course Title
                        </label>
                        <input 
                            type="text" 
                            id="title"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Advanced React Patterns"
                            required 
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">
                            <AlignLeft size={16} /> Description (Optional)
                        </label>
                        <textarea 
                            id="description"
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what students will learn..."
                            rows={4}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default CreateCourseModal;
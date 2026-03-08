import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import styles from './QuizEditorModal.module.css'; 

interface RubricItem {
    criterion: string;
    points: number;
}

interface AssignmentData {
    title: string;
    submission_type: string;
    tasks: string[];
    rubric: RubricItem[];
}

interface AssignmentEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignmentId: number | null;
    onSaveSuccess: () => void;
}

const AssignmentEditorModal: React.FC<AssignmentEditorModalProps> = ({ 
    isOpen, onClose, assignmentId, onSaveSuccess 
}) => {
    const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && assignmentId) {
            setLoading(true);
            apiClient.get(`/assessments/assignment/${assignmentId}/`)
                .then(res => {
                    setAssignmentData(res.data.assignment_data);
                })
                .catch(err => {
                    console.error("Failed to load assignment", err);
                    alert("Could not load assignment data");
                    onClose();
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, assignmentId, onClose]);

    const handleSave = async () => {
        if (!assignmentId || !assignmentData) return;
        setSaving(true);
        try {
            await apiClient.put(`/assessments/assignment/${assignmentId}/`, {
                assignment_data: assignmentData
            });
            alert("Assignment saved successfully!");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    // FIX: Only return null if isOpen is false. 
    // This allows the "Loading..." text to actually show up!
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Edit Assignment Content</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.content}>
                    {/* FIX: Check for loading OR missing data here, inside the visible modal container */}
                    {loading || !assignmentData ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <p>Loading assignment data...</p>
                        </div>
                    ) : (
                        <div>
                            {/* Basic Info */}
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Title</label>
                                <input 
                                    type="text" 
                                    className={styles.optionInput} 
                                    style={{width: '100%'}}
                                    value={assignmentData.title}
                                    onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Submission Type</label>
                                <select 
                                    className={styles.optionInput}
                                    value={assignmentData.submission_type}
                                    onChange={(e) => setAssignmentData({...assignmentData, submission_type: e.target.value})}
                                >
                                    <option value="softcopy">Softcopy (File Upload)</option>
                                    <option value="hardcopy">Hardcopy (In-Class)</option>
                                </select>
                            </div>

                            {/* Tasks */}
                            <h3 style={{marginTop: '20px'}}>Tasks</h3>
                            {assignmentData.tasks.map((task, index) => (
                                <div key={`task-${index}`} className={styles.inputGroup}>
                                    <label className={styles.label}>Task {index + 1}</label>
                                    <textarea 
                                        className={styles.textArea}
                                        value={task}
                                        onChange={(e) => {
                                            const newTasks = [...assignmentData.tasks];
                                            newTasks[index] = e.target.value;
                                            setAssignmentData({...assignmentData, tasks: newTasks});
                                        }}
                                    />
                                </div>
                            ))}

                            {/* Rubric */}
                            <h3 style={{marginTop: '20px'}}>Grading Rubric</h3>
                            {assignmentData.rubric.map((item, index) => (
                                <div key={`rubric-${index}`} className={styles.optionRow}>
                                    <input 
                                        type="text" 
                                        className={styles.optionInput}
                                        value={item.criterion}
                                        onChange={(e) => {
                                            const newRubric = [...assignmentData.rubric];
                                            newRubric[index].criterion = e.target.value;
                                            setAssignmentData({...assignmentData, rubric: newRubric});
                                        }}
                                    />
                                    <input 
                                        type="number" 
                                        className={styles.optionInput}
                                        style={{width: '80px', marginLeft: '10px'}}
                                        value={item.points}
                                        onChange={(e) => {
                                            const newRubric = [...assignmentData.rubric];
                                            newRubric[index].points = parseInt(e.target.value) || 0;
                                            setAssignmentData({...assignmentData, rubric: newRubric});
                                        }}
                                    />
                                    <span style={{marginLeft: '5px'}}>pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving || loading || !assignmentData}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentEditorModal;
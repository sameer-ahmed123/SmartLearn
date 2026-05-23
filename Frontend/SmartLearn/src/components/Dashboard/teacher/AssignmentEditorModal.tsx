import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar } from "lucide-react"; // Calendar icon add kiya
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
    const [status, setStatus] = useState<string>("draft"); // Status state
    const [deadline, setDeadline] = useState<string>(""); // Deadline state
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // Status update loading state


    useEffect(() => {
        if (isOpen && assignmentId) {
            setLoading(true);
            apiClient.get(`/assessments/assignment/${assignmentId}/`)
                .then(res => {
                    setAssignmentData(res.data.assignment_data);

                    setStatus(res.data.status || "draft");
                    // Format datetime for input type="datetime-local" (YYYY-MM-DDTHH:mm)
                    if (res.data.deadline) {
                        setDeadline(new Date(res.data.deadline).toISOString().slice(0, 16));
                    }

                })
                .catch(err => {
                    console.error("Failed to load assignment", err);
                    // alert("Could not load assignment data");
                    onClose();
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, assignmentId, onClose]);


    // Status change handler
    const handleStatusChange = async (newStatus: string) => {
        if (!assignmentId) return;
        setIsUpdatingStatus(true);
        try {
            const response = await apiClient.patch(`/assessments/assignment/${assignmentId}/`, {
                status: newStatus,
                deadline: deadline || null // Status ke sath deadline bhi save hogi
            });
            setStatus(response.data.status);
        } catch (error) {
            console.error("Failed to update status:", error);
            // alert("Failed to update assignment status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSave = async () => {
        if (!assignmentId || !assignmentData) return;
        setSaving(true);
        try {
            await apiClient.put(`/assessments/assignment/${assignmentId}/`, {
                assignment_data: assignmentData,
                deadline: deadline || null // Save button par deadline bhi jayegi

            });
            // alert("Assignment saved successfully!");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            // alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Edit Assignment Content</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.content}>
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
                    {/* LEFT DOWN CORNER: Status Picker & Due Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className={styles.statusPicker}>
                            <div className={styles.selectWrapper}>
                                <select
                                    value={status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={isUpdatingStatus || loading}
                                    className={styles.styledSelect}
                                >
                                    <option value="draft">Draft (Private)</option>
                                    <option value="published">Published (Live)</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <ChevronDown className={styles.selectArrow} size={14} />
                            </div>
                        </div>

                        {/* DUE DATE INPUT ADDED HERE */}
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            <Calendar size={14} style={{ marginRight: '8px', color: '#6b7280' }} />
                            <label style={{ fontSize: '12px', fontWeight: '500', marginRight: '8px', color: '#374151' }}>Due:</label>
                            <input 
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', outline: 'none', color: '#374151' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1 }}></div> {/* Spacer */}

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
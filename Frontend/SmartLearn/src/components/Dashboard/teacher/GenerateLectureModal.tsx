import React, { useState, useRef } from 'react';
import apiClient from '../../../api/apiClient';
import styles from './GenerateLectureModal.module.css';

interface GenerateLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;      // Needed for the ID in the POST request
    courseTitle: string;   // NEW: Needed for the Display Field
    onSuccess: () => void;
}

const GenerateLectureModal: React.FC<GenerateLectureModalProps> = ({ 
    isOpen, onClose, courseId, courseTitle, onSuccess 
}) => {
    const [aiPrompt, setAiPrompt] = useState(''); 
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // NEW: State for inline success message
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !aiPrompt) {
            setError("Please provide a prompt and a source file.");
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccessMsg(null); // Clear previous success messages

        const formData = new FormData();
        formData.append('course', courseId.toString());
        formData.append('ai_prompt', aiPrompt); // Backend maps this to 'topic'
        formData.append('raw_file', file);

        try {
            const response = await apiClient.post('/lectures/content-sources/', formData);

            if (response.status === 201 || response.status === 202) {
                // SUCCESS LOGIC: Set the success message instead of alerting
                setSuccessMsg("Upload Successful! AI generation has started in the background.");
                
                // Optional: Clear form immediately
                setAiPrompt('');
                setFile(null);

                // Optional: Close modal automatically after 2 seconds
                setTimeout(() => {
                    onSuccess(); // Refresh parent list
                    onClose();   // Close modal
                    setSuccessMsg(null); // Reset for next time
                }, 2000);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Upload failed:", err);
            setError("Failed to upload. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Generate New Lecture</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* ERROR MESSAGE AREA */}
                    {error && <div  className={styles.error}>{error}</div>}
                    
                    {/* NEW: SUCCESS MESSAGE AREA */}
                    {successMsg && <div style={{color:"green"}} className={styles.success}>{successMsg}</div>}
                    
                    {/* FIELD 1: Course (Read Only) */}
                    <div className={styles.formGroup}>
                        <label>Target Course</label>
                        <input 
                            type="text" 
                            value={courseTitle} 
                            disabled 
                            className={styles.readOnlyInput}
                        />
                    </div>

                    {/* FIELD 2: AI Prompt */}
                    <div className={styles.formGroup}>
                        <label>AI Prompt / Topic</label>
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., Explain the basics of Recursion using Python examples. Keep it beginner-friendly."
                            rows={3}
                            required 
                            autoFocus
                        />
                    </div>

                    {/* FIELD 3: Source Material */}
                    <div className={styles.formGroup}>
                        <label>Source Material (PDF/Text)</label>
                        <div 
                            className={styles.fileDropZone}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? (
                                <span className={styles.fileName}>📄 {file.name}</span>
                            ) : (
                                <span>Click to upload a document</span>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }} 
                                accept=".pdf,.txt,.docx"
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitBtn} 
                            disabled={isUploading || !file || !aiPrompt || successMsg !== null}
                        >
                            {isUploading ? 'Processing...' : 'Start Generation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateLectureModal;
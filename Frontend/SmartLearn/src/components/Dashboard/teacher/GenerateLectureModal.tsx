import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, FileText, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import styles from './GenerateLectureModal.module.css';

interface GenerateLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;      
    courseTitle: string;   
    onSuccess: () => void;
}

const GenerateLectureModal: React.FC<GenerateLectureModalProps> = ({ 
    isOpen, onClose, courseId, courseTitle, onSuccess 
}) => {
    const [aiPrompt, setAiPrompt] = useState(''); 
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
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
        setSuccessMsg(null); 

        const formData = new FormData();
        formData.append('course', courseId.toString());
        formData.append('ai_prompt', aiPrompt); 
        formData.append('raw_file', file);

        try {
            const response = await apiClient.post('/lectures/content-sources/', formData);

            if (response.status === 201 || response.status === 202) {
                setSuccessMsg("Upload Successful! AI generation has started in the background.");
                
                setAiPrompt('');
                setFile(null);

                setTimeout(() => {
                    onSuccess(); 
                    onClose();   
                    setSuccessMsg(null); 
                }, 2000);
            }
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
                {/* HEADER WITH GRADIENT STRIP */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.iconBox}>
                            <Wand2 size={24} color="white" />
                        </div>
                        <div>
                            <h2>Generate Lecture</h2>
                            <p>AI-powered content creation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={styles.closeIcon}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.formBody}>
                    {/* FEEDBACK MESSAGES */}
                    {error && <div className={styles.errorBox}><AlertCircle size={18} /> {error}</div>}
                    {successMsg && <div className={styles.successBox}><CheckCircle2 size={18} /> {successMsg}</div>}
                    
                    {/* COURSE INFO CARD (READ ONLY) */}
                    <div className={styles.infoCard}>
                        <label>Target Course</label>
                        <h3>{courseTitle}</h3>
                    </div>

                    {/* AI PROMPT INPUT */}
                    <div className={styles.inputGroup}>
                        <label>AI Prompt / Topic</label>
                        <div className={styles.textareaWrapper}>
                            <Sparkles size={16} className={styles.sparkleIcon} />
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Describe what you want the AI to generate..."
                                rows={3}
                                required 
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* FILE UPLOAD ZONE */}
                    <div className={styles.inputGroup}>
                        <label>Source Material</label>
                        <div 
                            className={`${styles.dropZone} ${file ? styles.hasFile : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? (
                                <div className={styles.fileInfo}>
                                    <FileText size={28} />
                                    <span>{file.name}</span>
                                </div>
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <Upload size={24} />
                                    <span>Upload PDF or Document</span>
                                </div>
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

                    {/* ACTIONS */}
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelLink}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.generateBtn} 
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
import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // A number between 0 and 100
  label?: string;
  variant?: 'primary' | 'success' | 'warning';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  variant = 'primary' 
}) => {
  // Clamp progress between 0 and 100
  const width = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.progressBarWrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.progressBar}>
        <div 
          className={`${styles.filler} ${styles[variant]}`}
          style={{ width: `${width}%` }}
        >
          <span className={styles.percentage}>{`${width}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
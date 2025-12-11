import React from 'react';
import styles from './StatusTag.module.css';

interface StatusTagProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error'; // Color themes
}

const StatusTag: React.FC<StatusTagProps> = ({ children, variant = 'info' }) => {
  const tagClass = `${styles.statusTag} ${styles[variant]}`;

  return (
    <span className={tagClass}>
      {children}
    </span>
  );
};

export default StatusTag;
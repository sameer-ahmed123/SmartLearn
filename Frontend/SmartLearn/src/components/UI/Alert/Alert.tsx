import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  // Optional close handler to make the alert dismissable
  onClose?: () => void; 
}

const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info', 
  onClose 
}) => {
  const alertClass = `${styles.alert} ${styles[variant]}`;

  return (
    <div className={alertClass} role="alert">
      <div className={styles.message}>{children}</div>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
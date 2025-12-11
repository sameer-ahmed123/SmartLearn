import React from 'react';
import styles from './Layout.module.css';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className={styles.publicLayoutContainer}>
      {children}
    </div>
  );
};

export default PublicLayout;
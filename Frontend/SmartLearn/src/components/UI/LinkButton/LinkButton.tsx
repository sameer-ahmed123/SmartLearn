import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.css';

interface LinkButtonProps {
  to: string; // The destination path for react-router-dom
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'sidebar';
  className?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ 
  to, 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const buttonClass = `${styles.linkButton} ${styles[variant]} ${className}`;
  
  return (
    <Link to={to} className={buttonClass}>
      {children}
    </Link>
  );
};

export default LinkButton;
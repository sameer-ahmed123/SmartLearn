// src/components/UI/Card/Card.tsx

import React from 'react';
import styles from './Card.module.css';

// Define the types for the component's props
interface CardProps {
  children: React.ReactNode;
  className?: string; // Allows consumers to pass extra CSS classes
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
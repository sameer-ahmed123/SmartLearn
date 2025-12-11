import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  count: number;
  max?: number; // Optional maximum display count (e.g., 99+)
  variant?: 'danger' | 'primary';
}

const Badge: React.FC<BadgeProps> = ({ 
  count, 
  max = 99, 
  variant = 'danger' 
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  const badgeClass = `${styles.badge} ${styles[variant]}`;

  // Only render the badge if count is greater than 0
  if (count <= 0) {
    return null;
  }

  return (
    <span className={badgeClass}>
      {displayCount}
    </span>
  );
};

export default Badge;
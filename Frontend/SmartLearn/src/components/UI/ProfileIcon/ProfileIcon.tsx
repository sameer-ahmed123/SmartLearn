import React from 'react';
import styles from './ProfileIcon.module.css';

interface ProfileIconProps {
  name: string; // Used to derive the initial
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  name, 
  size = 'medium', 
  className = '' 
}) => {
  // Logic to get the first letter of the name
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`${styles.profileIcon} ${styles[size]} ${className}`}>
      {initial}
    </div>
  );
};

export default ProfileIcon;
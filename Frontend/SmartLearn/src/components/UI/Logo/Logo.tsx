import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

interface LogoProps {
  to?: string; // Where the logo links to (defaults to dashboard or home)
}

const Logo: React.FC<LogoProps> = ({ to = '/dashboard' }) => {
  return (
    <Link to={to} className={styles.logo}>
      <span className={styles.smart}>SMART</span>
      <span className={styles.learn}>LEARN</span>
    </Link>
  );
};

export default Logo;
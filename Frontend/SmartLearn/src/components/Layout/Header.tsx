import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './Layout.module.css';
import { Link } from 'react-router-dom';


// Import necessary UI components
import Logo from '../UI/Logo/Logo';
import ProfileIcon from '../UI/ProfileIcon/ProfileIcon';
import StatusTag from '../UI/StatusTag/StatusTag';
import Button from '../UI/Button/Button';

const Header: React.FC = () => {
    // 💡 FIX (Solution 1): Fetch primitives and functions individually.
    // This is safe because primitives (like 'Student' string) and functions
    // (like 'logout') only trigger a re-render when their value/reference actually changes.
    const role = useAuthStore(state => state.role);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);


    // Determine the user's name for the profile icon (use a default if needed)
    const userName = user?.name || (role ? `${role} User` : "Guest"); 

    return (
        <header className={styles.header}>
            {/* Logo links back to the dashboard */}
            <Logo to="/" />
            
            <div className={styles.headerRight}>
                {/* 1. Status Tag based on role */}
                <StatusTag variant={role === 'Teacher' ? 'warning' : 'success'}>
                    {role || 'Guest'}
                </StatusTag>

                {/* 2. Profile Icon and Link to Settings Page */}
                <Link to="/"> 
                    <ProfileIcon name={userName} size="medium" />
                </Link>

                {/* 3. Logout Button */}
                <Button onClick={logout} variant="secondary">
                    Log Out
                </Button>
            </div>
        </header>
    );
};

export default Header;
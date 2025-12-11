import React from 'react';
import styles from './Layout.module.css';
import Header from './Header'; 
import SideBar from './SideBar';

interface MainAppLayoutProps {
  children: React.ReactNode;
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({ children }) => {
  return (
    <div className={styles.appWrapper}>
      <Header /> 
      
      <div className={styles.contentArea}>
        <SideBar />
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainAppLayout;
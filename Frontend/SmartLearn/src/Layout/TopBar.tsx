import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Moon, Sun, Maximize2, ChevronDown } from 'lucide-react'; 
import styles from "./TopBar.module.css";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const [isDark, setIsDark] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // State for Current Language with Real Flag URL
  const [currentLang, setCurrentLang] = useState({ 
    code: 'en', 
    name: 'English', 
    flag: 'https://flagcdn.com/w40/us.png' 
  });

  // Reverted to your original languages: English, French, German
  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'fr', name: 'French', flag: 'https://flagcdn.com/w40/fr.png' },
    { code: 'de', name: 'German', flag: 'https://flagcdn.com/w40/de.png' }
  ];

  // Logic: Dark Mode Toggle for Tailwind v4
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const changeLanguage = (lang: any) => {
    setCurrentLang(lang);
    setShowLangMenu(false);
    
    // Google Translate integration functionality (Same as before)
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = lang.code;
      googleCombo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <header className={styles.topbar}>
      {/* Left Section: Menu & Search */}
      <div className={styles.leftSide}>
        <button onClick={toggleSidebar} className={styles.iconBtn}>
           <Menu size={20} />
        </button>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className={styles.rightSide}>
        <div className={styles.actionButtons}>
          <button className={styles.iconBtn} onClick={() => document.documentElement.requestFullscreen()}>
            <Maximize2 size={18} />
          </button>
          
          {/* Dark Mode Toggle Button */}
          <button onClick={() => setIsDark(!isDark)} className={styles.iconBtn}>
            {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
          </button>

          <div className={styles.notificationWrapper}>
            <button className={styles.iconBtn}>
              <Bell size={20} />
            </button>
            <span className={styles.countBadge}>3</span>
          </div>
        </div>

        {/* Language Selector (Flags Functionality Fixed) */}
        <div className={styles.langContainer} onMouseLeave={() => setShowLangMenu(false)}>
          <button className={styles.langPicker} onClick={() => setShowLangMenu(!showLangMenu)}>
            <img src={currentLang.flag} alt={currentLang.name} style={{ width: '20px', borderRadius: '2px' }} />
            <span className={styles.langTxt}>{currentLang.code.toUpperCase()}</span>
            <ChevronDown size={14} className={showLangMenu ? styles.rotated : ""} />
          </button>

          {showLangMenu && (
            <div className={styles.langBox}>
              {languages.map((lang) => (
                <div 
                  key={lang.code} 
                  className={`${styles.langRow} ${currentLang.code === lang.code ? styles.activeRow : ""}`}
                  onClick={() => changeLanguage(lang)}
                >
                  <img src={lang.flag} alt={lang.name} style={{ width: '20px', marginRight: '10px', borderRadius: '2px' }} />
                  <span className={styles.rowName}>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile (Reverted to Nil Yeager / ADMIN) */}
        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
             <p className={styles.name}>NAME</p>
             <span className={styles.role}>ADMIN</span>
          </div>
          <div className={styles.avatarCircle}>
             <img src="https://ui-avatars.com/api/?name=Nil+Yeager&background=4f46e5&color=fff" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
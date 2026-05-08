import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Moon,
  Sun,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import styles from "./TopBar.module.css";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const [isDark, setIsDark] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search active karne ke liye state

  const user = useAuthStore((state) => state.user);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null); // handles the clickout for notification dropdown

  const [currentLang, setCurrentLang] = useState({
    code: "en",
    name: "English",
    flag: "https://flagcdn.com/w40/us.png",
  });

  const languages = [
    { code: "en", name: "English", flag: "https://flagcdn.com/w40/us.png" },
    { code: "ur", name: "Urdu", flag: "https://flagcdn.com/w40/pk.png" }, // Urdu with Pakistan flag added
    { code: "fr", name: "French", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "de", name: "German", flag: "https://flagcdn.com/w40/de.png" },
  ];


  // Search trigger function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Aap yahan navigation ya API call add kar sakte hain:
      // router.push(`/search?q=${searchQuery}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node))
        setShowLangMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setShowNotifMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeLanguage = (lang: any) => {
    setCurrentLang(lang);
    setShowLangMenu(false);

    const googleCombo = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = lang.code;
      googleCombo.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const displayName = user?.full_name || "User";
  const displayRole = user?.role ? user.role.toUpperCase() : "GUEST";

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSide}>
        <button onClick={toggleSidebar} className={styles.iconBtn}>
          <Menu size={20} />
        </button>
        {/* Search Bar activated with Form */}
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search size={18} className={styles.searchIcon} />
          </button>
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.actionButtons}>
          <button
            className={styles.iconBtn}
            onClick={() => document.documentElement.requestFullscreen()}
          >
            <Maximize2 size={18} />
          </button>

          <button onClick={() => setIsDark(!isDark)} className={styles.iconBtn}>
            {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
          </button>

          <div className={styles.relativeWrapper} ref={notifRef}>
            <NotificationBell
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowLangMenu(false);
              }}
              className={`${styles.iconBtn} ${showNotifMenu ? styles.activeIcon : ""}`}
            />

            {showNotifMenu && <NotificationDropdown />}
          </div>
        </div>

        <div className={styles.relativeWrapper} ref={langRef}>
          <button
            className={styles.langPicker}
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotifMenu(false);
            }}
          >
            <img
              src={currentLang.flag}
              alt={currentLang.name}
              className={styles.flagImg}
            />
            <span className={styles.langTxt}>
              {currentLang.code.toUpperCase()}
            </span>
            <ChevronDown
              size={14}
              className={showLangMenu ? styles.rotated : ""}
            />
          </button>

          {showLangMenu && (
            <div className={styles.langBox}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`${styles.langRow} ${currentLang.code === lang.code ? styles.activeRow : ""}`}
                  onClick={() => changeLanguage(lang)}
                >
                  <img
                    src={lang.flag}
                    alt={lang.name}
                    className={styles.flagImg}
                  />
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <p className={styles.name}>{displayName}</p>
            <span className={styles.role}>{displayRole}</span>
          </div>
          <div className={styles.avatarCircle}>
            <img
              src={avatarUrl}
              alt="User Profile"
              className={styles.profileImg}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${displayName}&background=4f46e5&color=fff`;
              }}
            />
            <div className={styles.onlineStatus}></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

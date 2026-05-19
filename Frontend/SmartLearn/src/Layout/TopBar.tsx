import  { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Moon,
  Sun,
  Maximize2,
  ChevronDown,
  Book,
  Video,
  HelpCircle,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./TopBar.module.css";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Link } from "react-router-dom";
import apiClient from "@/api/apiClient";


interface TopBarProps {
  toggleSidebar: () => void;
}

// Icons map for search results
const typeIcons: any = {
  course: <Book size={14} />,
  lecture: <Video size={14} />,
  quiz: <HelpCircle size={14} />,
  assignment: <FileText size={14} />,
  student: <UserIcon size={14} />,
  teacher: <UserIcon size={14} />,
};

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const [isDark, setIsDark] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // New States for Search Results
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null); // To handle click outside search

  const [currentLang, setCurrentLang] = useState({
    code: "en",
    name: "English",
    flag: "https://flagcdn.com/w40/us.png",
  });

  const languages = [
    { code: "en", name: "English", flag: "https://flagcdn.com/w40/us.png" },
    { code: "ur", name: "Urdu", flag: "https://flagcdn.com/w40/pk.png" },
    { code: "fr", name: "French", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "de", name: "German", flag: "https://flagcdn.com/w40/de.png" },
  ];

  // --- SEARCH LOGIC WITH DEBOUNCE ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await apiClient.get(`/lectures/search/?q=${searchQuery}`);
          setSearchResults(response.data);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchResultClick = (url: string) => {
    navigate(url);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node))
        setShowLangMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setShowNotifMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node))
        setShowSearchDropdown(false);
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

  const changeLanguage = (lang: any) => {
    setCurrentLang(lang);
    setShowLangMenu(false);

    const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = lang.code;
      googleCombo.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

 
  return (
    <header className={styles.topbar}>
      <div className={styles.leftSide}>
        <button onClick={toggleSidebar} className={styles.iconBtn}>
          <Menu size={20} />
        </button>
        
        {/* UPDATED: Search Bar with Dropdown Container */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
            />
          </div>

          {/* Search Dropdown Results - FIXED with onMouseDown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className={styles.searchDropdown}>
              {searchResults.map((item: any, index) => (
                <div 
                  key={index} 
                  className={styles.searchItem} 
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents input blur before click
                    handleSearchResultClick(item.url);
                  }}
                >
                  <span className={styles.itemIcon}>{typeIcons[item.type] || <Search size={14}/>}</span>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <span className={styles.itemType}>{item.type.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            <img src={currentLang.flag} alt={currentLang.name} className={styles.flagImg} />
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
                  <img src={lang.flag} alt={lang.name} className={styles.flagImg} />
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <p className={styles.name}>{user?.full_name}</p>
            <span className={styles.role}>{user?.role}</span>
          </div>
          <div className={styles.avatarCircle}>
            <Link to="/settings/profile">
              <img
                src={user?.profile?.avatar || "/default-avatar.png"}
                alt="User Profile"
                className={styles.profileImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${user?.full_name}&background=4f46e5&color=fff`;
                }}
              />
            </Link>
            <div className={styles.onlineStatus}></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
import { useState, useEffect, useRef } from "react";
import { SignupForm } from "@/components/Auth/signup-form";
import { Languages, ChevronDown, Check } from "lucide-react";
import "../components/Auth/Auth.css"; 

export default function SignupPage() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Default Language Setup (Matching TopBar)
  const [currentLang, setCurrentLang] = useState({ 
    code: 'en', 
    name: 'English', 
    flag: 'https://flagcdn.com/w40/us.png' 
  });

  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'fr', name: 'French', flag: 'https://flagcdn.com/w40/fr.png' },
    { code: 'de', name: 'German', flag: 'https://flagcdn.com/w40/de.png' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // YOUR TRANSLATION LOGIC (From TopBar)
  const changeLanguage = (lang: any) => {
    setCurrentLang(lang);
    setShowLangMenu(false);
    
    // Triggering Google Translate combo box
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = lang.code;
      googleCombo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="main-wrapper">
      {/* TRANSLATION DROP-DOWN */}
      <div className="translation-container" ref={langRef}>
        <button 
          className={`lang-btn ${showLangMenu ? 'active' : ''}`} 
          onClick={() => setShowLangMenu(!showLangMenu)}
        >
          <img src={currentLang.flag} alt={currentLang.name} className="btn-flag" />
          <span>{currentLang.code.toUpperCase()}</span>
          <ChevronDown size={14} className={showLangMenu ? 'rotate' : ''} />
        </button>

        {showLangMenu && (
          <div className="lang-dropdown">
            {languages.map((lang) => (
              <div 
                key={lang.code} 
                className={`lang-item ${currentLang.code === lang.code ? 'selected' : ''}`}
                onClick={() => changeLanguage(lang)}
              >
                <div className="lang-info">
                    <img src={lang.flag} alt={lang.name} className="item-flag" />
                    <span>{lang.name}</span>
                </div>
                {currentLang.code === lang.code && <Check size={14} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="auth-card">
        <div className="form-header">
          <span className="brand-logo">🎓</span>
          <h2>SmartLearn</h2>
          <p>Start your learning journey today</p>
        </div>
        <SignupForm />
        <div className="form-footer">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
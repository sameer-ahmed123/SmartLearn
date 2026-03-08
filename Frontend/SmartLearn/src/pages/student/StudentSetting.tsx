import React, { useState } from 'react';
import { 
  User, Bell, Lock, Settings, 
  Save, Mail, Camera, Smartphone, Key, BookOpen, GraduationCap
} from 'lucide-react';
import styles from "./StudentSettings.module.css";

const StudentSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.pageWrapper}>
      
      {/* GRADIENT BANNER */}
      <div className={styles.settingsBanner}>
        <div className={styles.bannerLeft}>
          <h2 className={styles.bannerTitle}>Student <span className={styles.highlight}>Settings</span></h2>
          <p className={styles.bannerSub}>Manage your academic profile, notifications, and security.</p>
        </div>
        <Settings size={140} className={styles.bgIcon} />
      </div>

      <div className={styles.settingsLayout}>
        {/* SIDEBAR TABS */}
        <aside className={styles.sidebar}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile Info
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} /> Password & Security
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={styles.contentCard}>
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className={styles.tabContent}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarWrapper}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student" alt="Profile" className={styles.avatarImg} />
                  <button className={styles.editAvatar}><Camera size={14} /></button>
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Personal Information</h3>
                  <p className={styles.sectionSub}>Update your personal details and academic info.</p>
                </div>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input type="text" defaultValue="Shahzaib Ahmed" className={styles.mainInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <div className={styles.inputWithIcon}>
                    <Mail size={16} />
                    <input type="email" defaultValue="shahzaib.a@student.edu" className={styles.mainInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Major / Course</label>
                  <div className={styles.inputWithIcon}>
                    <GraduationCap size={16} />
                    <input type="text" defaultValue="Software Engineering" className={styles.mainInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Student ID (Locked)</label>
                  <input type="text" defaultValue="STU-2026-0042" className={styles.mainInput} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                <label>Academic Bio</label>
                <textarea 
                  className={styles.mainTextarea} 
                  defaultValue="Passionate learner focusing on Web Development and AI. Currently in my 3rd year."
                ></textarea>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className={styles.tabContent}>
              <h3 className={styles.sectionTitle}>Stay Updated</h3>
              <p className={styles.sectionSub}>Control alerts for assignments, quizzes, and class updates.</p>
              
              <div className={styles.notificationList}>
                <div className={styles.notifItem}>
                  <div className={styles.notifText}>
                    <p className={styles.notifLabel}>Assignment Deadlines</p>
                    <span className={styles.notifDesc}>Reminders 24 hours before a submission is due.</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notifItem}>
                  <div className={styles.notifText}>
                    <p className={styles.notifLabel}>Quiz Alerts</p>
                    <span className={styles.notifDesc}>Get notified when a new quiz is posted.</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notifItem}>
                  <div className={styles.notifText}>
                    <p className={styles.notifLabel}>Lecture Announcements</p>
                    <span className={styles.notifDesc}>Instant alerts for lecture uploaded.</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className={styles.tabContent}>
              <h3 className={styles.sectionTitle}>Change Password</h3>
              <p className={styles.sectionSub}>Keep your account secure with a strong password.</p>
              
              <div className={styles.inputGrid} style={{ marginTop: '25px' }}>
                <div className={styles.inputGroup}>
                  <label>Current Password</label>
                  <div className={styles.inputWithIcon}>
                    <Lock size={16} />
                    <input type="password" placeholder="••••••••" className={styles.mainInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>New Password</label>
                  <div className={styles.inputWithIcon}>
                    <Key size={16} />
                    <input type="password" placeholder="Min. 8 characters" className={styles.mainInput} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.footerActions}>
            <button className={styles.saveBtn}>
              <Save size={18} /> Update Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentSettings;
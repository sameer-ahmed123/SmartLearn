import  { useState } from 'react';
import { 
  User, Bell, Lock, Settings, 
  Save, Mail, Camera, Smartphone, Key
} from 'lucide-react';
import styles from "./TeacherSettings.module.css";

const TeacherSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.pageWrapper}>
      
      {/* GRADIENT BANNER */}
      <div className={styles.settingsBanner}>
        <div className={styles.bannerLeft}>
          <h2 className={styles.bannerTitle}>Account <span className={styles.highlight}>Settings</span></h2>
          <p className={styles.bannerSub}>Manage your profile, notifications, and security preferences.</p>
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
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" alt="Profile" className={styles.avatarImg} />
                  <button className={styles.editAvatar}><Camera size={14} /></button>
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Public Profile</h3>
                  <p className={styles.sectionSub}>This information will be visible to your students.</p>
                </div>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input type="text" defaultValue="Dr. Sarah Johnson" className={styles.mainInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <div className={styles.inputWithIcon}>
                    <Mail size={16} />
                    <input type="email" defaultValue="sarah.j@university.edu" className={styles.mainInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Department</label>
                  <input type="text" defaultValue="Computer Science" className={styles.mainInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <div className={styles.inputWithIcon}>
                    <Smartphone size={16} />
                    <input type="text" defaultValue="+1 (555) 000-1234" className={styles.mainInput} />
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                <label>Bio</label>
                <textarea 
                  className={styles.mainTextarea} 
                  defaultValue="Professor of Computer Science with 10+ years of experience in AI and Machine Learning."
                ></textarea>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className={styles.tabContent}>
              <h3 className={styles.sectionTitle}>Notification Preferences</h3>
              <p className={styles.sectionSub}>Control how you receive alerts and updates.</p>
              
              <div className={styles.notificationList}>
                <div className={styles.notifItem}>
                  <div className={styles.notifText}>
                    <p className={styles.notifLabel}>Email Notifications</p>
                    <span className={styles.notifDesc}>Receive daily summaries of student activity.</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notifItem}>
                  <div className={styles.notifText}>
                    <p className={styles.notifLabel}>SMS Alerts</p>
                    <span className={styles.notifDesc}>Get urgent alerts via SMS.</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className={styles.tabContent}>
              <h3 className={styles.sectionTitle}>Update Password</h3>
              <p className={styles.sectionSub}>Ensure your account is using a long, random password to stay secure.</p>
              
              <div className={styles.inputGrid} style={{ marginTop: '25px' }}>
                <div className={styles.inputGroup}>
                  <label>New Password</label>
                  <div className={styles.inputWithIcon}>
                    <Key size={16} />
                    <input type="password" placeholder="Enter new password" className={styles.mainInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Confirm Password</label>
                  <div className={styles.inputWithIcon}>
                    <Key size={16} />
                    <input type="password" placeholder="Repeat new password" className={styles.mainInput} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.footerActions}>
            <button className={styles.saveBtn}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherSettings;
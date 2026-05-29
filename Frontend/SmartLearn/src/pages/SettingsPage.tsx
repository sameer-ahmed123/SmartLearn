import { useState } from "react";
import { User, Bell, Lock, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import ProfileUpdateForm from "@/components/Profile/ProfileUpdateForm";
import ChangePassword from "@/components/Profile/ChangePassword";
import ProfileProgress from "@/components/Profile/ProfileProgress";

import styles from "./SettingsPage.module.css";

type NotificationToggleProps = {
  title: string;
  description: string;
  defaultChecked?: boolean;
};

const NotificationToggle = ({
  title,
  description,
  defaultChecked = false,
}: NotificationToggleProps) => {
  return (
    <div className={styles.notificationItem}>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <label className={styles.switch}>
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "security"
  >("profile");

  const user = useAuthStore((state) => state.user);
  const profile = user?.profile;

  const roleLabel = user?.role === "student" ? "Student" : "Teacher";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.settingsBanner}>
        <div>
          <h2 className={styles.bannerTitle}>
            {roleLabel} <span className={styles.highlight}>Settings</span>
          </h2>
          <p className={styles.bannerSub}>
            Manage your profile, notifications, and account security.
          </p>
        </div>

        <Settings size={140} className={styles.bgIcon} />
      </div>

      <div className={styles.settingsLayout}>
        <aside className={styles.sidebar}>
          <button
            className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} /> Profile Info
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === "notifications" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> Notifications
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === "security" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} /> Password & Security
          </button>
        </aside>

        <main className={styles.contentCard}>
          <div className={styles.contentInner}>
            {activeTab === "profile" && (
              <>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Profile Information</h3>
                  <p className={styles.sectionSub}>
                    Update your personal and public profile details.
                  </p>
                </div>

                <ProfileProgress profile={profile} />

                <div className={styles.tabSection}>
                  <ProfileUpdateForm />
                </div>
              </>
            )}
            {activeTab === "notifications" && (
              <>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    Notification Preferences
                  </h3>
                  <p className={styles.sectionSub}>
                    Choose what updates you want to receive.
                  </p>
                </div>

                <div className={styles.notificationList}>
                  <NotificationToggle
                    title="Assignment Updates"
                    description="Notify me when assignments are created, updated, or graded."
                    defaultChecked
                  />

                  <NotificationToggle
                    title="Quiz Alerts"
                    description="Notify me when a new quiz is published or deadline is near."
                    defaultChecked
                  />

                  <NotificationToggle
                    title="Lecture Updates"
                    description="Notify me when new lectures or course material are uploaded."
                    defaultChecked
                  />

                  <NotificationToggle
                    title="Gradebook Updates"
                    description="Notify me when marks, feedback, or results are posted."
                  />

                  <NotificationToggle
                    title="Email Notifications"
                    description="Send important alerts to my email address."
                    defaultChecked
                  />

                  <NotificationToggle
                    title="Push Notifications"
                    description="Show browser notifications for urgent updates."
                  />
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Password & Security</h3>
                  <p className={styles.sectionSub}>
                    Change your password and secure your account.
                  </p>
                </div>

                <div className={styles.tabSection}>
                  <ChangePassword />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;

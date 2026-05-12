import ProfileUpdateForm from "@/components/Profile/ProfileUpdateForm";
import ChangePassword from "@/components/Profile/ChangePassword";
import styles from "./ProfileUpdate.module.css";
import ProfileProgress from "@/components/Profile/ProfileProgress";
import { useAuthStore } from "@/store/useAuthStore";

const ProfilePage = () => {
  const profile= useAuthStore((state)=>state.user?.profile)
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Account Settings</h1>
      <ProfileProgress profile={profile} />

      {/* Profile Information Section */}
      <section className={styles.section}>
        <ProfileUpdateForm />
      </section>

      <hr className={styles.divider} />

      {/* Security Section */}
      <section className={styles.section}>
        <ChangePassword />
      </section>
    </div>
  );
};

export default ProfilePage;

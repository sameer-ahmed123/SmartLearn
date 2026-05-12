import { useMemo } from 'react';
import styles from './ProfileProgress.module.css';
import type { ProfileData } from "@/types/Profile/Types";

interface Props {
  // Use the actual type instead of 'any' for better IntelliSense
  profile: ProfileData | undefined | null;
}

const ProfileProgress = ({ profile }: Props) => {
  const progress = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      profile.avatar,
      profile.bio,
      profile.phone_number,
      profile.location,
      profile.department,
      profile.linkedin_url,
      profile.instagram_url,
      profile.github_url,
      profile.website_url
    ];
    
    // Check for null, undefined, or empty strings
    const filledFields = fields.filter(field => 
      field !== null && 
      field !== undefined && 
      field.toString().trim() !== ''
    ).length;

    return Math.round((filledFields / fields.length) * 100);
  }, [profile]);

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <span className={styles.labelText}>Profile Completion</span>
        <span className={styles.percentText}>{progress}%</span>
      </div>
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ 
            width: `${progress}%`, 
            backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6' 
          }}
        />
      </div>
    </div>
  );
};

export default ProfileProgress;
import React, { useEffect, useState } from "react";
import { profileService } from "@/api/ProfileService";
import type { ProfileData } from "@/types/Profile/Types";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-toastify";
import styles from "../../pages/ProfileUpdate.module.css";

const ProfileUpdateForm = () => {
  const { user, userData } = useAuthStore();
  const updateUserGlobal = useAuthStore((state) => state.updateUser);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // 2. Upload to backend/Cloudinary
    try {
      toast.info("Uploading image...");
      const updatedProfile = await profileService.updateAvatar(file);
      setProfile(updatedProfile);
      updateUserGlobal(updatedProfile);
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error("Failed to upload avatar");
    }
  };
  const loadProfile = async () => {
    try {
      const data = await profileService.getMyProfile();
      console.log(data.avatar);
      setProfile(data);
    } catch (err) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await profileService.updateMyProfile(profile);
      updateUserGlobal(profile);
      toast.success("Settings updated!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className={styles.container}>Loading settings...</div>;

  return (
    <>
      <h2 className={styles.title}>Profile Settings</h2>
      <div className={styles.avatarSection}>
        <img
          src={avatarPreview || profile?.avatar || "/default-avatar.png"}
          alt="Avatar"
          className={styles.avatarImage}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${profile?.full_name}&background=4f46e5&color=fff`;
          }}
        />
        <label className={styles.uploadLabel}>
          Change Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className={styles.grid}>
        {/* Read Only */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            value={profile?.full_name}
            disabled
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="text"
            value={profile?.email}
            disabled
            className={styles.input}
          />
        </div>

        {/* Contact & Personal */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label>
          <input
            type="tel"
            value={profile?.phone_number || ""}
            onChange={(e) =>
              setProfile({ ...profile!, phone_number: e.target.value })
            }
            placeholder="+92 300 1234567"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Birthday</label>
          <input
            type="date"
            value={profile?.birth_date || ""}
            onChange={(e) =>
              setProfile({ ...profile!, birth_date: e.target.value })
            }
            className={styles.input}
          />
        </div>

        {/* Academic & Location */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Department</label>
          <input
            type="text"
            value={profile?.department || ""}
            onChange={(e) =>
              setProfile({ ...profile!, department: e.target.value })
            }
            placeholder="e.g. Computer Science"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Location</label>
          <input
            type="text"
            value={profile?.location || ""}
            onChange={(e) =>
              setProfile({ ...profile!, location: e.target.value })
            }
            placeholder="e.g. Islamabad, Pakistan"
            className={styles.input}
          />
        </div>

        {/* Bio - Full Width */}
        <div className={`${styles.formGroup} md:col-span-2`}>
          <label className={styles.label}>Bio</label>
          <textarea
            rows={3}
            value={profile?.bio || ""}
            onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
            className={styles.textarea}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" disabled={saving} className={styles.saveButton}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileUpdateForm;

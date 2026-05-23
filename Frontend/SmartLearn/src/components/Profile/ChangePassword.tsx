import React, { useState } from 'react';
import { profileService } from '@/api/ProfileService';
import { toast } from 'react-toastify';
import styles from '../../pages/ProfileUpdate.module.css'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      return toast.error("New passwords do not match!");
    }

    setLoading(true);
    try {
      await profileService.changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      toast.success("Password updated successfully!");
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.old_password?.[0] || "Update failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card} >
      <h3 className={styles.title}>Account Security</h3>
      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Current Password</label>
          <input 
            type="password" 
            className={styles.input}
            value={formData.old_password}
            onChange={(e) => setFormData({...formData, old_password: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          {/* Empty div to keep grid alignment if needed */}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input 
            type="password" 
            className={styles.input}
            value={formData.new_password}
            onChange={(e) => setFormData({...formData, new_password: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm New Password</label>
          <input 
            type="password" 
            className={styles.input}
            value={formData.confirm_password}
            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
            required
          />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" disabled={loading} className={styles.saveButton}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
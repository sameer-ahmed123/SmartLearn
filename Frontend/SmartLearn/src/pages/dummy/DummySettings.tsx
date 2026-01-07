import { settingsData } from './dummy_data/mockData';
import styles from './DummySettings.module.css';

const DummySettings = () => {
    return (
        <>
            <div className={styles.container}>
                <h1>Account Settings</h1>
                
                <div className={styles.grid}>
                    {/* Profile Section */}
                    <div className={styles.card}>
                        <h2>Profile Information</h2>
                        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input type="text" defaultValue={settingsData.profile.name} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email Address</label>
                                <input type="email" defaultValue={settingsData.profile.email} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Role</label>
                                <input type="text" defaultValue={settingsData.profile.role} disabled className={styles.disabled} />
                            </div>
                            <button className={styles.saveBtn}>Update Profile</button>
                        </form>
                    </div>

                    {/* Notifications Section */}
                    <div className={styles.card}>
                        <h2>Notifications</h2>
                        <div className={styles.toggleRow}>
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Receive daily summaries of student activity.</p>
                            </div>
                            <label className={styles.switch}>
                                <input type="checkbox" defaultChecked={settingsData.notifications.email} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.toggleRow}>
                            <div>
                                <h4>SMS Alerts</h4>
                                <p>Get urgent alerts via SMS.</p>
                            </div>
                            <label className={styles.switch}>
                                <input type="checkbox" defaultChecked={settingsData.notifications.sms} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DummySettings;
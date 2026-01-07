import { assignmentsData } from './dummy_data/mockData';
import styles from './DummyAssignments.module.css';

const DummyAssignments = () => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Assignments</h1>
                    <button className={styles.createBtn}>+ Create Assignment</button>
                </div>

                {/* Filter Tabs (Mock) */}
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${styles.active}`}>All</button>
                    <button className={styles.tab}>Active</button>
                    <button className={styles.tab}>Drafts</button>
                    <button className={styles.tab}>Archived</button>
                </div>

                <div className={styles.grid}>
                    {assignmentsData.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                                    {item.status}
                                </span>
                                <span className={styles.course}>{item.course}</span>
                            </div>
                            <h3>{item.title}</h3>
                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <span>📅 Due Date</span>
                                    <strong>{item.dueDate}</strong>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>📥 Submissions</span>
                                    <strong>{item.submissions}</strong>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.btnSecondary}>Edit</button>
                                <button className={styles.btnPrimary}>View Subs</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DummyAssignments;
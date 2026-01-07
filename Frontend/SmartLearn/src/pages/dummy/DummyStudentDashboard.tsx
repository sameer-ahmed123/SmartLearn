import { studentDashboardData } from './dummy_data/mockData';
import styles from './DummyStudentDashboard.module.css';

const DummyStudentDashboard = () => {
    return (
        <>
            <div className={styles.container}>
                {/* Welcome Hero */}
                <div className={styles.hero}>
                    <div>
                        <h1>{studentDashboardData.welcomeMessage}</h1>
                        <p>You're on a <strong>{studentDashboardData.learningStreak} day streak!</strong> 🔥 Keep it up.</p>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {/* Left Col: Courses */}
                    <div className={styles.leftCol}>
                        <h2>Continue Learning</h2>
                        {studentDashboardData.coursesInProgress.map(course => (
                            <div key={course.id} className={styles.courseCard}>
                                <div className={styles.courseHeader}>
                                    <h3>{course.title}</h3>
                                    <span className={styles.percent}>{course.progress}%</span>
                                </div>
                                <div className={styles.progressBarBg}>
                                    <div 
                                        className={styles.progressBarFill} 
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                                <p className={styles.nextLesson}>Next: {course.nextLesson}</p>
                                <button className={styles.resumeBtn}>Resume</button>
                            </div>
                        ))}
                    </div>

                    {/* Right Col: Deadlines */}
                    <div className={styles.rightCol}>
                        <h2>Upcoming Deadlines</h2>
                        <div className={styles.deadlineCard}>
                            {studentDashboardData.upcomingDeadlines.map(item => (
                                <div key={item.id} className={styles.deadlineItem}>
                                    <div className={styles.deadlineIcon}>
                                        {item.type === 'quiz' ? '📝' : '⏰'}
                                    </div>
                                    <div>
                                        <h4>{item.title}</h4>
                                        <p>{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DummyStudentDashboard;
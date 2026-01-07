import { analyticsData } from './dummy_data/mockData';
import styles from './DummyAnalytics.module.css';

const DummyAnalytics = () => {
    // Helper to generate SVG polyline points
    const generateChartPoints = (data: number[]) => {
        const width = 100; // viewbox units
        const height = 50;
        const max = Math.max(...data);
        const step = width / (data.length - 1);
        
        return data.map((val, i) => {
            const x = i * step;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        }).join(" ");
    };

    return (
        <>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Platform Analytics</h1>
                    <span className={styles.dateBadge}>Last 7 Days</span>
                </header>

                {/* KPI Grid */}
                <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                        <h3>Total Students</h3>
                        <p className={styles.kpiValue}>{analyticsData.totalStudents}</p>
                        <span className={styles.trendUp}>+12% vs last week</span>
                    </div>
                    <div className={styles.kpiCard}>
                        <h3>Avg. Completion</h3>
                        <p className={styles.kpiValue}>{analyticsData.avgCompletion}%</p>
                        <span className={styles.trendNeutral}>+0.5% vs last week</span>
                    </div>
                    <div className={styles.kpiCard}>
                        <h3>Est. Revenue</h3>
                        <p className={styles.kpiValue}>{analyticsData.revenue}</p>
                        <span className={styles.trendUp}>+5% vs last week</span>
                    </div>
                </div>

                {/* Main Graph Section */}
                <div className={styles.graphSection}>
                    <h2>Engagement Trends</h2>
                    <div className={styles.chartContainer}>
                        <svg viewBox="0 0 100 50" className={styles.svgChart}>
                            <polyline 
                                points={generateChartPoints(analyticsData.engagement)} 
                                className={styles.chartLine}
                            />
                            {/* Simple grid lines */}
                            <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" strokeWidth="0.5" />
                            <line x1="0" y1="25" x2="100" y2="25" stroke="#eee" strokeWidth="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className={styles.bottomGrid}>
                    <div className={styles.tableCard}>
                        <h3>Top Performing Courses</h3>
                        <table>
                            <thead>
                                <tr><th>Course</th><th>Students</th><th>Rating</th></tr>
                            </thead>
                            <tbody>
                                {analyticsData.topCourses.map((c, i) => (
                                    <tr key={i}>
                                        <td>{c.name}</td>
                                        <td>{c.students}</td>
                                        <td>⭐ {c.rating}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DummyAnalytics;
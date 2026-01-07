import { gradebookData } from './dummy_data/mockData';
import styles from './DummyGradebook.module.css';

const DummyGradebook = () => {
    // Helper for grade coloring
    const getScoreColor = (score: number) => {
        if (score >= 90) return styles.gradeA;
        if (score >= 75) return styles.gradeB;
        if (score >= 60) return styles.gradeC;
        return styles.gradeF;
    };

    return (
        <>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Gradebook: CS101</h1>
                    <div className={styles.actions}>
                        <button className={styles.exportBtn}>Export CSV</button>
                        <button className={styles.settingsBtn}>⚙️</button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <span>Class Average</span>
                        <strong>{gradebookData.classAverage}%</strong>
                    </div>
                    <div className={styles.summaryCard}>
                        <span>Highest Score</span>
                        <strong>{gradebookData.highestScore}%</strong>
                    </div>
                    <div className={styles.summaryCard}>
                        <span>Pending Grading</span>
                        <strong>{gradebookData.pendingGrading}</strong>
                    </div>
                </div>

                {/* Grade Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                {gradebookData.columns.map((col, i) => (
                                    <th key={i} className={styles.centerAlign}>{col}</th>
                                ))}
                                <th className={styles.rightAlign}>Final Grade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradebookData.students.map((student) => (
                                <tr key={student.id}>
                                    <td className={styles.nameCol}>
                                        <div className={styles.avatar}>{student.name.charAt(0)}</div>
                                        {student.name}
                                    </td>
                                    {student.scores.map((score, i) => (
                                        <td key={i} className={styles.centerAlign}>
                                            <span className={`${styles.scoreBadge} ${getScoreColor(score)}`}>
                                                {score}
                                            </span>
                                        </td>
                                    ))}
                                    <td className={`${styles.rightAlign} ${styles.finalScore}`}>
                                        {student.final}%
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${student.status === 'At Risk' ? styles.risk : styles.pass}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DummyGradebook;
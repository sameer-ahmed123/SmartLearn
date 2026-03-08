import React, { useState } from 'react';
import { 
  Search, Filter, Download, 
  Edit2, Trash2, TrendingUp, 
  Award, BookOpen, Users, GraduationCap
} from 'lucide-react';
import styles from "./TeacherGradeBook.module.css";

const initialGrades = [
  { id: 1, student: "Amelia Blue", idNum: "STU-001", assignment: 85, quiz: 92, exam: 88, total: "88%", grade: "A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia" },
  { id: 2, student: "Johen Mark", idNum: "STU-002", assignment: 72, quiz: 65, exam: 70, total: "69%", grade: "C+", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Johen" },
  { id: 3, student: "Micheal Scott", idNum: "STU-003", assignment: 95, quiz: 98, exam: 94, total: "96%", grade: "A+", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Micheal" },
  { id: 4, student: "Amanda Rose", idNum: "STU-004", assignment: 88, quiz: 80, exam: 82, total: "83%", grade: "B+", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda" },
];

const GradeBookPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGrades = initialGrades.filter(item => 
    item.student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        
        {/* Banner Section */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Academic <span className={styles.highlight}>Grade Book</span></h2>
              <p className={styles.bannerSub}>
                Monitor student performance and manage academic records effectively.
              </p>
          </div>
          <GraduationCap size={140} className={styles.capIcon} />
        </div>

        {/* 4 Stats Boxes Row */}
        <div className={styles.statsRow}>
          {[
            { label: 'AVG GRADE', val: '82.4%', icon: <TrendingUp size={22} />, color: '#6366f1' },
            { label: 'PASS RATE', val: '94%', icon: <Award size={22} />, color: '#10b981' },
            { label: 'ACTIVE STUDENTS', val: '142', icon: <Users size={22} />, color: '#f59e0b' },
            { label: 'COURSES', val: '12', icon: <BookOpen size={22} />, color: '#f43f5e' },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ color: stat.color, background: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <div className={styles.statInfo}>
                <p>{stat.label}</p>
                <h3>{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Search, Filter, and Export Action Row */}
        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search student by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.actionGroup}>
            <button className={styles.roundActionBtn}><Filter size={18} /></button>
            <button className={styles.exportBtnActions}>
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.gradeTable}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Quiz</th>
                  <th>Final Exam</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.studentCell}>
                        <img src={row.avatar} alt="" className={styles.avatar} />
                        <div>
                          <p className={styles.sName}>{row.student}</p>
                          <span className={styles.sId}>{row.idNum}</span>
                        </div>
                      </div>
                    </td>
                    <td><div className={styles.scoreBadge}>{row.assignment}/100</div></td>
                    <td><div className={styles.scoreBadge}>{row.quiz}/100</div></td>
                    <td><div className={styles.scoreBadge}>{row.exam}/100</div></td>
                    <td><span className={styles.totalText}>{row.total}</span></td>
                    <td>
                      <span className={`${styles.gradeBadge} ${styles[`grade${row.grade.charAt(0)}`]}`}>
                        {row.grade}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.circleEdit} title="Edit"><Edit2 size={14} /></button>
                        <button className={styles.circleDelete} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeBookPage;
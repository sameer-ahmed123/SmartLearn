import React, { useState } from 'react';
import { 
  TrendingUp, Users, BookOpen, 
  BarChart3, Award, Clock, AlertCircle, 
  Layout, ChevronDown, CheckCircle2, ClipboardCheck
} from 'lucide-react';
import styles from "./TeacherAnalytics.module.css";

const AnalyticsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("March 2026");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const months = ["January 2026", "February 2026", "March 2026", "April 2026"];

  const stats = [
    { label: 'AVG GRADE', val: '82.4%', icon: <TrendingUp size={20} />, color: '#6366f1' },
    { label: 'PASS RATE', val: '94%', icon: <Award size={20} />, color: '#10b981' },
    { label: 'ACTIVE STUDENTS', val: '142', icon: <Users size={20} />, color: '#f59e0b' },
    { label: 'COURSES', val: '12', icon: <BookOpen size={20} />, color: '#f43f5e' },
  ];

  const courses = [
    { name: 'UI/UX Design', score: 92, students: 120 },
    { name: 'Web Development', score: 88, students: 85 },
    { name: 'Marketing Management', score: 75, students: 60 },
    { name: 'Data Science Fundamentals', score: 82, students: 45 },
  ];

  return (
    <div className={styles.analyticsContainer}>
      <main className={styles.mainContainer}>
        
        {/* Academic Analytics Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Academic <span className={styles.highlight}>Analytics</span></h2>
              <p className={styles.bannerSub}>Monitor student performance and manage academic records effectively.</p>
          </div>
          <BarChart3 size={140} className={styles.capIcon} />
        </div>

        {/* 4 Stats Boxes Row */}
        <div className={styles.statsRow}>
          {stats.map((stat, idx) => (
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

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          <div className={styles.largeChartCard}>
            <div className={styles.cardHeader}>
              <h3>Lecture Progress Analysis</h3>
              <div className={styles.dropdownContainer}>
                <button className={styles.timeDropdown} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  {selectedMonth} <ChevronDown size={14} />
                </button>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {months.map(m => (
                      <div key={m} onClick={() => { setSelectedMonth(m); setIsDropdownOpen(false); }}>{m}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.barChartPlaceholder}>
              <div className={styles.barGroup}><div className={styles.bar} style={{ height: '70%', background: '#f59e0b' }}></div><span>Total</span></div>
              <div className={styles.barGroup}><div className={styles.bar} style={{ height: '85%', background: '#6366f1' }}></div><span>Generated</span></div>
              <div className={styles.barGroup}><div className={styles.bar} style={{ height: '30%', background: '#f43f5e' }}></div><span>Pending</span></div>
              <div className={styles.barGroup}><div className={styles.bar} style={{ height: '55%', background: '#10b981' }}></div><span>Validated</span></div>
            </div>
          </div>

          <div className={styles.smallChartCard}>
            <div className={styles.cardHeader}><h3>Overall Pass Percentage</h3></div>
            <div className={styles.circleContainer}>
              <div className={styles.progressCircle}><span className={styles.percentageText}>84%</span></div>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><span style={{background: '#6366f1'}}></span> Passed</div>
              <div className={styles.legendItem}><span style={{background: '#e2e8f0'}}></span> Remaining</div>
            </div>
          </div>
        </div>

        {/* Submission Grid */}
        <div className={styles.submissionGrid}>
          <div className={styles.imageStyleCard}>
            <h3>Assignment Submissions</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><CheckCircle2 size={18}/></div>
              <div className={styles.imgText}><p>On Time</p><strong>450</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fff1f2', color: '#f43f5e'}}><Clock size={18}/></div>
              <div className={styles.imgText}><p>Late Submission</p><strong>42</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fef3c7', color: '#f59e0b'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>Pending Review</p><strong>15</strong></div>
            </div>
          </div>

          <div className={styles.imageStyleCard}>
            <h3>Quiz Submissions</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><CheckCircle2 size={18}/></div>
              <div className={styles.imgText}><p>Completed</p><strong>890</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fff1f2', color: '#f43f5e'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>Missed</p><strong>12</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#e0e7ff', color: '#6366f1'}}><ClipboardCheck size={18}/></div>
              <div className={styles.imgText}><p>Avg. Grade</p><strong>A-</strong></div>
            </div>
          </div>

          <div className={styles.imageStyleCard}>
            <h3>Project Status</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><Layout size={18}/></div>
              <div className={styles.imgText}><p>Submitted</p><strong>124</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fef3c7', color: '#f59e0b'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>In Progress</p><strong>08</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#e0e7ff', color: '#6366f1'}}><Award size={18}/></div>
              <div className={styles.imgText}><p>Graded</p><strong>110</strong></div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}><h3>Subject Performance Ranking</h3></div>
          <div className={styles.courseList}>
            {courses.map((course, i) => (
              <div key={i} className={styles.courseRow}>
                <div className={styles.courseMain}>
                  <div className={styles.courseRank}>{i + 1}</div>
                  <div><p>{course.name}</p><span>{course.students} Students</span></div>
                </div>
                <div className={styles.courseScore}>
                  <div className={styles.progressWrap}><div className={styles.progress} style={{width: `${course.score}%`, background: '#6366f1'}}></div></div>
                  <span className={styles.scoreText}>{course.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalyticsPage;
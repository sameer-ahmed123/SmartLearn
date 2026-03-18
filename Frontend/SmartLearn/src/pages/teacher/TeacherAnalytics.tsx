import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BookOpen, 
  BarChart3, Award, Clock, AlertCircle, 
  Layout, ChevronDown, CheckCircle2, ClipboardCheck,
  Video
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  Cell, PieChart, Pie, Tooltip 
} from 'recharts';
import styles from "./TeacherAnalytics.module.css";
import apiClient from '@/api/apiClient';

const AnalyticsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("March 2026");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    courses: [],
    lectureProgress: [],
    submissions: {
      assignment: { onTime: 0, late: 0, pending: 0 },
      quiz: { completed: 0, missed: 0, avgGrade: "N/A" },
      project: { submitted: 0, inProgress: 0, graded: 0 }
    },
    passPercentage: 0,
    studentProgress: []
  });

  const months = ["January 2026", "February 2026", "March 2026", "April 2026"];

  const iconMap = {
    'AVG GRADE': <TrendingUp size={20} />,
    'PASS RATE': <Award size={20} />,
    'ACTIVE STUDENTS': <Users size={20} />,
    'COURSES': <BookOpen size={20} />
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/dashboard/teacher-analytics/?month=${selectedMonth}`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const barChartData = analyticsData.lectureProgress.length > 0 
    ? analyticsData.lectureProgress 
    : [
        { name: 'Total', value: 0, color: '#f59e0b' },
        { name: 'Generated', value: 0, color: '#6366f1' },
        { name: 'Pending', value: 0, color: '#f43f5e' },
        { name: 'Validated', value: 0, color: '#10b981' },
      ];

  const studentProgressData = analyticsData.studentProgress.length > 0 ? analyticsData.studentProgress : [
    { 
      name: 'Alex Johnson', 
      color: '#6366f1',
      lectures: [
        { title: 'React Hooks Deep Dive', progress: 85 },
        { title: 'State Management', progress: 40 }
      ]
    },
    { 
      name: 'Maria Garcia', 
      color: '#10b981',
      lectures: [
        { title: 'Advanced CSS', progress: 72 },
        { title: 'Flexbox & Grid', progress: 95 }
      ]
    },
  ];

  const displayStats = analyticsData.stats.length > 0 ? analyticsData.stats : [
    { label: 'AVG GRADE', val: '0%', color: '#6366f1' },
    { label: 'PASS RATE', val: '0%', color: '#10b981' },
    { label: 'ACTIVE STUDENTS', val: '0', color: '#f59e0b' },
    { label: 'COURSES', val: '0', color: '#f43f5e' },
  ];

  const passVal = analyticsData.passPercentage || 0;
  const pieData = [
    { name: 'Passed', value: passVal },
    { name: 'Remaining', value: 100 - passVal },
  ];

  return (
    <div className={styles.analyticsContainer}>
      <main className={styles.mainContainer}>
        
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerLeft}>
              <h2 className={styles.bannerTitle}>Academic <span className={styles.highlight}>Analytics</span></h2>
              <p className={styles.bannerSub}>Monitor student performance and manage academic records effectively.</p>
          </div>
          <BarChart3 size={140} className={styles.capIcon} />
        </div>

        <div className={styles.statsRow}>
          {displayStats.map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ color: stat.color, background: `${stat.color}15` }}>
                {iconMap[stat.label] || <TrendingUp size={20} />}
              </div>
              <div className={styles.statInfo}>
                <p>{stat.label}</p>
                <h3>{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

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
            
            <div style={{ width: '100%', height: 250, marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={barChartData}>
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.smallChartCard}>
            <div className={styles.cardHeader}><h3>Overall Pass Percentage</h3></div>
            <div className={styles.circleContainer} style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)', textAlign: 'center' 
              }}>
                <span className={styles.percentageText}>{passVal}%</span>
              </div>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><span style={{background: '#6366f1'}}></span> Passed</div>
              <div className={styles.legendItem}><span style={{background: '#e2e8f0'}}></span> Remaining</div>
            </div>
          </div>
        </div>

        <div className={styles.submissionGrid}>
          <div className={styles.imageStyleCard}>
            <h3>Assignment Submissions</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><CheckCircle2 size={18}/></div>
              <div className={styles.imgText}><p>On Time</p><strong>{analyticsData.submissions.assignment.onTime}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fff1f2', color: '#f43f5e'}}><Clock size={18}/></div>
              <div className={styles.imgText}><p>Late Submission</p><strong>{analyticsData.submissions.assignment.late}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fef3c7', color: '#f59e0b'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>Pending Review</p><strong>{analyticsData.submissions.assignment.pending}</strong></div>
            </div>
          </div>

          <div className={styles.imageStyleCard}>
            <h3>Quiz Submissions</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><CheckCircle2 size={18}/></div>
              <div className={styles.imgText}><p>Completed</p><strong>{analyticsData.submissions.quiz.completed}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fff1f2', color: '#f43f5e'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>Missed</p><strong>{analyticsData.submissions.quiz.missed}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#e0e7ff', color: '#6366f1'}}><ClipboardCheck size={18}/></div>
              <div className={styles.imgText}><p>Avg. Grade</p><strong>{analyticsData.submissions.quiz.avgGrade}</strong></div>
            </div>
          </div>

          <div className={styles.imageStyleCard}>
            <h3>Project Status</h3>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#dcfce7', color: '#10b981'}}><Layout size={18}/></div>
              <div className={styles.imgText}><p>Submitted</p><strong>{analyticsData.submissions.project.submitted}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#fef3c7', color: '#f59e0b'}}><AlertCircle size={18}/></div>
              <div className={styles.imgText}><p>In Progress</p><strong>{analyticsData.submissions.project.inProgress}</strong></div>
            </div>
            <div className={styles.imgRow}>
              <div className={styles.imgIcon} style={{background: '#e0e7ff', color: '#6366f1'}}><Award size={18}/></div>
              <div className={styles.imgText}><p>Graded</p><strong>{analyticsData.submissions.project.graded}</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
            <div className={styles.cardHeader} style={{ marginBottom: '20px' }}>
                <h3 className={styles.cardTitle}>Student Video Progress</h3>
                <div className={styles.dropdownContainer}>
                  <button className={styles.timeDropdown} onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}>
                    {selectedCourse} <ChevronDown size={14} />
                  </button>
                  {isCourseDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {["All Courses", ...analyticsData.courses.map(c => c.name)].map(courseName => (
                        <div key={courseName} onClick={() => { setSelectedCourse(courseName); setIsCourseDropdownOpen(false); }}>{courseName}</div>
                      ))}
                    </div>
                  )}
                </div>
            </div>

            <div className={styles.studentList}>
                {studentProgressData.map((student, idx) => (
                    <div key={idx} className={styles.studentItem} style={{ alignItems: 'flex-start', marginBottom: '25px' }}>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                          alt={student.name} 
                          className={styles.studentAvatar} 
                        />
                        <div className={styles.studentInfo} style={{ width: '100%' }}>
                            <div className={styles.studentHeader} style={{ marginBottom: '10px' }}>
                                <span className={styles.studentName} style={{ fontWeight: '700', fontSize: '1.1rem' }}>{student.name}</span>
                            </div>
                            
                            {/* Lectures Section */}
                            <div className={styles.lecturesContainer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {(student.lectures || []).map((lecture, lIdx) => (
                                <div key={lIdx} className={styles.lectureItem}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Video size={12} style={{ color: '#64748b' }} />
                                      <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{lecture.title}</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: student.color }}>{lecture.progress}%</span>
                                  </div>
                                  <div className={styles.progressTrack} style={{ height: '6px' }}>
                                      <div 
                                          className={styles.progressFill} 
                                          style={{ width: `${lecture.progress}%`, backgroundColor: student.color, height: '100%' }}
                                      ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.cardHeader}><h3>Subject Performance Ranking</h3></div>
          <div className={styles.courseList}>
            {(analyticsData.courses.length > 0 ? analyticsData.courses : []).map((course, i) => (
              <div key={i} className={styles.courseRow}>
                <div className={styles.courseMain}>
                  <div className={styles.courseRank}>{i + 1}</div>
                  <div><p>{course.name}</p><span>{course.students} Students</span></div>
                </div>
                <div className={styles.courseScore}>
                  <div className={styles.progressWrap}>
                    <div className={styles.progress} style={{width: `${course.score}%`, background: '#6366f1'}}></div>
                  </div>
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
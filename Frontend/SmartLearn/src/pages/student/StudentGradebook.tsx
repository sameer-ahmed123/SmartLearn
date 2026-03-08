import { useState } from "react";
import { 
  Trophy, BookOpen, FileText, LayoutGrid, 
  ClipboardCheck, Search, Download 
} from "lucide-react";
import "./StudentGradebook.css";

const StudentGradebookPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const gradeData = [
    { id: 1, course: "Quantum Mechanics", instructor: "Dr. Sarah Khan", credit: 4, score: 88, grade: "A", status: "Completed" },
    { id: 2, course: "Advanced Python", instructor: "Prof. Ahmed", credit: 3, score: 72, grade: "B+", status: "Completed" },
    { id: 3, course: "Machine Learning", instructor: "Dr. Emily Blunt", credit: 4, score: 65, grade: "B-", status: "In Progress" },
    { id: 4, course: "Data Structures", instructor: "Prof. John Doe", credit: 3, score: 55, grade: "C", status: "Completed" },
    { id: 5, course: "Discrete Math", instructor: "Dr. Zaid", credit: 3, score: 42, grade: "F", status: "Completed" },
  ];

  // Logic: Green > 80, Orange > 70, Yellow-Orange > 60, Yellow > 50, Red < 50
  const getProgressColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Green (Success)
    if (score >= 70) return "#f59e0b"; // Orange (Warning)
    if (score >= 60) return "#fb923c"; // Yellow-Orange (Cool Mix)
    if (score >= 50) return "#eab308"; // Yellow (Average)
    return "#ef4444";                 // Red (Danger)
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* BANNER SECTION */}
        <div className="dashboard-banner grade-banner">
          <div>
            <h2 style={{ margin: 0, fontSize: '2.2rem' }}>Academic Gradebook</h2>
            <p style={{ opacity: 0.9 }}>Track your performance and academic standing across all courses.</p>
          </div>
          <div className="gpa-badge">
            <span className="gpa-label">CURRENT GPA</span>
            <span className="gpa-value">3.85</span>
          </div>
          <Trophy size={160} className="banner-icon-bg" />
        </div>

        {/* STATS BOXES SECTION */}
        <div className="stats-grid">
          {[
            { label: 'TOTAL COURSES', val: '5', icon: <BookOpen />, color: '#4f46e5' },
            { label: 'COMPLETED', val: '4', icon: <ClipboardCheck />, color: '#10b981' },
            { label: 'QUIZZES', val: '12/15', icon: <LayoutGrid />, color: '#8b5cf6' }, // Updated box
            { label: 'ASSIGNMENTS', val: '24/28', icon: <FileText />, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="stat-item-card">
              <div style={{ color: s.color, background: `${s.color}15`, padding: '10px', borderRadius: '12px' }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{s.label}</p>
                <h3 style={{ margin: 0 }}>{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE FILTERS */}
        <div className="grade-filters">
          <div className="search-box-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by course or instructor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="download-report-btn">
            <Download size={18} /> Download Transcript
          </button>
        </div>

        {/* GRADE DETAILS TABLE */}
        <div className="grade-table-container">
          <table className="grade-table">
            <thead>
              <tr>
                <th>COURSE NAME</th>
                <th>INSTRUCTOR</th>
                <th>CREDITS</th>
                <th>SCORE</th>
                <th>GRADE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {gradeData.filter(g => g.course.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <tr key={item.id}>
                  <td><div style={{ fontWeight: 'bold' }}>{item.course}</div></td>
                  <td>{item.instructor}</td>
                  <td>{item.credit}</td>
                  <td>
                    <div className="score-cell">
                      <span style={{ fontWeight: 'bold' }}>{item.score}%</span>
                      <div className="score-mini-bar">
                        <div 
                          className="score-fill" 
                          style={{ 
                            width: `${item.score}%`, 
                            backgroundColor: getProgressColor(item.score) 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="grade-chip" style={{ 
                        color: getProgressColor(item.score), 
                        backgroundColor: `${getProgressColor(item.score)}15` 
                    }}>
                      {item.grade}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default StudentGradebookPage;
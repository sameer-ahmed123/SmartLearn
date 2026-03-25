import { useState, useEffect } from "react";
import { 
  Trophy, BookOpen, FileText, LayoutGrid, 
  ClipboardCheck, Search, Download 
} from "lucide-react";
import "./StudentGradebook.css";
import apiClient from '@/api/apiClient'; 

const StudentGradebookPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeData, setGradeData] = useState([]);
  const [stats, setStats] = useState({
    gpa: "0.00",
    total_courses: 0,
    completed_courses: 0,
    quizzes_done: 0,
    assignments_done: 0
  });
  const [loading, setLoading] = useState(true);

  // --- Backend se aane wale scores ko process karne ka logic ---
  const calculateTotalScore = (item) => {
    if (item?.score !== undefined) return item.score;
    const assignments = item?.assignments_marks || 0;
    const quizzes = item?.quizzes_marks || 0;
    const exam = item?.exam_marks || 0;
    return (assignments + quizzes + exam) / 3;
  };

  const getGradeInfo = (percentage) => {
    if (percentage >= 85) return "A";
    if (percentage >= 75) return "B+";
    if (percentage >= 65) return "B-";
    if (percentage >= 50) return "C";
    return "F";
  };

  useEffect(() => {
    const fetchGradebook = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/dashboard/student/gradebook-summary/');
        const data = response.data;
        console.log(data)
        
        setGradeData(data.courses || []);
        setStats(data.stats);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGradebook();
  }, []);

  const getProgressColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 80) return "#10b981"; 
    if (s >= 70) return "#f59e0b"; 
    if (s >= 60) return "#fb923c"; 
    if (s >= 50) return "#eab308"; 
    return "#ef4444";
  };

  // --- Download Transcript Functionality ---
  const handleDownloadTranscript = () => {
    if (gradeData.length === 0) {
      alert("Koi data available nahi hai download karne ke liye.");
      return;
    }

    const headers = ["Course Name", "Instructor", "Assignments (%)", "Quizzes (%)", "Overall Score (%)", "Grade", "Status"];
    
    const rows = gradeData.map(item => {
      const score = calculateTotalScore(item);
      return [
        `"${item?.course || 'N/A'}"`,
        `"${item?.instructor || 'N/A'}"`,
        `${item?.assignments_marks || 0}`,
        `${item?.quizzes_marks || 0}`,
        `${score.toFixed(1)}`,
        `"${item?.grade || getGradeInfo(score)}"`,
        `"${item?.status || 'Pending'}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Transcript.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="loading-state">Gradebook load ho raha hai...</div>;

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div className="dashboard-banner grade-banner">
          <div>
            <h2 style={{ margin: 0, fontSize: '2.2rem' }}>Academic Gradebook</h2>
            <p style={{ opacity: 0.9 }}>Tracking your progress through Quizzes and Assignments.</p>
          </div>
          <div className="gpa-badge">
            <span className="gpa-label">OVERALL GPA</span>
            <span className="gpa-value">{stats?.gpa || "0.00"}</span>
          </div>
          <Trophy size={160} className="banner-icon-bg" />
        </div>

        <div className="stats-grid">
          {[
            { label: 'COURSES', val: stats?.total_courses || 0, icon: <BookOpen />, color: '#4f46e5' },
            { label: 'COMPLETED', val: stats?.completed_courses || 0, icon: <ClipboardCheck />, color: '#10b981' },
            { label: 'QUIZZES DONE', val: stats?.quizzes_done || 0, icon: <LayoutGrid />, color: '#8b5cf6' },
            { label: 'ASSIGNMENTS DONE', val: stats?.assignments_done || 0, icon: <FileText />, color: '#f59e0b' },
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

        <div className="grade-filters">
          <div className="search-box-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="download-report-btn" onClick={handleDownloadTranscript}>
            <Download size={18} /> Download Transcript
          </button>
        </div>

        <div className="grade-table-container">
          <table className="grade-table">
            <thead>
              <tr>
                <th>COURSE NAME</th>
                <th>INSTRUCTOR</th>
                <th>ASG %</th>
                <th>QUIZ %</th>
                <th>OVERALL AVG</th>
                <th>GRADE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {gradeData
                .filter(g => g?.course?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, idx) => {
                  const finalScore = calculateTotalScore(item);
                  const finalGrade = item?.grade || getGradeInfo(finalScore);

                  return (
                    <tr key={idx}>
                      <td><strong>{item?.course || "N/A"}</strong></td>
                      <td>{item?.instructor || "Instructor"}</td>
                      <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item?.assignments_marks || 0}%</td>
                      <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item?.quizzes_marks || 0}%</td>
                      <td>
                        <div className="score-cell">
                          <span>{finalScore.toFixed(1)}%</span>
                          <div className="score-mini-bar">
                            <div 
                              className="score-fill" 
                              style={{ 
                                width: `${finalScore}%`, 
                                backgroundColor: getProgressColor(finalScore) 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="grade-chip" style={{ 
                            color: getProgressColor(finalScore), 
                            backgroundColor: `${getProgressColor(finalScore)}15` 
                        }}>
                          {finalGrade}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${item?.status?.toLowerCase()}`}>
                          {item?.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {gradeData.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>Koi data maujood nahi hai.</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentGradebookPage;
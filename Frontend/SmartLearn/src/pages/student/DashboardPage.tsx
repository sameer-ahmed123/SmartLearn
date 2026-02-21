import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const StudentDashboardPage = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Backend API Call
        const response = await apiClient.get('/dashboard/metrics/');
        setMetrics(response.data.metrics);
      } catch (error) {
        console.error("Error fetching student metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="p-10">Fetching your progress...</div>;

  return (
    <div className="dashboard-container p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome Back, {metrics?.full_name || "Student"}!
        </h1>
        <p className="text-slate-500">Here's what's happening with your learning today.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 uppercase font-semibold">Current Streak</p>
          <h2 className="text-3xl font-bold text-orange-500">{metrics?.current_streak} Days 🔥</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 uppercase font-semibold">Average Grade</p>
          <h2 className="text-3xl font-bold text-blue-600">{metrics?.average_grade}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 uppercase font-semibold">Enrolled Courses</p>
          <h2 className="text-3xl font-bold text-green-600">{metrics?.enrolled_courses}</h2>
        </div>
      </div>

      {/* AI Study Buddy Shortcut */}
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h3 className="text-indigo-900 font-bold mb-2">🤖 AI Study Buddy Tip</h3>
        <p className="text-indigo-700">You have {metrics?.pending_assignments} assignments pending. Focus on Mathematics today!</p>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
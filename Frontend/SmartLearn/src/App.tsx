import { Routes, Route,  } from 'react-router-dom';
import MainAppLayout from './components/Layout/MainLayout';
const App: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<MainAppLayout>a</MainAppLayout> } />
      {/* <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} /> */}

      {/* AUTHENTICATED/PROTECTED ROUTES */}
      {/* <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
       */}
      {/* Add all other protected routes here */}
      {/* <Route path="/classroom/:id" element={<ProtectedRoute><VirtualClassroomPage /></ProtectedRoute>} /> */}
    </Routes>
  );
};

export default App;
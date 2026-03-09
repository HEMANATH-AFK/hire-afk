import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobsPage from './pages/JobsPage';
import InterviewPrep from './pages/InterviewPrep';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f172a] text-slate-900 dark:text-[#f8fafc] transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private Routes */}
                <Route path="/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
                <Route path="/student/*" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
                <Route path="/recruiter/*" element={<PrivateRoute role="recruiter"><RecruiterDashboard /></PrivateRoute>} />
                <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/interview-prep/:jobId" element={<PrivateRoute role="student"><InterviewPrep /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

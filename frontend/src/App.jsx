import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import PlacementDrives from './pages/student/PlacementDrives';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import SkillGapAnalysis from './pages/student/SkillGapAnalysis';
import MockTests from './pages/student/MockTests';
import TakeTest from './pages/student/TakeTest';
import InterviewPrep from './pages/student/InterviewPrep';
import MyApplications from './pages/student/MyApplications';
import Notifications from './pages/student/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCompanies from './pages/admin/Companies';
import AdminDrives from './pages/admin/Drives';
import AdminReports from './pages/admin/Reports';
import AdminQuestions from './pages/admin/Questions';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterDrives from './pages/recruiter/Drives';
import DriveApplications from './pages/recruiter/DriveApplications';

// Layout
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex align-items-center justify-content-center min-vh-100">
    <div className="loading-spinner"></div>
  </div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="drives" element={<PlacementDrives />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="skill-gap" element={<SkillGapAnalysis />} />
        <Route path="tests" element={<MockTests />} />
        <Route path="tests/:id" element={<TakeTest />} />
        <Route path="interview-prep" element={<InterviewPrep />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="drives/:id/applications" element={<DriveApplications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="questions" element={<AdminQuestions />} />
      </Route>

      {/* Recruiter Routes */}
      <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="drives" element={<RecruiterDrives />} />
        <Route path="drives/:id/applications" element={<DriveApplications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2235',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '0.875rem'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

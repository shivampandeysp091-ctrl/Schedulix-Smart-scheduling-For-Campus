// src/App.jsx - CORRECTED
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; 

// --- Import ALL Your Pages ---
import Layout from './Layout'; 
import AuthPage from './pages/AuthPage'; 
import Dashboard from './pages/Dashboard';
import FacultyDashboard from './pages/FacultyDashboard'; 
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import Availability from './pages/Availability';
import Schedule from './pages/Schedule';
import ProfilePage from './pages/ProfilePage';       // Faculty Profile
import StudentProfile from './pages/StudentProfile'; // Student Profile
import CreateAnnouncementPage from './pages/CreateAnnouncementPage'; 
import AllAnnouncementsPage from './pages/AllAnnouncementsPage';
import StudentMeetingsPage from './pages/StudentMeetingsPage'; 
import FacultyMeetingsPage from './pages/FacultyMeetingsPage';
import UploadTimetablePage from './pages/UploadTimetablePage';

// Import your main CSS
import './App.css'; 

// --- HELPER COMPONENTS (DEFINED FIRST) ---

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth(); 
    if (loading) return <div>Loading session...</div>; 
    if (!token) return <Navigate to="/auth" replace />; 
    return children;
};

const PublicRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div>Loading session...</div>; 
    return !token ? children : <Navigate to="/" replace />;
};

const FacultyOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>; 
    return user.role === 'ROLE_FACULTY' ? children : <Navigate to="/" replace />;
};

const StudentOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>; 
    return user.role === 'ROLE_STUDENT' ? children : <Navigate to="/" replace />;
};

const AdminOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>; 
    return user.role === 'ROLE_ADMIN' ? children : <Navigate to="/" replace />;
};

const SuperadminOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>; 
    return user.role === 'ROLE_SUPERADMIN' ? children : <Navigate to="/" replace />;
};

function DashboardDecider() {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading dashboard...</div>;
    if (user.role === 'ROLE_SUPERADMIN') return <SuperadminDashboard />;
    if (user.role === 'ROLE_ADMIN') return <AdminDashboard />;
    if (user.role === 'ROLE_FACULTY') return <FacultyDashboard />;
    if (user.role === 'ROLE_STUDENT') return <Dashboard />;
    return <div>Unknown user role.</div>;
}

function ProfileDecider() {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading profile...</div>;
    if (user.role === 'ROLE_FACULTY') return <ProfilePage />; 
    if (user.role === 'ROLE_STUDENT') return <StudentProfile />; 
    return <Navigate to="/" replace />;
}

// --- MAIN APP COMPONENT ---
// This now comes AFTER all the helper components are defined.
function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Route --- */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* --- Protected Routes (Inside Layout) --- */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>} >
          <Route path="/" element={<DashboardDecider />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/announcements" element={<AllAnnouncementsPage />} />
          <Route path="/profile" element={<ProfileDecider />} /> 

          {/* --- Student-Only Routes --- */}
          <Route path="/schedule" element={<StudentOnlyRoute><Schedule /></StudentOnlyRoute>} />
          <Route path="/student/meetings" element={<StudentOnlyRoute><StudentMeetingsPage /></StudentOnlyRoute>} />
          
          {/* --- Faculty-Only Routes --- */}
          <Route path="/announcements/new" element={<FacultyOnlyRoute><CreateAnnouncementPage /></FacultyOnlyRoute>} />
          <Route path="/faculty/meetings" element={<FacultyOnlyRoute><FacultyMeetingsPage/></FacultyOnlyRoute>} />
          <Route path="/faculty/timetable/upload" element={<FacultyOnlyRoute><UploadTimetablePage/></FacultyOnlyRoute>} />

          {/* --- Admin-Only Routes --- */}
          <Route path="/admin/dashboard" element={<AdminOnlyRoute><AdminDashboard/></AdminOnlyRoute>} />

          {/* --- Superadmin-Only Routes --- */}
          <Route path="/superadmin/dashboard" element={<SuperadminOnlyRoute><SuperadminDashboard/></SuperadminOnlyRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
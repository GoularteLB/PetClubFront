import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login/Login';
import PetManagement from './pages/PetManagement/PetManagement';
import TutorRegistration from './pages/TutorRegistration/TutorRegistration';
import TutorManagement from './pages/TutorManagement/TutorManagement';
import { authService } from './services/authService';

const ProtectedRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<TutorRegistration />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/pets" element={<PetManagement />} />
          <Route path="/tutors" element={<TutorManagement />} />
          <Route path="/tutors/new" element={<TutorRegistration />} />
          <Route path="/tutors/edit/:id" element={<TutorRegistration />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

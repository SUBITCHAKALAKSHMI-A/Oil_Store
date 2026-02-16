import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole && 
      !(requiredRole === 'admin' && (userRole === 'admin' || userRole === 'superadmin'))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

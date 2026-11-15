import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading } from './ui.jsx';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <div className="alert alert-error">No tiene permisos para acceder a esta seccion.</div>
      </div>
    );
  }
  return children;
}

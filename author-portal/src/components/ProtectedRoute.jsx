import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
export default function ProtectedRoute({ role }) {
  const { user } = useSelector(s => s.auth);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/author'} replace/>;
  return <Outlet/>;
}
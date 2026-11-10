import { Navigate } from 'react-router-dom';
import { isAdminAuthed } from '../../lib/store';

export function RequireAdmin({ children }) {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

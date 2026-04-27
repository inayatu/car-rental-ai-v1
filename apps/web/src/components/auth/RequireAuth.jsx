import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PATH } from "../../lib/paths.js";

/**
 * Renders `children` only if the user is signed in; otherwise redirects to login with return path.
 */
export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={PATH.login} state={{ from: location }} replace />;
  }

  return children;
}

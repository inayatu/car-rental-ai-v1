import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PATH } from "../../lib/paths.js";

/**
 * @param {{ allow: (user: { role?: string } | null) => boolean, children: import("react").ReactNode }} props
 */
export function RequireRole({ allow, children }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status !== "ready" || !user) {
    return <Navigate to={PATH.login} state={{ from: location }} replace />;
  }

  if (!allow(user)) {
    return <Navigate to={PATH.home} replace />;
  }

  return children;
}

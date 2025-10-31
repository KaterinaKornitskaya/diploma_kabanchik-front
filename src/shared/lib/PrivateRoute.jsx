// src/shared/lib/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

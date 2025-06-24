import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  return user
    ? children
    : <Navigate to="/" state={{ from: location }} replace />;
}
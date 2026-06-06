import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/useAppData";

const ProtectedRoute = () => {
  const { isAuth, user, loading } = useAppData();

  const location = useLocation();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to={"/login"} replace />;
  }

  if (user?.role === null && location.pathname !== "/select-role") {
    return <Navigate to={"/select-role"} replace />;
  }

  if (user?.role !== null && location.pathname === "/select-role") {
    return <Navigate to={"/explore"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

import { useAppData } from "../context/useAppData";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { isAuth, loading } = useAppData();

  if (loading) return null;

  return isAuth ? <Navigate to="/explore" replace /> : <Outlet />;
};

export default PublicRoute;

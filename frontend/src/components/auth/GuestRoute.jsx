import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { PageSpinner } from "../common/Spinner";

const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default GuestRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant la vérification du token au montage
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e6f4fb]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4DB]" />
      </div>
    );
  }

  // Non connecté → redirect vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
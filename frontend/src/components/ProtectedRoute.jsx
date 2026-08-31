import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return null;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        if (user.role === "retailer") {
            return <Navigate to="/retailer" replace />;
        }

        if (user.role === "rider") {
            return <Navigate to="/rider" replace />;
        }

        if (user.role === "dispatcher") {
            return <Navigate to="/dispatcher" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
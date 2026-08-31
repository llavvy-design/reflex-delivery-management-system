import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Overview from "./pages/Overview";
import Features from "./pages/Features";
import Security from "./pages/Security";

import CreateDelivery from "./pages/CreateDelivery";
import DeliveryDetails from "./pages/DeliveryDetails";
import EditDelivery from "./pages/EditDelivery";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RetailerDashboard from "./pages/RetailerDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";

const Home = () => {
    const {
        user,
        loading,
        isAuthenticated
    } = useAuth();

    if (loading) {
        return (
            <main className="app-loading">
                <p>Loading Reflex...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    if (user.role === "retailer") {
        return <Navigate to="/retailer" replace />;
    }

    if (user.role === "rider") {
        return <Navigate to="/rider" replace />;
    }

    if (user.role === "dispatcher") {
        return <Navigate to="/dispatcher" replace />;
    }

    return <LandingPage />;
};

const App = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/features" element={<Features />} />
            <Route path="/security" element={<Security />} />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* Retailer */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["retailer"]}
                    />
                }
            >
                <Route
                    path="/retailer"
                    element={<RetailerDashboard />}
                />

                <Route
                    path="/retailer/deliveries/new"
                    element={<CreateDelivery />}
                />

                <Route
                    path="/retailer/deliveries/:id"
                    element={<DeliveryDetails />}
                />

                <Route
                    path="/retailer/deliveries/:id/edit"
                    element={<EditDelivery />}
                />
            </Route>

            {/* Rider */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["rider"]}
                    />
                }
            >
                <Route
                    path="/rider"
                    element={<RiderDashboard />}
                />

                <Route
                    path="/rider/deliveries/:id"
                    element={<DeliveryDetails />}
                />
            </Route>

            {/* Dispatcher */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["dispatcher"]}
                    />
                }
            >
                <Route
                    path="/dispatcher"
                    element={<DispatcherDashboard />}
                />

                <Route
                    path="/dispatcher/deliveries/:id"
                    element={<DeliveryDetails />}
                />
            </Route>

            {/* Unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

export default App;
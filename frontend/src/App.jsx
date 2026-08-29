import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CreateDelivery from "./pages/CreateDelivery";
import DeliveryDetails from "./pages/DeliveryDetails";
import EditDelivery from "./pages/EditDelivery";
import Login from "./pages/Login";
import RetailerDashboard from "./pages/RetailerDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
const Home = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
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

    return (
        <main>
            <h1>Reflex</h1>
            <p>Welcome, {user.name}.</p>
            <p>Role: {user.role}</p>
        </main>
    );
};

const App = () => {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Retailer */}
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

            {/* Rider */}
            <Route
                path="/rider"
                element={<RiderDashboard />}
            />

            {/* Dispatcher */}
<Route
    path="/dispatcher"
    element={<DispatcherDashboard />}
/>

            {/* Home / role redirect */}
            <Route
                path="/"
                element={<Home />}
            />

            {/* Unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

export default App;
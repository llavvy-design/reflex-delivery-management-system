import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CreateDelivery from "./pages/CreateDelivery";

import Login from "./pages/Login";
import RetailerDashboard from "./pages/RetailerDashboard";

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "retailer") {
        return <Navigate to="/retailer" replace />;
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

            <Route
                path="/retailer"
                element={<RetailerDashboard />}
            />

            <Route
                path="/retailer/deliveries/new"
                element={<CreateDelivery />}
            />


            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

export default App;

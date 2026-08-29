import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
    connectSocket,
    disconnectSocket
} from "../sockets/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("reflex_token");
        const storedUser = localStorage.getItem("reflex_user");

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("reflex_token");
                localStorage.removeItem("reflex_user");
            }
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const { token, user } = response.data;

        localStorage.setItem("reflex_token", token);
localStorage.setItem("reflex_user", JSON.stringify(user));

setUser(user);

connectSocket();

return response.data;
    };

    const logout = () => {
    disconnectSocket();

    localStorage.removeItem("reflex_token");
    localStorage.removeItem("reflex_user");

    setUser(null);
};

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

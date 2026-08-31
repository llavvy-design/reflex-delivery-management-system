import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    connectSocket,
    disconnectSocket
} from "../sockets/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

            useEffect(() => {
        const handleAuthExpired = () => {
             disconnectSocket();

             sessionStorage.removeItem("reflex_token");
             sessionStorage.removeItem("reflex_user");

             setUser(null);

             navigate("/login", { replace: true });
        };

        window.addEventListener(
            "reflex:auth-expired",
            handleAuthExpired
        );

        const restoreSession = async () => {
            const token = sessionStorage.getItem("reflex_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                const authenticatedUser = response.data.user;

                sessionStorage.setItem(
                    "reflex_user",
                    JSON.stringify(authenticatedUser)
                );

                setUser(authenticatedUser);

                connectSocket();
            } catch {
                disconnectSocket();

                sessionStorage.removeItem("reflex_token");
                sessionStorage.removeItem("reflex_user");

                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();

        return () => {
            window.removeEventListener(
                "reflex:auth-expired",
                handleAuthExpired
            );
        };
    }, []);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const { token, user } = response.data;

        sessionStorage.setItem("reflex_token", token);
sessionStorage.setItem("reflex_user", JSON.stringify(user));
setUser(user);

connectSocket();

return response.data;
    };

    const logout = () => {
    disconnectSocket();

    sessionStorage.removeItem("reflex_token");
sessionStorage.removeItem("reflex_user");
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

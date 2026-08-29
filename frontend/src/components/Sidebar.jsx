import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const [collapsed, setCollapsed] = useState(false);

    const menuItems = {
        retailer: [
            {
                label: "Dashboard",
                path: "/retailer",
                icon: "⌂"
            },
            {
                label: "New delivery",
                path: "/retailer/deliveries/new",
                icon: "+"
            }
        ],
        dispatcher: [
            {
                label: "Dashboard",
                path: "/dispatcher",
                icon: "⌂"
            }
        ],
        rider: [
            {
                label: "Dashboard",
                path: "/rider",
                icon: "⌂"
            }
        ]
    };

    const subtitles = {
        retailer: "Delivery management",
        dispatcher: "Delivery operations",
        rider: "Rider workspace"
    };

    const items = menuItems[role] || [];

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside
            className={`dashboard-sidebar ${
                collapsed ? "dashboard-sidebar-collapsed" : ""
            }`}
        >
            <div className="dashboard-brand">
                <div className="dashboard-brand-row">
                    <p className="dashboard-brand-name">
                        {collapsed ? "R" : "REFLEX"}
                    </p>

                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() =>
                            setCollapsed((current) => !current)
                        }
                        aria-label={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        {collapsed ? "»" : "«"}
                    </button>
                </div>

                {!collapsed && (
                    <p className="dashboard-brand-subtitle">
                        {subtitles[role]}
                    </p>
                )}
            </div>

            <nav
                className="dashboard-nav"
                aria-label="Primary navigation"
            >
                {items.map((item) => {
                    const active =
                        location.pathname === item.path ||
                        (
                            item.path !== "/retailer" &&
                            location.pathname.startsWith(item.path)
                        );

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={
                                active ? "active" : ""
                            }
                            title={
                                collapsed
                                    ? item.label
                                    : undefined
                            }
                        >
                            <span
                                className="sidebar-nav-icon"
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>

                            {!collapsed && (
                                <span>
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="dashboard-sidebar-footer">
                <button
                    type="button"
                    className="secondary-button sidebar-signout"
                    onClick={handleLogout}
                    title={
                        collapsed
                            ? "Sign out"
                            : undefined
                    }
                >
                    <span
                        className="sidebar-nav-icon"
                        aria-hidden="true"
                    >
                        ⇥
                    </span>

                    {!collapsed && (
                        <span>Sign out</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
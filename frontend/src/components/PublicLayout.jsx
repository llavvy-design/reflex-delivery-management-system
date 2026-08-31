import { Link, NavLink } from "react-router-dom";

const PublicLayout = ({ children }) => {
    return (
        <div className="public-shell">
            <header className="public-nav">
                <Link to="/" className="public-brand">
                    <span className="public-brand-mark">R</span>

                    <span className="public-brand-text">
                        <strong>Reflex</strong>
                        <small>Delivery Management</small>
                    </span>
                </Link>

                <nav className="public-navigation">
                    <NavLink
                        to="/overview"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Overview
                    </NavLink>

                    <NavLink
                        to="/features"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Features
                    </NavLink>

                    <NavLink
                        to="/security"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Security
                    </NavLink>
                </nav>

                <div className="public-nav-actions">
                    <Link
                        to="/login"
                        className="public-login-link"
                    >
                        Log in
                    </Link>

                    <Link
                        to="/register"
                        className="public-nav-button"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            <div className="public-content">
                {children}
            </div>

            <footer className="public-footer">
                <div>
                    <strong>Reflex</strong>

                    <span>
                        Connecting the delivery workflow from
                        creation to confirmation.
                    </span>
                </div>

                <div className="public-footer-links">
                    <Link to="/overview">Overview</Link>
                    <Link to="/features">Features</Link>
                    <Link to="/security">Security</Link>
                    <Link to="/login">Log in</Link>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
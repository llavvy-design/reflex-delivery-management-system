import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDeliveries,
    cancelDelivery
} from "../services/deliveryService";

const getInitials = (name = "") => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
};

const getStatusClass = (status) => {
    return `status-badge status-${status
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
};

const RetailerDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDeliveries = async () => {
        try {
            setError("");

            const data = await getDeliveries();

            setDeliveries(data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load deliveries."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDeliveries();
    }, []);

    const counts = useMemo(() => {
        return {
            total: deliveries.length,
            pending: deliveries.filter(
                (delivery) => delivery.status === "Pending"
            ).length,
            assigned: deliveries.filter(
                (delivery) => delivery.status === "Assigned"
            ).length,
            pickedUp: deliveries.filter(
                (delivery) => delivery.status === "Picked Up"
            ).length,
            delivered: deliveries.filter(
                (delivery) => delivery.status === "Delivered"
            ).length,
            cancelled: deliveries.filter(
                (delivery) => delivery.status === "Cancelled"
            ).length
        };
    }, [deliveries]);

    const handleCancel = async (deliveryId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this delivery?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await cancelDelivery(deliveryId);

            await loadDeliveries();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to cancel delivery."
            );
        }
    };

    if (loading) {
        return (
            <main className="auth-page">
                <section className="auth-card">
                    <p className="eyebrow">REFLEX</p>
                    <h1>Loading dashboard...</h1>
                    <p>
                        We're getting your delivery information ready.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    <p className="dashboard-brand-name">
                        REFLEX
                    </p>

                    <p className="dashboard-brand-subtitle">
                        Delivery management
                    </p>
                </div>

                <nav className="dashboard-nav">
                    <a
                        href="/retailer"
                        className="active"
                        onClick={(event) => {
                            event.preventDefault();
                            navigate("/retailer");
                        }}
                    >
                        Dashboard
                    </a>

                    <a
                        href="/retailer/deliveries/new"
                        onClick={(event) => {
                            event.preventDefault();
                            navigate("/retailer/deliveries/new");
                        }}
                    >
                        New delivery
                    </a>
                </nav>

                <div className="dashboard-sidebar-footer">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={logout}
                        style={{ width: "100%" }}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="dashboard-heading">
                        <h1>
                            Good to see you,{" "}
                            {user?.name?.split(" ")[0] || "there"}.
                        </h1>

                        <p>
                            Here's what's happening with your
                            deliveries.
                        </p>
                    </div>

                    <div className="user-menu">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name}</strong>
                            <span>Retailer</span>
                        </div>
                    </div>
                </header>

                {error && (
                    <div
                        className="dashboard-alert"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <h2>Overview</h2>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <article className="stat-card">
                            <strong>{counts.total}</strong>
                            <span>Total deliveries</span>
                        </article>

                        <article className="stat-card">
                            <strong>{counts.pending}</strong>
                            <span>Pending</span>
                        </article>

                        <article className="stat-card">
                            <strong>{counts.assigned}</strong>
                            <span>Assigned</span>
                        </article>

                        <article className="stat-card">
                            <strong>{counts.pickedUp}</strong>
                            <span>Picked up</span>
                        </article>

                        <article className="stat-card">
                            <strong>{counts.delivered}</strong>
                            <span>Delivered</span>
                        </article>

                        <article className="stat-card">
                            <strong>{counts.cancelled}</strong>
                            <span>Cancelled</span>
                        </article>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <h2>Your deliveries</h2>
                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            style={{ width: "auto" }}
                            onClick={() =>
                                navigate("/retailer/deliveries/new")
                            }
                        >
                            + New delivery
                        </button>
                    </div>

                    {deliveries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                +
                            </div>

                            <h3>No deliveries yet</h3>

                            <p>
                                Create your first delivery to start
                                tracking it with Reflex.
                            </p>
                        </div>
                    ) : (
                        <div className="delivery-list">
                            {deliveries.map((delivery) => (
                                <article
                                    className="delivery-card"
                                    key={delivery.id}
                                >
                                    <div className="delivery-card-header">
                                        <div>
                                            <p className="delivery-field-label">
                                                Delivery
                                            </p>

                                            <button
                                                type="button"
                                                className="delivery-card-link"
                                                onClick={() =>
                                                    navigate(`/retailer/deliveries/${delivery.id}`)
                                                }
                                            >
                                                    #{delivery.id}
                                            </button>

                                        </div>

                                        <span
                                            className={getStatusClass(
                                                delivery.status
                                            )}
                                        >
                                            {delivery.status}
                                        </span>
                                    </div>

                                    <div className="delivery-card-meta">
                                        <div>
                                            <span className="delivery-field-label">
                                                Customer
                                            </span>

                                            <span className="delivery-field-value">
                                                {
                                                    delivery.customer_name
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="delivery-field-label">
                                                Phone
                                            </span>

                                            <span className="delivery-field-value">
                                                {
                                                    delivery.customer_phone
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="delivery-field-label">
                                                Delivery address
                                            </span>

                                            <span className="delivery-field-value">
                                                {
                                                    delivery.delivery_address
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="delivery-field-label">
                                                Item
                                            </span>

                                            <span className="delivery-field-value">
                                                {
                                                    delivery.item_description
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {(delivery.status === "Pending" ||
                                        delivery.status === "Assigned") && (
                                        <div className="delivery-card-actions">
                                            <button
                                                type="button"
                                                className="danger-button"
                                                onClick={() =>
                                                    handleCancel(
                                                        delivery.id
                                                    )
                                                }
                                            >
                                                Cancel delivery
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default RetailerDashboard;

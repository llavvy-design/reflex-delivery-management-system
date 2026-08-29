import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDeliveries,
    updateDeliveryStatus
} from "../services/deliveryService";
import socket from "../sockets/socket";
import Sidebar from "../components/Sidebar";

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

const RiderDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    const loadDeliveries = async () => {
        try {
            setError("");

            const data = await getDeliveries();

            setDeliveries(data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load your deliveries."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDeliveries();
    }, []);

    useEffect(() => {
        const handleDeliveryAssigned = ({ delivery }) => {
            console.log(
                "REAL-TIME rider delivery:assigned received:",
                delivery
            );

            setDeliveries((currentDeliveries) => {
                const alreadyExists = currentDeliveries.some(
                    (currentDelivery) =>
                        currentDelivery.id === delivery.id
                );

                if (alreadyExists) {
                    return currentDeliveries.map(
                        (currentDelivery) =>
                            currentDelivery.id === delivery.id
                                ? delivery
                                : currentDelivery
                    );
                }

                return [delivery, ...currentDeliveries];
            });
        };

        const handleDeliveryStatusUpdated = ({ delivery }) => {
            console.log(
                "REAL-TIME rider delivery:status_updated received:",
                delivery
            );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((currentDelivery) =>
                    currentDelivery.id === delivery.id
                        ? delivery
                        : currentDelivery
                )
            );
        };

        socket.on(
            "delivery:assigned",
            handleDeliveryAssigned
        );

        socket.on(
            "delivery:status_updated",
            handleDeliveryStatusUpdated
        );

        return () => {
            socket.off(
                "delivery:assigned",
                handleDeliveryAssigned
            );

            socket.off(
                "delivery:status_updated",
                handleDeliveryStatusUpdated
            );
        };
    }, []);

    const counts = useMemo(() => {
        return {
            total: deliveries.length,
            assigned: deliveries.filter(
                (delivery) => delivery.status === "Assigned"
            ).length,
            pickedUp: deliveries.filter(
                (delivery) => delivery.status === "Picked Up"
            ).length,
            delivered: deliveries.filter(
                (delivery) => delivery.status === "Delivered"
            ).length
        };
    }, [deliveries]);

    const handleStatusUpdate = async (
        deliveryId,
        newStatus
    ) => {
        try {
            setError("");
            setUpdatingId(deliveryId);

            const updatedDelivery =
                await updateDeliveryStatus(
                    deliveryId,
                    newStatus
                );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((delivery) =>
                    delivery.id === updatedDelivery.id
                        ? updatedDelivery
                        : delivery
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update delivery status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <main className="auth-page">
                <section className="auth-card">
                    <p className="eyebrow">REFLEX</p>

                    <h1>Loading dashboard...</h1>

                    <p>
                        We're getting your assigned deliveries ready.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar role="rider" />

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="dashboard-heading">
                        <h1>
                            Good to see you,{" "}
                            {user?.name?.split(" ")[0] || "there"}.
                        </h1>

                        <p>
                            Here are the deliveries assigned to you.
                        </p>
                    </div>

                    <div className="user-menu">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name}</strong>
                            <span>Rider</span>
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
                            <span>Total assigned</span>
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
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <h2>My deliveries</h2>
                        </div>
                    </div>

                    {deliveries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                +
                            </div>

                            <h3>No deliveries assigned</h3>

                            <p>
                                New deliveries assigned to you will
                                appear here automatically.
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
                                                    navigate(
                                                        `/rider/deliveries/${delivery.id}`
                                                    )
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

                                    <div className="delivery-card-actions">
                                        {delivery.status ===
                                            "Assigned" && (
                                            <button
                                                type="button"
                                                className="primary-button"
                                                style={{
                                                    width: "auto"
                                                }}
                                                disabled={
                                                    updatingId ===
                                                    delivery.id
                                                }
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        delivery.id,
                                                        "Picked Up"
                                                    )
                                                }
                                            >
                                                {updatingId ===
                                                delivery.id
                                                    ? "Updating..."
                                                    : "Mark as picked up"}
                                            </button>
                                        )}

                                        {delivery.status ===
                                            "Picked Up" && (
                                            <button
                                                type="button"
                                                className="primary-button"
                                                style={{
                                                    width: "auto"
                                                }}
                                                disabled={
                                                    updatingId ===
                                                    delivery.id
                                                }
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        delivery.id,
                                                        "Delivered"
                                                    )
                                                }
                                            >
                                                {updatingId ===
                                                delivery.id
                                                    ? "Updating..."
                                                    : "Mark as delivered"}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default RiderDashboard;
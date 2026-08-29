import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDeliveries,
    cancelDelivery
} from "../services/deliveryService";
import socket, {
    connectSocket,
    disconnectSocket
} from "../sockets/socket";
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

const RetailerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

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

    useEffect(() => {
    const handleDeliveryAssigned = ({ delivery }) => {
        console.log(
            "REAL-TIME delivery:assigned received:",
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

    const handleDeliveryStatusUpdated = ({ delivery }) => {
        console.log(
            "REAL-TIME delivery:status_updated received:",
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

    connectSocket();

    return () => {
        socket.off(
            "delivery:assigned",
            handleDeliveryAssigned
        );

        socket.off(
            "delivery:status_updated",
            handleDeliveryStatusUpdated
        );

        disconnectSocket();
    };
}, []);

    const filteredDeliveries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return deliveries.filter((delivery) => {
        const matchesSearch =
            !normalizedSearch ||
            String(delivery.id)
                .toLowerCase()
                .includes(normalizedSearch) ||
            delivery.customer_name
                ?.toLowerCase()
                .includes(normalizedSearch) ||
            delivery.customer_phone
                ?.toLowerCase()
                .includes(normalizedSearch) ||
            delivery.delivery_address
                ?.toLowerCase()
                .includes(normalizedSearch) ||
            delivery.item_description
                ?.toLowerCase()
                .includes(normalizedSearch);

        const matchesStatus =
            statusFilter === "All" ||
            delivery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
}, [deliveries, searchTerm, statusFilter]);

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
            <Sidebar role="retailer" />
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

                    <div className="delivery-filters">
    <div className="delivery-search">
        <label htmlFor="delivery-search">
            Search deliveries
        </label>

        <input
            id="delivery-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
                setSearchTerm(event.target.value)
            }
            placeholder="Search by customer, ID, phone, address..."
        />
    </div>

    <div className="delivery-status-filter">
        <label htmlFor="status-filter">
            Status
        </label>

        <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
                setStatusFilter(event.target.value)
            }
        >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Picked Up">Picked up</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
        </select>
    </div>
</div>

                    {filteredDeliveries.length === 0 ? (
                        <div className="empty-state">
    <div className="empty-state-icon">
        {deliveries.length === 0 ? "+" : "×"}
    </div>

    <h3>
        {deliveries.length === 0
            ? "No deliveries yet"
            : "No matching deliveries"}
    </h3>

    <p>
        {deliveries.length === 0
            ? "Create your first delivery to start tracking it with Reflex."
            : "Try adjusting your search or status filter."}
    </p>
</div>
                    ) : (
                        <div className="delivery-list">
                            {filteredDeliveries.map((delivery) => (
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
        {delivery.status === "Pending" && (
            <button
                type="button"
                className="secondary-button"
                onClick={() =>
                    navigate(
                        `/retailer/deliveries/${delivery.id}/edit`
                    )
                }
            >
                Edit
            </button>
        )}

        <button
            type="button"
            className="danger-button"
            onClick={() =>
                handleCancel(delivery.id)
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

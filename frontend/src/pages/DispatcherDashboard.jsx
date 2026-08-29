import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDeliveries,
    getDeliveryStats,
    getRiders,
    assignDelivery,
    cancelDelivery
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

const DispatcherDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [deliveries, setDeliveries] = useState([]);
    const [riders, setRiders] = useState([]);
    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [riderFilter, setRiderFilter] = useState("All");
    const [unassignedOnly, setUnassignedOnly] = useState(false);

    const [assigningId, setAssigningId] = useState(null);
    const [selectedRiders, setSelectedRiders] = useState({});

    const loadDashboard = async () => {
        try {
            setError("");

            const [
                deliveryData,
                statsData,
                riderData
            ] = await Promise.all([
                getDeliveries(),
                getDeliveryStats(),
                getRiders()
            ]);

            setDeliveries(deliveryData);
            setStats(statsData);
            setRiders(riderData);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load dispatcher dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        const handleDeliveryCreated = ({ delivery }) => {
            console.log(
                "REAL-TIME dispatcher delivery:created received:",
                delivery
            );

            setDeliveries((currentDeliveries) => {
                const exists = currentDeliveries.some(
                    (currentDelivery) =>
                        currentDelivery.id === delivery.id
                );

                if (exists) {
                    return currentDeliveries;
                }

                return [delivery, ...currentDeliveries];
            });
        };

        const handleDeliveryAssigned = ({ delivery }) => {
            console.log(
                "REAL-TIME dispatcher delivery:assigned received:",
                delivery
            );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((currentDelivery) =>
                    currentDelivery.id === delivery.id
                        ? delivery
                        : currentDelivery
                )
            );

            loadDashboard();
        };

        const handleDeliveryStatusUpdated = ({ delivery }) => {
            console.log(
                "REAL-TIME dispatcher delivery:status_updated received:",
                delivery
            );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((currentDelivery) =>
                    currentDelivery.id === delivery.id
                        ? delivery
                        : currentDelivery
                )
            );

            loadDashboard();
        };

        const handleDeliveryCancelled = ({ delivery }) => {
            console.log(
                "REAL-TIME dispatcher delivery:cancelled received:",
                delivery
            );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((currentDelivery) =>
                    currentDelivery.id === delivery.id
                        ? delivery
                        : currentDelivery
                )
            );

            loadDashboard();
        };

        socket.on(
            "delivery:created",
            handleDeliveryCreated
        );

        socket.on(
            "delivery:assigned",
            handleDeliveryAssigned
        );

        socket.on(
            "delivery:status_updated",
            handleDeliveryStatusUpdated
        );

        socket.on(
            "delivery:cancelled",
            handleDeliveryCancelled
        );

        return () => {
            socket.off(
                "delivery:created",
                handleDeliveryCreated
            );

            socket.off(
                "delivery:assigned",
                handleDeliveryAssigned
            );

            socket.off(
                "delivery:status_updated",
                handleDeliveryStatusUpdated
            );

            socket.off(
                "delivery:cancelled",
                handleDeliveryCancelled
            );
        };
    }, []);

    const filteredDeliveries = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

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

            const matchesRider =
                riderFilter === "All" ||
                String(delivery.assigned_rider_id) ===
                    riderFilter;

            const matchesUnassigned =
                !unassignedOnly ||
                delivery.assigned_rider_id === null;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRider &&
                matchesUnassigned
            );
        });
    }, [
        deliveries,
        searchTerm,
        statusFilter,
        riderFilter,
        unassignedOnly
    ]);

    const handleAssign = async (deliveryId) => {
        const riderId = selectedRiders[deliveryId];

        if (!riderId) {
            setError("Please select a rider first.");
            return;
        }

        try {
            setError("");
            setAssigningId(deliveryId);

            const updatedDelivery =
                await assignDelivery(
                    deliveryId,
                    Number(riderId)
                );

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((delivery) =>
                    delivery.id === updatedDelivery.id
                        ? updatedDelivery
                        : delivery
                )
            );

            await loadDashboard();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to assign delivery."
            );
        } finally {
            setAssigningId(null);
        }
    };

    const handleStatClick = (filter) => {
    if (filter === "Unassigned") {
        setStatusFilter("All");
        setRiderFilter("All");
        setUnassignedOnly(true);
    } else {
        setStatusFilter(filter);
        setRiderFilter("All");
        setUnassignedOnly(false);
    }

    requestAnimationFrame(() => {
        document
            .getElementById("dispatcher-deliveries")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    });
};

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

            await loadDashboard();
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
                        We're getting your delivery operations
                        ready.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar role="dispatcher" />
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="dashboard-heading">
                        <h1>
                            Good to see you,{" "}
                            {user?.name?.split(" ")[0] || "there"}.
                        </h1>

                        <p>
                            Monitor deliveries and manage rider
                            assignments.
                        </p>
                    </div>

                    <div className="user-menu">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name}</strong>
                            <span>Dispatcher</span>
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
                            <h2>Operations overview</h2>
                        </div>
                    </div>

                    <div className="stats-grid">
    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("All")}
    >
        <strong>{stats?.total ?? 0}</strong>
        <span>Total deliveries</span>
    </button>

    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("Pending")}
    >
        <strong>{stats?.pending ?? 0}</strong>
        <span>Pending</span>
    </button>

    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("Assigned")}
    >
        <strong>{stats?.assigned ?? 0}</strong>
        <span>Assigned</span>
    </button>

    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("Picked Up")}
    >
        <strong>{stats?.pickedUp ?? 0}</strong>
        <span>Picked up</span>
    </button>

    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("Delivered")}
    >
        <strong>{stats?.delivered ?? 0}</strong>
        <span>Delivered</span>
    </button>

    <button
        type="button"
        className="stat-card stat-card-button"
        onClick={() => handleStatClick("Unassigned")}
    >
        <strong>{stats?.unassigned ?? 0}</strong>
        <span>Unassigned</span>
    </button>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <h2>Riders</h2>
                        </div>
                    </div>

                    <div className="delivery-list">
                        {riders.map((rider) => (
                            <article
                                className="delivery-card"
                                key={rider.id}
                            >
                                <div className="delivery-card-header">
                                    <div>
                                        <p className="delivery-field-label">
                                            Rider
                                        </p>

                                        <span className="delivery-field-value">
                                            {rider.name}
                                        </span>
                                    </div>

                                    <span
                                        className={`status-badge ${
                                            rider.isAvailable
                                                ? "status-assigned"
                                                : "status-cancelled"
                                        }`}
                                    >
                                        {rider.isAvailable
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>
                                </div>

                                <div className="delivery-card-meta">
                                    <div>
                                        <span className="delivery-field-label">
                                            Phone
                                        </span>

                                        <span className="delivery-field-value">
                                            {rider.phone}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="delivery-field-label">
                                            Active deliveries
                                        </span>

                                        <span className="delivery-field-value">
                                            {rider.activeDeliveries}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section
    className="dashboard-section"
    id="dispatcher-deliveries"
>
                    <div className="section-heading">
                        <div>
                            <h2>All deliveries</h2>
                        </div>
                    </div>

                    <div className="delivery-filters">
                        <div className="delivery-search">
                            <label htmlFor="dispatcher-search">
                                Search deliveries
                            </label>

                            <input
                                id="dispatcher-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by customer, ID, phone, address..."
                            />
                        </div>

                        <div className="delivery-status-filter">
                            <label htmlFor="dispatcher-status">
                                Status
                            </label>

                            <select
                                id="dispatcher-status"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All statuses
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Assigned">
                                    Assigned
                                </option>

                                <option value="Picked Up">
                                    Picked up
                                </option>

                                <option value="Delivered">
                                    Delivered
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>
                        </div>

                        <div className="delivery-status-filter">
                            <label htmlFor="dispatcher-rider">
                                Rider
                            </label>

                            <select
                                id="dispatcher-rider"
                                value={riderFilter}
                                onChange={(event) =>
                                    setRiderFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All riders
                                </option>

                                {riders.map((rider) => (
                                    <option
                                        key={rider.id}
                                        value={rider.id}
                                    >
                                        {rider.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={unassignedOnly}
                                onChange={(event) =>
                                    setUnassignedOnly(
                                        event.target.checked
                                    )
                                }
                            />

                            Unassigned only
                        </label>
                    </div>

                    {filteredDeliveries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                ×
                            </div>

                            <h3>
                                No matching deliveries
                            </h3>

                            <p>
                                Try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="delivery-list">
                            {filteredDeliveries.map(
                                (delivery) => (
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
                                                            `/retailer/deliveries/${delivery.id}`
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
                                                {
                                                    delivery.status
                                                }
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
                                                    Address
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

                                        {delivery.status ===
                                            "Pending" && (
                                            <div className="delivery-card-actions">
                                                <select
                                                    value={
                                                        selectedRiders[
                                                            delivery.id
                                                        ] || ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setSelectedRiders(
                                                            (
                                                                current
                                                            ) => ({
                                                                ...current,
                                                                [delivery.id]:
                                                                    event
                                                                        .target
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select rider
                                                    </option>

                                                    {riders
                                                        .filter(
                                                            (
                                                                rider
                                                            ) =>
                                                                rider.isAvailable
                                                        )
                                                        .map(
                                                            (
                                                                rider
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        rider.id
                                                                    }
                                                                    value={
                                                                        rider.id
                                                                    }
                                                                >
                                                                    {
                                                                        rider.name
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                </select>

                                                <button
                                                    type="button"
                                                    className="primary-button"
                                                    style={{
                                                        width: "auto"
                                                    }}
                                                    disabled={
                                                        assigningId ===
                                                        delivery.id
                                                    }
                                                    onClick={() =>
                                                        handleAssign(
                                                            delivery.id
                                                        )
                                                    }
                                                >
                                                    {assigningId ===
                                                    delivery.id
                                                        ? "Assigning..."
                                                        : "Assign rider"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="danger-button"
                                                    onClick={() =>
                                                        handleCancel(
                                                            delivery.id
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        {delivery.status ===
                                            "Assigned" && (
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
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default DispatcherDashboard;
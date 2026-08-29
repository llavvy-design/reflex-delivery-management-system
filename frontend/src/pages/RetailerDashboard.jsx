import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDeliveries,
    cancelDelivery
} from "../services/deliveryService";


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
        return <main>Loading your deliveries...</main>;
    }

    return (
        <main>
            <header>
                <div>
                    <p>REFLEX</p>

                    <h1>Retailer Dashboard</h1>

                    <p>
                        Welcome, {user?.name}.
                    </p>
                </div>

                <button onClick={logout}>
                    Sign out
                </button>
            </header>

            {error && (
                <div role="alert">
                    {error}
                </div>
            )}

            <section>
                <h2>Overview</h2>

                <div>
                    <article>
                        <strong>{counts.total}</strong>
                        <span>Total</span>
                    </article>

                    <article>
                        <strong>{counts.pending}</strong>
                        <span>Pending</span>
                    </article>

                    <article>
                        <strong>{counts.assigned}</strong>
                        <span>Assigned</span>
                    </article>

                    <article>
                        <strong>{counts.pickedUp}</strong>
                        <span>Picked Up</span>
                    </article>

                    <article>
                        <strong>{counts.delivered}</strong>
                        <span>Delivered</span>
                    </article>

                    <article>
                        <strong>{counts.cancelled}</strong>
                        <span>Cancelled</span>
                    </article>
                </div>
            </section>

            <section>
                <div>
                    <h2>Your Deliveries</h2>

                    <button
                        type="button"
                        onClick={() => navigate("/retailer/deliveries/new")}
>
                        + New Delivery
                        </button>
                </div>

                {deliveries.length === 0 ? (
                    <p>
                        You have not created any deliveries yet.
                    </p>
                ) : (
                    <div>
                        {deliveries.map((delivery) => (
                            <article key={delivery.id}>
                                <div>
                                    <strong>
                                        Delivery #{delivery.id}
                                    </strong>

                                    <span>
                                        {delivery.status}
                                    </span>
                                </div>

                                <p>
                                    Customer:{" "}
                                    {delivery.customer_name}
                                </p>

                                <p>
                                    Phone:{" "}
                                    {delivery.customer_phone}
                                </p>

                                <p>
                                    Address:{" "}
                                    {delivery.delivery_address}
                                </p>

                                <p>
                                    Item:{" "}
                                    {delivery.item_description}
                                </p>

                                {(
                                    delivery.status === "Pending" ||
                                    delivery.status === "Assigned"
                                ) && (
                                    <button
                                        onClick={() =>
                                            handleCancel(
                                                delivery.id
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default RetailerDashboard;

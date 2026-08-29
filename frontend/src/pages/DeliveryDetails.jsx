import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getDelivery,
    getDeliveryHistory,
    getDeliveryConfirmation
} from "../services/deliveryService";

const getStatusClass = (status) => {
    return `status-badge status-${status
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleString();
};

const DeliveryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [delivery, setDelivery] = useState(null);
    const [history, setHistory] = useState([]);
    const [confirmation, setConfirmation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const deliveryData = await getDelivery(id);

                setDelivery(deliveryData);

                const historyData = await getDeliveryHistory(id);
                setHistory(historyData || []);

                try {
                    const confirmationData =
                        await getDeliveryConfirmation(id);

                    setConfirmation(confirmationData);
                } catch {
                    setConfirmation(null);
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load delivery details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [id]);

    if (loading) {
        return (
            <main className="auth-page">
                <section className="auth-card">
                    <p className="eyebrow">REFLEX</p>
                    <h1>Loading delivery...</h1>
                    <p>
                        We're retrieving the delivery information.
                    </p>
                </section>
            </main>
        );
    }

    if (error || !delivery) {
        return (
            <main className="page">
                <section className="form-card">
                    <p className="eyebrow">REFLEX</p>

                    <h1>Delivery not found</h1>

                    <p>
                        {error ||
                            "We could not find this delivery."}
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        style={{
                            width: "auto",
                            marginTop: "24px"
                        }}
                        onClick={() => navigate("/retailer")}
                    >
                        Back to deliveries
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="page">
            <section className="form-card">
                <div className="page-header">
                    <div>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/retailer")}
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            ← Back to deliveries
                        </button>

                        <p className="eyebrow">
                            DELIVERY #{delivery.id}
                        </p>

                        <h1>Delivery details</h1>

                        <p>
                            Track the current progress of this
                            delivery.
                        </p>
                    </div>

                    <span
                        className={getStatusClass(
                            delivery.status
                        )}
                    >
                        {delivery.status}
                    </span>
                </div>

                <div className="delivery-details-grid">
                    <div className="detail-panel">
                        <span className="delivery-field-label">
                            Customer
                        </span>

                        <strong className="detail-value">
                            {delivery.customer_name}
                        </strong>

                        <span className="detail-secondary">
                            {delivery.customer_phone}
                        </span>
                    </div>

                    <div className="detail-panel">
                        <span className="delivery-field-label">
                            Created
                        </span>

                        <strong className="detail-value">
                            {formatDate(delivery.created_at)}
                        </strong>
                    </div>

                    <div className="detail-panel detail-panel-wide">
                        <span className="delivery-field-label">
                            Delivery address
                        </span>

                        <strong className="detail-value">
                            {delivery.delivery_address}
                        </strong>
                    </div>

                    <div className="detail-panel detail-panel-wide">
                        <span className="delivery-field-label">
                            Item description
                        </span>

                        <strong className="detail-value">
                            {delivery.item_description}
                        </strong>
                    </div>
                </div>

                <div className="details-section">
    <div className="section-heading">
        <h2>Delivery timeline</h2>
    </div>

    {delivery.status === "Cancelled" ? (
        <div className="timeline">
            <div className="timeline-item">
                <div className="timeline-dot timeline-dot-complete" />

                <div className="timeline-content">
                    <strong>Delivery created</strong>

                    <p>
                        Your delivery was created successfully.
                    </p>

                    <span>
                        {formatDate(delivery.created_at)}
                    </span>
                </div>
            </div>

            <div className="timeline-item">
                <div className="timeline-dot timeline-dot-current" />

                <div className="timeline-content">
                    <strong>Cancelled</strong>

                    <p>
                        This delivery has been cancelled.
                    </p>

                    {history.length > 0 && (
                        <span>
                            {formatDate(
                                history[history.length - 1]
                                    .changed_at
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div className="timeline">
            <div
                className={`timeline-item ${
                    ["Pending", "Assigned", "Picked Up", "Delivered"]
                        .includes(delivery.status)
                        ? "timeline-item-complete"
                        : ""
                }`}
            >
                <div className="timeline-dot timeline-dot-complete" />

                <div className="timeline-content">
                    <strong>Delivery created</strong>

                    <p>
                        Your delivery request has been created.
                    </p>

                    <span>
                        {formatDate(delivery.created_at)}
                    </span>
                </div>
            </div>

            <div
                className={`timeline-item ${
                    ["Assigned", "Picked Up", "Delivered"]
                        .includes(delivery.status)
                        ? "timeline-item-complete"
                        : ""
                }`}
            >
                <div
                    className={`timeline-dot ${
                        delivery.status === "Assigned"
                            ? "timeline-dot-current"
                            : ["Picked Up", "Delivered"].includes(
                                  delivery.status
                              )
                            ? "timeline-dot-complete"
                            : ""
                    }`}
                />

                <div className="timeline-content">
                    <strong>Assigned</strong>

                    <p>
                        A rider will be assigned to your delivery.
                    </p>

                    {history
                        .filter(
                            (event) =>
                                event.to_status === "Assigned"
                        )
                        .map((event) => (
                            <span key={event.id}>
                                {formatDate(event.changed_at)}
                            </span>
                        ))}
                </div>
            </div>

            <div
                className={`timeline-item ${
                    ["Picked Up", "Delivered"].includes(
                        delivery.status
                    )
                        ? "timeline-item-complete"
                        : ""
                }`}
            >
                <div
                    className={`timeline-dot ${
                        delivery.status === "Picked Up"
                            ? "timeline-dot-current"
                            : delivery.status === "Delivered"
                            ? "timeline-dot-complete"
                            : ""
                    }`}
                />

                <div className="timeline-content">
                    <strong>Picked up</strong>

                    <p>
                        The rider has picked up the delivery.
                    </p>

                    {history
                        .filter(
                            (event) =>
                                event.to_status === "Picked Up"
                        )
                        .map((event) => (
                            <span key={event.id}>
                                {formatDate(event.changed_at)}
                            </span>
                        ))}
                </div>
            </div>

            <div className="timeline-item">
                <div
                    className={`timeline-dot ${
                        delivery.status === "Delivered"
                            ? "timeline-dot-current"
                            : ""
                    }`}
                />

                <div className="timeline-content">
                    <strong>Delivered</strong>

                    <p>
                        The delivery has reached the customer.
                    </p>

                    {history
                        .filter(
                            (event) =>
                                event.to_status === "Delivered"
                        )
                        .map((event) => (
                            <span key={event.id}>
                                {formatDate(event.changed_at)}
                            </span>
                        ))}
                </div>
            </div>
        </div>
    )}
</div>

                {confirmation && (
                    <div className="details-section">
                        <div className="section-heading">
                            <h2>Delivery confirmation</h2>
                        </div>

                        <div className="confirmation-card">
                            <span className="delivery-field-label">
                                Confirmation method
                            </span>

                            <strong>
                                {confirmation.method}
                            </strong>

                            <span>
                                Confirmed on{" "}
                                {formatDate(
                                    confirmation.confirmed_at
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
};

export default DeliveryDetails;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getDelivery,
    updateDelivery
} from "../services/deliveryService";

const EditDelivery = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        deliveryAddress: "",
        itemDescription: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDelivery = async () => {
            try {
                setLoading(true);
                setError("");

                const delivery = await getDelivery(id);

                if (delivery.status !== "Pending") {
                    setError(
                        "Only pending deliveries can be edited."
                    );
                    return;
                }

                setForm({
                    customerName: delivery.customer_name || "",
                    customerPhone: delivery.customer_phone || "",
                    deliveryAddress:
                        delivery.delivery_address || "",
                    itemDescription:
                        delivery.item_description || "",
                });
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load delivery."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDelivery();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSaving(true);

        try {
            await updateDelivery(id, form);

            navigate(`/retailer/deliveries/${id}`);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update delivery. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

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

    if (error) {
        return (
            <main className="page">
                <section className="form-card">
                    <p className="eyebrow">REFLEX</p>

                    <h1>Unable to edit delivery</h1>

                    <div className="form-error" role="alert">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="primary-button"
                        style={{
                            width: "auto",
                            marginTop: "8px"
                        }}
                        onClick={() =>
                            navigate(
                                `/retailer/deliveries/${id}`
                            )
                        }
                    >
                        Back to delivery
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
                            onClick={() =>
                                navigate(
                                    `/retailer/deliveries/${id}`
                                )
                            }
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            ← Back to delivery
                        </button>

                        <p className="eyebrow">
                            DELIVERY #{id}
                        </p>

                        <h1>Edit delivery</h1>

                        <p>
                            Update the delivery information while
                            it is still pending.
                        </p>
                    </div>

                    <span className="status-badge status-pending">
                        Pending
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div
                            className="form-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="customerName">
                            Customer name
                        </label>

                        <input
                            id="customerName"
                            name="customerName"
                            type="text"
                            value={form.customerName}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="customerPhone">
                            Customer phone
                        </label>

                        <input
                            id="customerPhone"
                            name="customerPhone"
                            type="tel"
                            value={form.customerPhone}
                            onChange={handleChange}
                            maxLength={20}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="deliveryAddress">
                            Delivery address
                        </label>

                        <textarea
                            id="deliveryAddress"
                            name="deliveryAddress"
                            value={form.deliveryAddress}
                            onChange={handleChange}
                            maxLength={5000}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDescription">
                            Item description
                        </label>

                        <textarea
                            id="itemDescription"
                            name="itemDescription"
                            value={form.itemDescription}
                            onChange={handleChange}
                            maxLength={5000}
                            rows={4}
                            required
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "8px"
                        }}
                    >
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    `/retailer/deliveries/${id}`
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default EditDelivery;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateDelivery = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        deliveryAddress: "",
        itemDescription: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        try {
            await api.post("/deliveries", form);

            navigate("/retailer");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create delivery. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page">
            <section className="form-card">
                <div className="page-header">
                    <div>
                        <p className="eyebrow">REFLEX</p>
                        <h1>New Delivery</h1>
                        <p>
                            Enter the details of the delivery you want to
                            create.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/retailer")}
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="form-error" role="alert">
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
                            placeholder="e.g. John Kamau"
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
                            placeholder="e.g. 0712345678"
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
                            placeholder="Enter the complete delivery address"
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
                            placeholder="Describe the items being delivered"
                            maxLength={5000}
                            rows={4}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create delivery"}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default CreateDelivery;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
            });

            setSuccess("Account created successfully. Signing you in...");

            await login(form.email, form.password);

            navigate("/retailer");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-header">
                    <p className="eyebrow">REFLEX</p>

                    <h1>Create your account</h1>

                    <p>
                        Register to create and manage your deliveries.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="form-error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="form-success" role="status">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name">
                            Full name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">
                            Phone number
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="07XXXXXXXX"
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default Register;

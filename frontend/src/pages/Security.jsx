import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const Security = () => {
    return (
        <PublicLayout>
            <main className="public-page interior-public-page">
                <section className="interior-hero">
                    <p className="public-eyebrow">
                        SECURITY BY DESIGN
                    </p>

                    <h1>
                        Protection is part of
                        <br />
                        the workflow.
                    </h1>

                    <p>
                        Reflex protects both identity and access by
                        combining authentication, backend authorization,
                        ownership checks, and controlled session handling.
                    </p>
                </section>

                <section className="security-page-list">
                    <article className="security-page-card">
                        <span>01</span>

                        <div>
                            <h2>JWT Authentication</h2>

                            <p>
                                Protected API operations require a valid
                                JWT containing the authenticated user's
                                identity and role.
                            </p>
                        </div>
                    </article>

                    <article className="security-page-card">
                        <span>02</span>

                        <div>
                            <h2>Backend Authorization</h2>

                            <p>
                                The backend remains the authoritative
                                security boundary for role-based access
                                and protected operations.
                            </p>
                        </div>
                    </article>

                    <article className="security-page-card">
                        <span>03</span>

                        <div>
                            <h2>Ownership Protection</h2>

                            <p>
                                Retailer access to deliveries is checked
                                against the authenticated user's ownership.
                            </p>
                        </div>
                    </article>

                    <article className="security-page-card">
                        <span>04</span>

                        <div>
                            <h2>Session Revalidation</h2>

                            <p>
                                Stored sessions are revalidated through
                                the current-user endpoint after refresh.
                            </p>
                        </div>
                    </article>

                    <article className="security-page-card">
                        <span>05</span>

                        <div>
                            <h2>Authenticated Sockets</h2>

                            <p>
                                Socket.IO clients must pass authentication
                                before they can join application rooms.
                            </p>
                        </div>
                    </article>

                    <article className="security-page-card">
                        <span>06</span>

                        <div>
                            <h2>Request Hardening</h2>

                            <p>
                                CORS restrictions, request-size limits,
                                malformed-input handling, and centralized
                                errors improve API resilience.
                            </p>
                        </div>
                    </article>
                </section>

                <section className="public-page-cta">
                    <div>
                        <p className="public-eyebrow">
                            READY TO USE REFLEX?
                        </p>

                        <h2>
                            Start with your role.
                        </h2>

                        <p>
                            Create an account or sign in to enter the
                            delivery workflow.
                        </p>
                    </div>

                    <div className="public-cta-actions">
                        <Link
                            to="/login"
                            className="public-secondary-button"
                        >
                            Log in
                        </Link>

                        <Link
                            to="/register"
                            className="public-primary-button"
                        >
                            Get Started
                        </Link>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
};

export default Security;
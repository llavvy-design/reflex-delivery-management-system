import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const Features = () => {
    return (
        <PublicLayout>
            <main className="public-page interior-public-page">
                <section className="interior-hero">
                    <p className="public-eyebrow">
                        CORE CAPABILITIES
                    </p>

                    <h1>
                        Built around the
                        <br />
                        delivery operation.
                    </h1>

                    <p>
                        Each part of Reflex supports a specific
                        operational need while keeping the overall
                        delivery journey connected.
                    </p>
                </section>

                <section className="feature-page-grid">
                    <article className="feature-page-card">
                        <span className="feature-index">01</span>

                        <h2>Delivery Management</h2>

                        <p>
                            Create, view, edit, assign, update,
                            cancel, and confirm deliveries through
                            their defined lifecycle.
                        </p>
                    </article>

                    <article className="feature-page-card">
                        <span className="feature-index">02</span>

                        <h2>Role-Based Dashboards</h2>

                        <p>
                            Retailers, dispatchers, and riders receive
                            role-specific interfaces and operations.
                        </p>
                    </article>

                    <article className="feature-page-card">
                        <span className="feature-index">03</span>

                        <h2>Real-Time Events</h2>

                        <p>
                            Socket.IO delivers relevant updates when
                            delivery events occur without requiring
                            constant polling.
                        </p>
                    </article>

                    <article className="feature-page-card">
                        <span className="feature-index">04</span>

                        <h2>Rider Availability</h2>

                        <p>
                            Dispatchers can work with rider availability
                            when assigning deliveries.
                        </p>
                    </article>

                    <article className="feature-page-card">
                        <span className="feature-index">05</span>

                        <h2>Delivery History</h2>

                        <p>
                            Status changes are recorded so the system
                            maintains a trace of delivery progression.
                        </p>
                    </article>

                    <article className="feature-page-card">
                        <span className="feature-index">06</span>

                        <h2>Delivery Confirmation</h2>

                        <p>
                            Completed deliveries can be confirmed using
                            a controlled confirmation-code workflow.
                        </p>
                    </article>
                </section>

                <section className="public-page-cta">
                    <div>
                        <p className="public-eyebrow">
                            SECURITY
                        </p>

                        <h2>
                            The workflow is protected too.
                        </h2>

                        <p>
                            See how authentication and authorization
                            protect the system.
                        </p>
                    </div>

                    <Link
                        to="/security"
                        className="public-primary-button"
                    >
                        View Security
                    </Link>
                </section>
            </main>
        </PublicLayout>
    );
};

export default Features;
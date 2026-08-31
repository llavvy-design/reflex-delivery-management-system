import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const Overview = () => {
    return (
        <PublicLayout>
            <main className="public-page interior-public-page">
                <section className="interior-hero">
                    <p className="public-eyebrow">
                        HOW REFLEX WORKS
                    </p>

                    <h1>
                        One workflow.
                        <br />
                        Four simple stages.
                    </h1>

                    <p>
                        Reflex connects each role at the point where
                        it matters most, creating a clear path from
                        delivery creation to final confirmation.
                    </p>
                </section>

                <section className="workflow-page-grid">
                    <article className="workflow-page-card">
                        <span>01</span>

                        <div>
                            <small>RETAILER</small>
                            <h2>Create</h2>

                            <p>
                                The retailer creates a delivery request
                                with the customer and delivery details.
                            </p>
                        </div>
                    </article>

                    <article className="workflow-page-card">
                        <span>02</span>

                        <div>
                            <small>DISPATCHER</small>
                            <h2>Assign</h2>

                            <p>
                                The dispatcher reviews deliveries and
                                assigns an available rider.
                            </p>
                        </div>
                    </article>

                    <article className="workflow-page-card">
                        <span>03</span>

                        <div>
                            <small>RIDER</small>
                            <h2>Deliver</h2>

                            <p>
                                The rider manages the assigned delivery
                                and moves it through the required status
                                lifecycle.
                            </p>
                        </div>
                    </article>

                    <article className="workflow-page-card">
                        <span>04</span>

                        <div>
                            <small>RETAILER</small>
                            <h2>Confirm</h2>

                            <p>
                                Once delivered, the retailer confirms
                                completion using the confirmation code.
                            </p>
                        </div>
                    </article>
                </section>

                <section className="public-page-cta">
                    <div>
                        <p className="public-eyebrow">
                            NEXT
                        </p>

                        <h2>
                            See what powers the workflow.
                        </h2>

                        <p>
                            Explore the features that make Reflex
                            useful for each role.
                        </p>
                    </div>

                    <Link
                        to="/features"
                        className="public-primary-button"
                    >
                        View Features
                    </Link>
                </section>
            </main>
        </PublicLayout>
    );
};

export default Overview;
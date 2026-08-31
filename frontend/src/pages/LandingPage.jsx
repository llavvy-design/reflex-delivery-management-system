import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const LandingPage = () => {
    return (
        <PublicLayout>
            <main className="public-page landing-page-new">
                <section className="landing-hero-new">
                    <div className="landing-hero-copy">
                        <p className="public-eyebrow">
                            DELIVERY MANAGEMENT PLATFORM
                        </p>

                        <h1>
                            Deliver smarter.
                            <br />
                            Coordinate faster.
                        </h1>

                        <p className="landing-hero-description">
                            Reflex connects retailers, dispatchers,
                            and riders in one streamlined delivery
                            workflow — from creation to confirmation.
                        </p>

                        <div className="landing-action-row">
                            <Link
                                to="/overview"
                                className="public-primary-button"
                            >
                                Explore Reflex
                            </Link>

                            <Link
                                to="/register"
                                className="public-secondary-button"
                            >
                                Get Started
                            </Link>
                        </div>

                        <div className="landing-trust-line">
                            <span className="landing-trust-dot" />
                            Role-based access with real-time updates
                        </div>
                    </div>

                    <div className="landing-preview-card">
                        <div className="landing-preview-top">
                            <div>
                                <span className="public-card-label">
                                    REFLEX WORKFLOW
                                </span>

                                <h2>
                                    One connected delivery journey
                                </h2>
                            </div>

                            <span className="landing-preview-status">
                                LIVE
                            </span>
                        </div>

                        <div className="landing-mini-flow">
                            <div className="landing-mini-step">
                                <span>01</span>
                                <div>
                                    <strong>Create</strong>
                                    <small>
                                        Retailer creates delivery
                                    </small>
                                </div>
                            </div>

                            <div className="landing-mini-connector" />

                            <div className="landing-mini-step">
                                <span>02</span>
                                <div>
                                    <strong>Assign</strong>
                                    <small>
                                        Dispatcher assigns rider
                                    </small>
                                </div>
                            </div>

                            <div className="landing-mini-connector" />

                            <div className="landing-mini-step">
                                <span>03</span>
                                <div>
                                    <strong>Deliver</strong>
                                    <small>
                                        Rider completes delivery
                                    </small>
                                </div>
                            </div>

                            <div className="landing-mini-connector" />

                            <div className="landing-mini-step">
                                <span>04</span>
                                <div>
                                    <strong>Confirm</strong>
                                    <small>
                                        Retailer confirms
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-bottom-strip">
                    <div>
                        <span>01</span>
                        <strong>Three roles</strong>
                        <p>
                            Retailer, dispatcher, and rider.
                        </p>
                    </div>

                    <div>
                        <span>02</span>
                        <strong>Real-time</strong>
                        <p>
                            Relevant delivery updates as they happen.
                        </p>
                    </div>

                    <div>
                        <span>03</span>
                        <strong>Protected</strong>
                        <p>
                            Authentication, authorization, and ownership.
                        </p>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
};

export default LandingPage;
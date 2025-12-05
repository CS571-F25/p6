import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export default function Home(props) {
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        let frame;
        const animate = () => {
            setAngle((prev) => (prev + 0.01) % (Math.PI * 2)); // smooth slow orbit
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frame);
    }, []);

    // ORBIT SHAPE (adjust these to tweak your oval)
    const centerX = window.innerWidth / 2;
    const centerY = 60;              // top of screen
    const radiusX = 300;             // wide → flat
    const radiusY = 30;              // very squat → almost flat

    const earthX = centerX + radiusX * Math.cos(angle);
    const earthY = centerY + radiusY * Math.sin(angle);

    return (
        <>
            {/* 🌍 OVAL ORBIT ANIMATION */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "120px",
                    pointerEvents: "none",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        marginTop: "30px",
                        transform: `translate(${earthX}px, ${earthY}px)`,
                        fontSize: "2rem",
                    }}
                >
                    🌍
                </div>
            </div>

            {/* MAIN CONTENT */}
            <Container className="mt-4">

                <Row className="mb-5">
                    <Col>
                        <h1>Welcome to RoamPlan</h1>
                        <p style={{ fontSize: "1.2rem" }}>
                            RoamPlan is a travel planning platform designed to help users 
                            explore destinations, review available information, and create 
                            organized itineraries.
                        </p>

                        <p>
                            The platform consolidates destination details, activity 
                            suggestions, and travel data in order to support more efficient 
                            trip preparation.
                        </p>

                        <Button as={Link} to="/destinations" variant="primary">
                            Explore Destinations
                        </Button>
                    </Col>
                </Row>


                <Row className="mt-4">
                    <h2>About RoamPlan</h2>
                    <p>
                        RoamPlan was created to provide a centralized resource for trip 
                        planning. It compiles key details for each location, offers 
                        structured activity recommendations, and supports itinerary 
                        development through a standardized interface.
                    </p>
                </Row>

                <Row className="mt-4">
                    <h2>Reviews</h2>

                    <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>Reviewer 1</Card.Title>
                                <Card.Text>
                                    RoamPlan provides a convenient way to manage and organize 
                                    travel plans in a single location.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>Reviewer 2</Card.Title>
                                <Card.Text>
                                    The platform offers clear destination information and 
                                    simplifies initial trip research.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>Reviewer 3</Card.Title>
                                <Card.Text>
                                    RoamPlan assists with creating structured itineraries and 
                                    organizing travel considerations effectively.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

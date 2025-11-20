import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router";

export default function Home(props) {
    return (
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

            <Row className="mt-4">
                <h2>Start Planning</h2>
                <p>
                    Begin constructing a personalized itinerary using available 
                    destination and activity information.
                </p>

                <Button>
                    Build Your Itinerary
                </Button>
            </Row>
        </Container>
    );
}

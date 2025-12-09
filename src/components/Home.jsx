import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export default function Home() {
  const [angle, setAngle] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Track viewport width for responsiveness
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <>

      {/* MAIN CONTENT */}
      <main role="main">
        <Container className="mt-4">

          {/* INTRO SECTION */}
          <Row className="mb-5">
            <Col>
              <h1 id="welcome-heading">Welcome to RoamPlan</h1>

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

              <Button 
                as={Link} 
                to="/destinations" 
                variant="primary"
                aria-label="Browse available travel destinations"
              >
                Explore Destinations
              </Button>
            </Col>
          </Row>

          {/* ABOUT SECTION */}
          <section aria-labelledby="about-heading" className="mt-4">
            <h2 id="about-heading">About RoamPlan</h2>
            <p>
              RoamPlan was created to provide a centralized resource for trip 
              planning. It compiles key details for each location, offers 
              structured activity recommendations, and supports itinerary 
              development through a standardized interface.
            </p>
          </section>

          {/* REVIEWS SECTION */}
          <section aria-labelledby="reviews-heading" className="mt-4 mb-5">
            <h2 id="reviews-heading">Reviews</h2>

            <Row>
              <Col md={4}>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title as="h3" style={{ fontSize: "1.15rem" }}>
                      Reviewer 1
                    </Card.Title>
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
                    <Card.Title as="h3" style={{ fontSize: "1.15rem" }}>
                      Reviewer 2
                    </Card.Title>
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
                    <Card.Title as="h3" style={{ fontSize: "1.15rem" }}>
                      Reviewer 3
                    </Card.Title>
                    <Card.Text>
                      RoamPlan assists with creating structured itineraries and 
                      organizing travel considerations effectively.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </section>

        </Container>
      </main>
    </>
  );
}

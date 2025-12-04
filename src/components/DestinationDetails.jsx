import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Button, Card, Row, Col } from "react-bootstrap";

// Time helpers
const parseTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function DestinationDetails({ destinations }) {
  const { name } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);

  useEffect(() => {
    const found = destinations.find(
      (d) => d.name.toLowerCase().replace(/\s+/g, "-") === name
    );
    setDestination(found);
  }, [name, destinations]);

  if (!destination) return <p>Destination not found.</p>;

  // Save activity into tripLegs (duration-based now)
  const saveActivityToTrip = (activity) => {
    const tripLegs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    let leg = tripLegs.find((l) => l.name === destination.name);

    if (!leg) {
      leg = {
        name: destination.name,
        description: destination.description,
        activities: destination.activities,
        plannedActivities: [],
        startDate: "",
        endDate: ""
      };
      tripLegs.push(leg);
    }

    // Convert recommended start/end → duration
    const startMin = parseTime(activity.start);
    const endMin = parseTime(activity.end);
    const duration = Math.min(Math.max(endMin - startMin, 30), 240);

    const newAct = {
      title: activity.title,
      description: activity.description,
      start: activity.start,   // Placeholder — TripLeg replaces this
      duration,
      date: ""                  // User assigns date in TripLeg
    };

    leg.plannedActivities.push(newAct);
    localStorage.setItem("tripLegs", JSON.stringify(tripLegs));

    alert(`Added "${activity.title}" to your itinerary`);
  };

  return (
    <Container className="mt-4">
      <Button variant="secondary" onClick={() => navigate("/destinations")}>
        ← Back to Destinations
      </Button>

      <h2 className="mt-3">{destination.name}</h2>

      <p>{destination.description}</p>

      <hr />

      <h3>Activities</h3>

      <Row>
        {destination.activities.map((act, i) => {
          const recommendedMin = parseTime(act.end) - parseTime(act.start);
          const duration = Math.min(Math.max(recommendedMin, 30), 240);

          return (
            <Col md={6} key={i} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>{act.title}</Card.Title>

                  <Card.Subtitle className="mb-2 text-muted">
                    ({Math.round((duration / 60) * 10) / 10} hours recommended)
                  </Card.Subtitle>

                  <Card.Text>{act.description}</Card.Text>

                  <Button
                    variant="primary"
                    onClick={() => saveActivityToTrip(act)}
                  >
                    Add to Trip
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

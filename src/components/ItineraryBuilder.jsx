import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";

export default function ItineraryBuilder() {
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const storedLegs = JSON.parse(localStorage.getItem("tripLegs")) || [];
    setSavedDestinations(storedLegs);
  
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || {};
    setNotes(storedNotes);
  }, []);
  const handleNoteChange = (name, text) => {
    const updated = { ...notes, [name]: text };
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };
  

  const handleRemove = (name) => {
    // Remove from the correct store!
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedLegs = legs.filter((l) => l.name !== name);
    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
  
    // Update UI list
    setSavedDestinations(updatedLegs);
  };
  

  return (
    <Container className="mt-4">
      <h2>Itinerary Builder</h2>
      <p>Organize your saved destinations and add your own notes.</p>

      <Row>
        {savedDestinations.length === 0 ? (
          <p>No destinations saved yet. Visit a destination and click *Add to Trip*.</p>
        ) : (
          savedDestinations.map((dest, index) => (
            <Col md={6} key={index} className="mb-4">
              <Card className="shadow-sm">
                <Card.Img src={dest.image} alt={dest.name} />
                <Card.Body>
                  <Card.Title>{dest.name}, {dest.country}</Card.Title>
                  <Card.Text>{dest.description}</Card.Text>

                  <h6>Your Notes</h6>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add notes, plans, or reminders..."
                    value={notes[dest.name] || ""}
                    onChange={(e) => handleNoteChange(dest.name, e.target.value)}
                  />
                  <Button
                    as={Link}
                    to={`/builder/leg/${dest.name.toLowerCase().replace(/\s+/g, "-")}`}
                    variant="primary"
                  >
                    Open Trip Leg
                  </Button>
                  <Button
                    variant="danger"
                    className="mt-3"
                    onClick={() => handleRemove(dest.name)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

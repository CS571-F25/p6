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
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedLegs = legs.filter((l) => l.name !== name);
    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
    setSavedDestinations(updatedLegs);
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-3">Itinerary Builder</h1>
      <p id="builder-desc">
        Organize your saved destinations and add personal notes.
      </p>

      <Row aria-describedby="builder-desc">
        {savedDestinations.length === 0 ? (
          <div
            role="alert"
            aria-live="polite"
            className="mt-3"
          >
            No destinations saved yet. Visit a destination and click 
            <strong> Add to Trip</strong>.
          </div>
        ) : (
          savedDestinations.map((dest, index) => {
            const slug = dest.name.toLowerCase().replace(/\s+/g, "-");
            const noteId = `notes-${slug}`;

            return (
              <Col md={6} key={index} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Img
                    src={dest.image}
                    alt={dest.altText || `${dest.name} in ${dest.country}`}
                  />

                  <Card.Body>
                    <Card.Title as="h2" style={{ fontSize: "1.25rem" }}>
                      {dest.name}, {dest.country}
                    </Card.Title>

                    <Card.Text>{dest.description}</Card.Text>

                    {/* Notes Label */}
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor={noteId}>
                        Your Notes for {dest.name}
                      </Form.Label>

                      <Form.Control
                        id={noteId}
                        as="textarea"
                        rows={3}
                        placeholder="Add notes, plans, or reminders..."
                        value={notes[dest.name] || ""}
                        onChange={(e) =>
                          handleNoteChange(dest.name, e.target.value)
                        }
                      />
                    </Form.Group>

                    {/* Open Trip Leg Button */}
                    <Button
                      as={Link}
                      to={`/builder/leg/${slug}`}
                      variant="primary"
                      className="mt-2"
                      aria-label={`Open trip leg details for ${dest.name}`}
                      style={{ paddingInline: "15px" }}
                    >
                      Open Trip Leg
                    </Button>

                    {/* Remove Button */}
                    <Button
                      variant="danger"
                      className="mt-2 ms-2"
                      style={{ paddingInline: "15px" }}
                      aria-label={`Remove ${dest.name} from itinerary`}
                      onClick={() => handleRemove(dest.name)}
                    >
                      Remove
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </Container>
  );
}

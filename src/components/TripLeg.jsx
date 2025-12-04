import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";

export default function TripLeg() {
  const { legName } = useParams();
  const navigate = useNavigate();

  // ALL HOOKS MUST BE AT THE TOP – ALWAYS
  const [leg, setLeg] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);  // ← MOVED UP

  // Load leg
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const found = stored.find(
      (l) => l.name.toLowerCase().replace(/\s+/g, "-") === legName
    );

    if (!found) {
      navigate("/builder");
      return;
    }

    setLeg(found);
    setSchedule(found.plannedActivities || []);
    setCurrentDay(1); // reset when switching legs
  }, [legName, navigate]);

  // Helper: update leg metadata
  const updateLeg = (updatedLeg) => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];

    const updated = stored.map((l) =>
      l.name === updatedLeg.name ? updatedLeg : l
    );

    localStorage.setItem("tripLegs", JSON.stringify(updated));
    setLeg(updatedLeg);
  };

  // Save schedule
  const saveSchedule = (updated) => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];

    const updatedLegs = stored.map((l) =>
      l.name === leg.name ? { ...l, plannedActivities: updated } : l
    );

    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
    setSchedule(updated);
  };

  // Edit field in schedule
  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    saveSchedule(updated);
  };

  const handleRemove = (index) => {
    const updated = schedule.filter((_, i) => i !== index);
    saveSchedule(updated);
  };

  // Move activity (not used in day-by-day mode but still here)
  const moveActivity = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= schedule.length) return;

    const updated = [...schedule];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    saveSchedule(updated);
  };

  // Day Pager
  const goNextDay = () => {
    if (currentDay < (leg?.days || 1)) setCurrentDay(currentDay + 1);
  };

  const goPrevDay = () => {
    if (currentDay > 1) setCurrentDay(currentDay - 1);
  };

  // Get activities for the current day
  const dayActivities = leg
    ? schedule
        .filter((a) => (a.day || 1) === currentDay)
        .sort((a, b) => a.start.localeCompare(b.start))
    : [];

  // ❗ Must appear after ALL hook calls
  if (!leg) return null;

  return (
    <Container className="mt-4">
      <Button variant="secondary" onClick={() => navigate("/builder")}>
        ← Back to Itinerary Builder
      </Button>

      <h2 className="mt-3">{leg.name} — Trip Leg</h2>
      <p>Create your personalized schedule using the destination’s activities.</p>

      {/* Trip Duration Controls */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4>Trip Duration</h4>

          <Row>
            <Col md={4}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={leg.startDate || ""}
                onChange={(e) =>
                  updateLeg({ ...leg, startDate: e.target.value })
                }
              />
            </Col>

            <Col md={4}>
              <Form.Label>Number of Days</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={leg.days || 1}
                onChange={(e) =>
                  updateLeg({ ...leg, days: Number(e.target.value) })
                }
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mt-4">
        {/* Available Activities */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4>Available Activities</h4>
              {leg.activities.map((act, i) => (
                <Card key={i} className="mb-3">
                  <Card.Body>
                    <Card.Title>{act.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {act.start} – {act.end}
                    </Card.Subtitle>
                    <Card.Text>{act.description}</Card.Text>

                    <Button
                      variant="primary"
                      onClick={() => {
                        const updated = [...schedule, { ...act }];
                        saveSchedule(updated);
                      }}
                    >
                      Add to Schedule
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Daily Schedule */}
        <Col md={6}>
          <Card className="shadow-sm mt-4">
            <Card.Body>
              <h4>Daily Schedule</h4>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                  variant="outline-secondary"
                  onClick={goPrevDay}
                  disabled={currentDay === 1}
                >
                  ← Previous Day
                </Button>

                <strong>
                  Day {currentDay} of {leg.days || 1}
                </strong>

                <Button
                  variant="outline-secondary"
                  onClick={goNextDay}
                  disabled={currentDay === (leg.days || 1)}
                >
                  Next Day →
                </Button>
              </div>

              {dayActivities.length === 0 && (
                <p className="text-muted">
                  No activities scheduled for this day yet.
                </p>
              )}

              {dayActivities.map((item, index) => {
                const globalIndex = schedule.indexOf(item);

                return (
                  <Card key={globalIndex} className="mb-3 border-primary">
                    <Card.Body>
                      <Card.Title>{item.title}</Card.Title>

                      <Row className="mb-2">
                        <Col>
                          <Form.Label>Start</Form.Label>
                          <Form.Control
                            type="time"
                            value={item.start}
                            onChange={(e) =>
                              handleTimeChange(globalIndex, "start", e.target.value)
                            }
                          />
                        </Col>

                        <Col>
                          <Form.Label>End</Form.Label>
                          <Form.Control
                            type="time"
                            value={item.end}
                            onChange={(e) =>
                              handleTimeChange(globalIndex, "end", e.target.value)
                            }
                          />
                        </Col>
                      </Row>

                      <Row className="mb-2">
                        <Col>
                          <Form.Label>Day</Form.Label>
                          <Form.Select
                            value={item.day || 1}
                            onChange={(e) =>
                              handleTimeChange(
                                globalIndex,
                                "day",
                                Number(e.target.value)
                              )
                            }
                          >
                            {[...Array(leg.days || 1)].map((_, d) => (
                              <option key={d + 1} value={d + 1}>
                                Day {d + 1}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>

                      <Button
                        variant="danger"
                        onClick={() => handleRemove(globalIndex)}
                      >
                        Remove Activity
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

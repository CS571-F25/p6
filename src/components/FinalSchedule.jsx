import { useEffect, useState } from "react";
import { Container, Card, ListGroup } from "react-bootstrap";
import { Button } from "react-bootstrap";
export default function FinalSchedule() {
  const [allActivities, setAllActivities] = useState([]);
  const deleteActivity = (activityToDelete) => {
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];
  
    const updatedLegs = legs.map((leg) => {
      if (leg.name !== activityToDelete.legName) return leg;
  
      // remove this activity
      const newActs = (leg.plannedActivities || []).filter((a) => {
        return !(
          a.title === activityToDelete.title &&
          a.date === activityToDelete.date &&
          a.start === activityToDelete.start
        );
      });
  
      return { ...leg, plannedActivities: newActs };
    });
  
    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
  
    // Update UI state
    setAllActivities((prev) =>
      prev.filter((a) =>
        !(
          a.title === activityToDelete.title &&
          a.date === activityToDelete.date &&
          a.start === activityToDelete.start
        )
      )
    );
  };  
  useEffect(() => {
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    // Flatten activities
    const merged = [];
    legs.forEach((leg) => {
      (leg.plannedActivities || []).forEach((act) => {
        if (!act.date) return; // ignore unscheduled
        merged.push({
          legName: leg.name,
          title: act.title,
          date: act.date,
          start: act.start,
          end: act.end,
        });
      });
    });

    // Sort by date + start time
    merged.sort((a, b) => {
      if (a.date === b.date) return a.start.localeCompare(b.start);
      return a.date.localeCompare(b.date);
    });

    setAllActivities(merged);
  }, []);

  // Group by date
  const grouped = allActivities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {});

  return (
    <Container className="mt-4">
      <h2>Final Trip Schedule</h2>
      <Button
        variant="danger"
        className="mb-3"
        onClick={() => {
            if (!window.confirm("Are you sure you want to delete ALL planned activities?")) return;

            const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];

            const cleared = legs.map((leg) => ({
            ...leg,
            plannedActivities: []
            }));

            localStorage.setItem("tripLegs", JSON.stringify(cleared));

            setAllActivities([]); // empty the UI
        }}
        >
        Clear All Activities
        </Button>
      <p>This is a unified chronological list of all scheduled trip activities.</p>

      {Object.keys(grouped).length === 0 && (
        <p>No scheduled activities yet. Assign activities in each Trip Leg.</p>
      )}

      {Object.keys(grouped).map((date) => (
        <Card key={date} className="mb-4 shadow-sm">
          <Card.Body>
            <h4>{new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric"
            })}</h4>

            <ListGroup>
              {grouped[date].map((act, i) => (
                <ListGroup.Item
                key={i}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{act.start}–{act.end}</strong>{" "}
                  — {act.title} <em>({act.legName})</em>
                </div>
              
                <Button variant="danger" size="sm" onClick={() => deleteActivity(act)}>
                  Delete
                </Button>
              </ListGroup.Item>
              
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

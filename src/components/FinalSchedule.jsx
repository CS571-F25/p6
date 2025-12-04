import { useEffect, useState } from "react";
import { Container, Card, ListGroup, Button } from "react-bootstrap";

// -----------------------------
// TIME HELPERS
// -----------------------------
const parseTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (total) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Local safe date formatting (prevents timezone drift)
const toISODate = (date) => date.toLocaleDateString("en-CA");

export default function FinalSchedule() {
  const [allActivities, setAllActivities] = useState([]);

  // -----------------------------
  // LOAD ALL ACTIVITIES FROM TRIP LEGS
  // -----------------------------
  useEffect(() => {
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const merged = [];

    legs.forEach((leg) => {
      (leg.plannedActivities || []).forEach((a) => {
        if (!a.date) return;

        merged.push({
          legName: leg.name,
          title: a.title,
          description: a.description || "",
          start: a.start,
          duration: a.duration,
          date: a.date
        });
      });
    });

    // Sort chronologically
    merged.sort((a, b) => {
      if (a.date === b.date) return a.start.localeCompare(b.start);
      return a.date.localeCompare(b.date);
    });

    setAllActivities(merged);
  }, []);

  // -----------------------------
  // DELETE ONE ACTIVITY
  // -----------------------------
  const deleteActivity = (activity) => {
    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    const updatedLegs = legs.map((leg) => {
      if (leg.name !== activity.legName) return leg;

      return {
        ...leg,
        plannedActivities: (leg.plannedActivities || []).filter((a) => {
          return !(
            a.title === activity.title &&
            a.date === activity.date &&
            a.start === activity.start
          );
        })
      };
    });

    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));

    setAllActivities((prev) =>
      prev.filter(
        (a) =>
          !(
            a.title === activity.title &&
            a.date === activity.date &&
            a.start === activity.start
          )
      )
    );
  };

  // -----------------------------
  // CLEAR ALL ACTIVITIES
  // -----------------------------
  const clearAll = () => {
    if (!window.confirm("Are you sure you want to DELETE ALL activities?"))
      return;

    const legs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    const cleared = legs.map((leg) => ({
      ...leg,
      plannedActivities: []
    }));

    localStorage.setItem("tripLegs", JSON.stringify(cleared));
    setAllActivities([]);
  };

  // -----------------------------
  // GROUP ACTIVITIES BY DATE
  // -----------------------------
  const grouped = allActivities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {});

  return (
    <Container className="mt-4">
      <h2>Final Trip Schedule</h2>
      <p>Your fully assembled itinerary, grouped by day.</p>

      {allActivities.length > 0 && (
        <Button variant="danger" className="mb-3" onClick={clearAll}>
          Clear All Activities
        </Button>
      )}

      {Object.keys(grouped).length === 0 && (
        <p>No scheduled activities yet.</p>
      )}

      {Object.keys(grouped).map((date) => (
        <Card key={date} className="mb-4 shadow-sm">
          <Card.Body>
            <h4>
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </h4>

            <ListGroup>
              {grouped[date].map((act, i) => {
                const startMin = parseTime(act.start);
                const endMin = startMin + act.duration;
                const end = minutesToTime(endMin);

                return (
                  <ListGroup.Item
                    key={i}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        {act.start}–{end}
                      </strong>{" "}
                      — {act.title}{" "}
                      <em style={{ opacity: 0.7 }}>({act.legName})</em>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteActivity(act)}
                    >
                      Delete
                    </Button>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

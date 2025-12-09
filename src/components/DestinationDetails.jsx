import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Button, Card, Row, Col, Badge } from "react-bootstrap";

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

  if (!destination)
    return (
      <p
        role="alert"
        aria-live="assertive"
        className="text-danger fw-bold mt-4"
      >
        Destination not found.
      </p>
    );

  const addWholeDestinationToTrip = () => {
    const tripLegs = JSON.parse(localStorage.getItem("tripLegs")) || [];
    let leg = tripLegs.find((l) => l.name === destination.name);

    if (!leg) {
      leg = {
        name: destination.name,
        description: destination.description,
        activities: destination.activities,
        plannedActivities: [],
        startDate: "",
        endDate: "",
        image: destination.image,
        country: destination.country
      };

      tripLegs.push(leg);
      localStorage.setItem("tripLegs", JSON.stringify(tripLegs));

      alert(`${destination.name} added to your itinerary.`);
    } else {
      alert(`${destination.name} is already in your itinerary.`);
    }
  };

  return (
    <Container
      className="mt-4"
      role="region"
      aria-label={`Details about ${destination.name}`}
    >

      {/* ---- BACK BUTTON ---- */}
      <Button
        variant="secondary"
        onClick={() => navigate("/destinations")}
        aria-label="Go back to the Destinations page"
        className="mb-3"
        style={{ outlineOffset: "3px" }}
      >
        ← Back to Destinations
      </Button>

      {/* ---- PAGE TITLE ---- */}
      <h1 id="destination-title" className="fw-bold mb-3">
        {destination.name}
      </h1>

      

      {/* ---- IMAGE ---- */}
      {destination.image && (
        <img
          src={destination.image}
          alt={destination.altText || `${destination.name} city view`}
          className="img-fluid my-3"
          style={{ borderRadius: "8px", maxHeight: "450px", objectFit: "cover" }}
        />
      )}

      {/* ---- ADD DESTINATION BUTTON ---- */}
      <div className="text-center">
        <Button
          variant="success"
          className="mb-4 px-4 py-2"
          onClick={addWholeDestinationToTrip}
          aria-label={`Add ${destination.name} to your travel itinerary`}
          style={{ outlineOffset: "3px" }}
        >
          ➕ Add Destination to Itinerary
        </Button>
      </div>

      {/* ========================================================= */}
      {/* GENERAL DETAILS SECTION */}
      {/* ========================================================= */}
      <section id="details" aria-labelledby="details-heading">
        <h2 id="details-heading" className="mt-4">General Details</h2>

        <Row className="mb-3">
          <Col md={6}>
            <p><strong>Country:</strong> {destination.country}</p>
            <p>
              <strong>Distance from Madison:</strong>{" "}
              {destination.distanceFromMadison.miles.toLocaleString()} miles  
              <br />
              <span className="text-muted">
                ({destination.distanceFromMadison.travelTime})
              </span>
            </p>
            <p>
              <strong>Distance from City Center:</strong>{" "}
              {destination.distanceFromCityCenter}
            </p>
            <p>
              <strong>Price Range:</strong> {destination.price}
            </p>
          </Col>

          <Col md={6}>
            <p>
              <strong>Best Season:</strong> {destination.bestSeason}
            </p>
            <p>
              <strong>Best Time of Day:</strong> {destination.bestTimeOfDay}
            </p>
            <p>
              <strong>Annual Visitors:</strong>{" "}
              {destination.annualVisitors.toLocaleString()}
            </p>
            <p>
              <strong>Effort Level:</strong>{" "}
              <Badge
                bg="primary"
                aria-label={`Effort level: ${destination.effortLevel}`}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "#0b5ed7", /* WCAG AA contrast */
                }}
              >
                {destination.effortLevel}
              </Badge>
            </p>
          </Col>
        </Row>

        {/* ---- DESCRIPTION ---- */}
        <h3 className="mt-4">Overview</h3>
        <p style={{ lineHeight: "1.6" }}>{destination.description}</p>

        <hr aria-hidden="true" />
      </section>

      {/* ========================================================= */}
      {/* ACTIVITIES SECTION */}
      {/* ========================================================= */}
      <section id="activities" aria-labelledby="activities-heading">
        <h2 id="activities-heading" className="mb-3">Activities</h2>

        <Row>
          {destination.activities.map((act, i) => {
            const mins = parseTime(act.end) - parseTime(act.start);
            const duration = Math.min(Math.max(mins, 30), 240);

            return (
              <Col md={6} key={i} className="mb-4">
                <article
                  className="shadow-sm p-3 h-100"
                  aria-label={`Activity: ${act.title}`}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    outlineOffset: "3px",
                    border: "1px solid #e5e5e5"

                  }}
                >
                  <h3 className="h4">{act.title}</h3>

                  <p className="text-muted" style={{ color: "#555" }}>
                    Recommended duration:{" "}
                    <strong>{(duration / 60).toFixed(1)} hours</strong>
                  </p>
                  <p>{act.description}</p>
                </article>
              </Col>
            );
          })}
        </Row>
      </section>
    </Container>
  );
}

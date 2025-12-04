import { useParams } from "react-router";
import destinations from "../data/destinations.json";
import { Container, Row, Col, Button, Card, ListGroup } from "react-bootstrap";

export default function DestinationDetails() {
  const { name } = useParams();

  const formattedName = name.replace(/-/g, " ").toLowerCase();
  const destination = destinations.find(
    (dest) => dest.name.toLowerCase() === formattedName
  );

  if (!destination) {
    return (
      <Container className="mt-4">
        <h2>Destination Not Found</h2>
        <p>We couldn't find that location.</p>
      </Container>
    );
  }

  const {
    image,
    name: cityName,
    country,
    description,
    distanceFromMadison,
    distanceFromCityCenter,
    price,
    annualVisitors,
    bestSeason,
    bestTimeOfDay,
    effortLevel,
    activities,
  } = destination;

  // Save the destination (plus metadata) into tripLegs for itinerary use
  const handleAddToTrip = () => {
    const tripLegs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    // don't duplicate
    const exists = tripLegs.some((leg) => leg.name === cityName);
    if (!exists) {
      tripLegs.push({
        ...destination,
        activities,
        plannedActivities: [],
        startDate: "",
        endDate: ""   // NEW: required for date-range mode
      });      
      localStorage.setItem("tripLegs", JSON.stringify(tripLegs));
    }

    alert(`${cityName}, ${country} has been added to your itinerary!`);
  };

  // Add individual activity into saved schedule for future "leg" page
  const handleSaveActivity = (activity) => {
    const tripLegs = JSON.parse(localStorage.getItem("tripLegs")) || [];

    let leg = tripLegs.find((l) => l.name === cityName);

    if (!leg) {
      // auto-create leg if user adds activity before adding city
      leg = {
        ...destination,
        plannedActivities: [],
        startDate: "",
        endDate: "",    // required for date-range scheduling
        activities: activities // ensure activities still exist
      };
      tripLegs.push(leg);
    }

    // avoid duplicates
    const exists = leg.plannedActivities?.some(
      (a) => a.title === activity.title && a.start === activity.start
    );

    if (!exists) {
      const newActivity = {
        ...activity,
        date: "" // user will set this in TripLeg
      };
    
      leg.plannedActivities = [...(leg.plannedActivities || []), newActivity];
      localStorage.setItem("tripLegs", JSON.stringify(tripLegs));
    
      alert(`Saved activity: ${activity.title}`);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <img src={image} alt={cityName} className="img-fluid rounded shadow" />
        </Col>

        <Col md={6}>
          <h2>{cityName}, {country}</h2>
          <p>{description}</p>

          <h5>General Info</h5>
          <ListGroup className="mb-3">
            <ListGroup.Item><strong>Distance from Madison:</strong> {distanceFromMadison.miles} miles — {distanceFromMadison.travelTime}</ListGroup.Item>
            <ListGroup.Item><strong>Distance from City Center:</strong> {distanceFromCityCenter}</ListGroup.Item>
            <ListGroup.Item><strong>Price:</strong> {price}</ListGroup.Item>
            <ListGroup.Item><strong>Annual Visitors:</strong> {annualVisitors.toLocaleString()}</ListGroup.Item>
            <ListGroup.Item><strong>Best Season:</strong> {bestSeason}</ListGroup.Item>
            <ListGroup.Item><strong>Best Time of Day:</strong> {bestTimeOfDay}</ListGroup.Item>
            <ListGroup.Item><strong>Effort Level:</strong> {effortLevel}</ListGroup.Item>
          </ListGroup>

          <Button variant="success" onClick={handleAddToTrip}>
            Add Entire Destination to Itinerary
          </Button>
        </Col>
      </Row>

      <hr />

      <h4 className="mt-4">Activities With Time Ranges</h4>
      <Row>
        {activities.map((act, i) => (
          <Col md={6} key={i} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{act.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {act.start} – {act.end}
                </Card.Subtitle>
                <Card.Text>{act.description}</Card.Text>

                <Button
                  variant="primary"
                  onClick={() => handleSaveActivity(act)}
                >
                  Save Activity to Itinerary
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

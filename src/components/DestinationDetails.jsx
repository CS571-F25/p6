import { useParams } from "react-router";
import destinations from "../data/destinations.json";
import { Container, Row, Col, Button, Card } from "react-bootstrap";

export default function DestinationDetails() {
  const { name } = useParams();

  // convert slug back into data name
  const formattedName = name.replace(/-/g, " ").toLowerCase();

  // find the matching destination
  const destination = destinations.find(dest => 
    dest.name.toLowerCase() === formattedName
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
    activities 
  } = destination;

  const handleAddToTrip = () => {
    // Retrieve existing saved destinations
    const saved = JSON.parse(localStorage.getItem("savedDestinations")) || [];
  
    // Add the new destination if not already saved
    const exists = saved.some(dest => dest.name === cityName);
    if (!exists) {
      saved.push(destination);
      localStorage.setItem("savedDestinations", JSON.stringify(saved));
    }
  
    alert(`${cityName}, ${country} has been added to your trip!`);
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

          <h5>Distance from Madison</h5>
          <p>{distanceFromMadison.miles} miles — {distanceFromMadison.travelTime}</p>

          <h5>Top Activities</h5>
          <ul>
            {activities.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>

          <Button variant="success" onClick={handleAddToTrip}>
            Add to Trip
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

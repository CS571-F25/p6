import { useNavigate } from "react-router";
import { Card, Button } from "react-bootstrap";

export default function DestinationCard(props) {
  const navigate = useNavigate();
  const { name, country, image, description, distance, activities } = props;

  const handleViewDetails = () => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/destinations/${slug}`);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Img variant="top" src={image} alt={name} />
      <Card.Body>
        <Card.Title>{name}, {country}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Button variant="primary" onClick={handleViewDetails}>
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
}

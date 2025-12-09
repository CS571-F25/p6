import { useNavigate } from "react-router";
import { Card, Button } from "react-bootstrap";

export default function DestinationCard(props) {
  const navigate = useNavigate();
  const { name, country, image, altText, description } = props;

  const handleViewDetails = () => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/destinations/${slug}`);
  };

  return (
    <Card
      className="mb-4 shadow-sm"
      role="group"
      aria-labelledby={`heading-${name}`}
      tabIndex="0"
      style={{ outline: "none" }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 3px #005fcc"; // strong visible focus
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "0 0 4px rgba(0,0,0,0.15)";
      }}
    >
      <Card.Img 
        variant="top" 
        src={image} 
        alt={altText || `${name}, located in ${country}.`} 
      />

      <Card.Body>
        <Card.Title as="h3" id={`heading-${name}`}>
          {name}, {country}
        </Card.Title>

        <Card.Text>{description}</Card.Text>

        <Button 
          variant="primary" 
          onClick={handleViewDetails}
          aria-label={`View details for ${name}`}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
}

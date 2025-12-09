import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router";

export default function NavBar() {
  return (
    <Navbar 
      bg="light" 
      expand="lg" 
      fixed="top"
      role="navigation"
      aria-label="Main navigation"
      className="shadow-sm"
    >
      <Container>

        {/* Brand */}
        <Navbar.Brand 
          as={Link} 
          to="/" 
          aria-label="RoamPlan home page"
        >
          RoamPlan
        </Navbar.Brand>

        {/* Mobile toggle button */}
        <Navbar.Toggle 
          aria-controls="main-nav"
          aria-label="Toggle navigation menu"
        />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">

            <Nav.Link 
              as={Link} 
              to="/" 
              aria-label="Go to Home page"
            >
              Home
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/destinations"
              aria-label="View available destinations"
            >
              Destinations
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/builder"
              aria-label="Open itinerary builder"
            >
              Itinerary Builder
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/final-schedule"
              aria-label="View your final trip schedule"
            >
              Final Schedule
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/about"
              aria-label="Learn more about RoamPlan"
            >
              About Us
            </Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

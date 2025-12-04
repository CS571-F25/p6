import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router";

export default function NavBar() {
  return (
    <Navbar bg="light" expand="lg" fixed="top">   {/* <-- HERE */}
      <Container>
        <Navbar.Brand as={Link} to="/">RoamPlan</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/destinations">Destinations</Nav.Link>
            <Nav.Link as={Link} to="/builder">Itinerary Builder</Nav.Link>
            <Nav.Link as={Link} to="/final-schedule">Final Schedule</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

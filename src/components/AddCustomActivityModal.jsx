import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function AddCustomActivityModal({ show, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const [error, setError] = useState("");
  const titleRef = useRef(null);

  // Autofocus the title input when modal opens
  useEffect(() => {
    if (show && titleRef.current) titleRef.current.focus();
  }, [show]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Activity title is required.");
      return;
    }

    setError("");

    onSave({
      title,
      description,
      start,
      end,
      isCustom: true
    });

    // Reset form
    setTitle("");
    setDescription("");
    setStart("09:00");
    setEnd("10:00");

    onClose();
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      aria-labelledby="add-activity-title"
      aria-describedby="add-activity-desc"
    >
      <Modal.Header closeButton>
        <Modal.Title id="add-activity-title">
          Add Custom Activity
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p id="add-activity-desc" className="visually-hidden">
          Fill out this form to add a custom activity to your itinerary.
        </p>

        {/* Accessible error announcement */}
        {error && (
          <div 
            className="alert alert-danger" 
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <Form 
          onSubmit={(e) => {
            e.preventDefault(); // prevent accidental form submission
            handleSubmit();
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label htmlFor="custom-title">
              Title <span aria-hidden="true">*</span>
            </Form.Label>
            <Form.Control
              id="custom-title"
              ref={titleRef}
              required
              aria-required="true"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Wine Tasting Tour"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="custom-description">Description</Form.Label>
            <Form.Control
              id="custom-description"
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="custom-start">Recommended Start</Form.Label>
            <Form.Control
              id="custom-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="custom-end">Recommended End</Form.Label>
            <Form.Control
              id="custom-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onClose}
          aria-label="Cancel adding custom activity"
        >
          Cancel
        </Button>

        <Button 
          variant="primary" 
          onClick={handleSubmit}
          aria-label="Save and add custom activity"
        >
          Add Activity
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function AddCustomActivityModal({ 
  show, 
  onClose, 
  onSave 
}) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Activity must have a title.");
      return;
    }

    onSave({
      title,
      description,
      start,
      end
    });

    // Reset form
    setTitle("");
    setDescription("");
    setStart("09:00");
    setEnd("10:00");

    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Custom Activity</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Wine Tasting Tour"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recommended Start</Form.Label>
            <Form.Control
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Recommended End</Form.Label>
            <Form.Control
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Activity
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

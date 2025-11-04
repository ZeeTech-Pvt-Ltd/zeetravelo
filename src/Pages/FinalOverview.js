// FinalOverview.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';

const FinalOverview = () => {
  const location = useLocation();
  const { selectedFare, selectedSeat } = location.state || {};

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4 display-4">Final Overview</h1>
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-black text-white">
        <h1 className="text-center mb-4 display-6">Booking Summary</h1>
        </Card.Header>
        <Card.Body>
        <Row className="mb-4">
  <Col md={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">
          <i className="bi bi-cash-coin me-2"></i>Fare Details
        </h5>
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <strong>Type:</strong> <span className="badge bg-secondary ms-2">{selectedFare?.type}</span>
          </li>
          <li className="list-group-item">
            <strong>Price:</strong> <span className="text-success fw-bold ms-2">${selectedFare?.price}</span>
          </li>
          <li className="list-group-item">
            <strong>Luggage:</strong> <span className="ms-2">{selectedFare?.luggage}</span>
          </li>
          <li className="list-group-item">
            <strong>Refund Policy:</strong> <span className="ms-2">{selectedFare?.refund}</span>
          </li>
          <li className="list-group-item">
            <strong>Seat Selection:</strong> <span className="ms-2">{selectedFare?.seat}</span>
          </li>
          <li className="list-group-item">
            <strong>Date Change Policy:</strong> <span className="ms-2">{selectedFare?.dateChange}</span>
          </li>
        </ul>
      </Card.Body>
    </Card>
  </Col>

  <Col md={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">
          <i className="bi bi-person-seat me-2"></i>Seat Information
        </h5>
      </Card.Header>
      <Card.Body className="d-flex align-items-center justify-content-center">
        <h4>
          <span className="badge bg-dark px-4 py-2 fs-5">{selectedSeat}</span>
        </h4>
      </Card.Body>
    </Card>
  </Col>
</Row>

          <div className="text-center">
            <Button variant="success" size="lg">Confirm Booking</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FinalOverview;

// Pages/BookingConfirmation.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button } from 'react-bootstrap';

const BookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const flight = state?.flight;
  const passengers = state?.passengers;

  if (!flight || !passengers || passengers.length === 0) {
    return (
      <h3 className="text-center text-danger mt-5">
        ⚠️ Missing booking information. Please go back and fill the details.
      </h3>
    );
  }

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">🎉 Booking Confirmed!</h2>
      <Card className="mb-4 shadow-sm border-success">
        <Card.Body>
          <h4>Flight Summary</h4>
          <p><strong>From:</strong> {flight.itineraries[0].segments[0].departure.iataCode}</p>
          <p><strong>To:</strong> {
            flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode
          }</p>
          <p><strong>Total Price:</strong> €{flight.price.total} ({flight.price.currency})</p>
          <p><strong>Stops:</strong> {flight.itineraries[0].segments.length - 1}</p>
        </Card.Body>
      </Card>

      <h4>Passenger Details</h4>
      {passengers.map((passenger, index) => (
        <Card key={index} className="mb-3 p-3 shadow-sm border-primary">
          <Row>
            <Col md={6}><strong>Name:</strong> {passenger.firstName} {passenger.lastName}</Col>
            <Col md={6}><strong>Date of Birth:</strong> {passenger.dob}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Gender:</strong> {passenger.gender}</Col>
            <Col md={6}><strong>Nationality:</strong> {passenger.nationality}</Col>
          </Row>
        </Card>
      ))}

      <Button variant="success" onClick={handleBackToHome}>Return to Home</Button>
      <div style={{ marginBottom: '100px' }}></div>
    </div>
  );
};

export default BookingConfirmation;

// components/FlightList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FlightList.css';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import FlightDetailsModal from './FlightDetailsModal';

const FlightList = ({ searchParams }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (flight) => {
    setSelectedFlight(flight);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedFlight(null);
  };

  useEffect(() => {
    const { origin, destination, date, adults } = searchParams;
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiUrl = `${API_BASE_URL}/api/flights?origin=${origin}&destination=${destination}&date=${date}&adults=${adults}`;

    setLoading(true);
    setError(null);

    axios.get(apiUrl)
      .then(response => {
        setFlights(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /> Loading flights...</div>;
  if (error) return <Alert variant="danger" className="my-5 text-center">Error: {error}</Alert>;

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <h2 className="text-center mb-4 display-5">Available Flights</h2>

        {flights.map((flight, flightIndex) => (
          <Card className="mb-5 shadow-sm" key={flightIndex}>
            <Card.Body>
              <h3 className="text-center mb-4 display-6">Flight Option {flightIndex + 1}</h3>

              {/* Segment Grid */}
              <div className="position-relative">
                <Row className="g-4">
                  {flight.itineraries[0].segments.map((segment, segmentIndex) => (
                    <Col key={segmentIndex} xs={12} md={6} lg={4}>
                      <Card className="flight-card h-100 border-info">
                        <Card.Body>
                          <Card.Title className="text-center text-info" style={{ fontSize: '1.6rem' }}>
                            {segment.departure.iataCode} → {segment.arrival.iataCode}
                          </Card.Title>

                          <Card.Text><strong>Carrier:</strong> {segment.carrierCode} {segment.number}</Card.Text>
                          <Card.Text><strong>Aircraft:</strong> {segment.aircraft.code}</Card.Text>
                          <Card.Text><strong>Departure:</strong> {new Date(segment.departure.at).toLocaleString()}</Card.Text>
                          <Card.Text><strong>Arrival:</strong> {new Date(segment.arrival.at).toLocaleString()}</Card.Text>
                          <Card.Text><strong>Duration:</strong> {segment.duration.replace('PT', '').toLowerCase()}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Centered Total Price */}
                <div className="text-center mt-4">
                  <h3 className="text-success mb-0 display-6">
                    Total Price: <strong>{flight.price.total} €</strong>
                  </h3>
                </div>

                {/* Select Button Aligned Right */}
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    variant="primary"
                    size="lg"
                    style={{ width: '150px' }}
                    className="py-2 shadow"
                    onClick={() => handleSelect(flight)}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

      </Card>

      {/* Modal for Flight Details */}
      <FlightDetailsModal show={showModal} handleClose={handleClose} flight={selectedFlight} />
    </Container>
  );
};

export default FlightList;

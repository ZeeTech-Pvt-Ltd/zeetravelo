import React from 'react';
import { Modal, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FlightDetailsModal = ({ show, handleClose, flight }) => {
  const navigate = useNavigate();
  if (!flight) return null;

  const handleContinueBooking = () => {
    navigate('/booking-details', { state: { flight } });
    handleClose();
  };

  const itineraryLabels = ['Outbound Flight', 'Return Flight'];

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Body className="px-5 py-4">

        <div className="text-center mb-5">
          <h4 className="display-5">
            {flight.itineraries[0].segments[0].departure.iataCode} &rarr; {flight.itineraries.at(-1).segments.at(-1).arrival.iataCode}
          </h4>
          <div className="text-muted">
            {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleDateString()} —{' '}
            {new Date(flight.itineraries.at(-1).segments.at(-1).arrival.at).toLocaleDateString()}
          </div>
        </div>

        {flight.itineraries.map((itinerary, i) => (
          <div key={i} className="mb-4">
            <h5 className="fw-bold text-primary mb-3">{itineraryLabels[i] || `Itinerary ${i + 1}`}</h5>

            {itinerary.segments.map((segment, index) => (
              <Card key={index} className="mb-4 shadow-sm border-0 border-start border-3 border-primary-subtle">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <div className="text-muted small">Departure</div>
                        <div className="fw-semibold">{segment.departure.iataCode}</div>
                        <div>{new Date(segment.departure.at).toLocaleString()}</div>
                        <div className="text-muted small">
                          Terminal: {segment.departure.terminal || 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <div className="text-muted small">Arrival</div>
                        <div className="fw-semibold">{segment.arrival.iataCode}</div>
                        <div>{new Date(segment.arrival.at).toLocaleString()}</div>
                        <div className="text-muted small">
                          Terminal: {segment.arrival.terminal || 'N/A'}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-3" />

                  <Row className="small text-muted">
                    <Col>
                      <div>
                        <span className="fw-semibold">Flight:</span> {segment.carrierCode} {segment.number}
                      </div>
                    </Col>
                    <Col>
                      <div>
                        <span className="fw-semibold">Aircraft:</span> {segment.aircraft.code}
                      </div>
                    </Col>
                    <Col>
                      <div>
                        <span className="fw-semibold">Duration:</span> {segment.duration.replace('PT', '').toLowerCase()}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        ))}

        <hr className="my-4" />

        <Row className="align-items-center mb-3">
          <Col>
            <h5 className="mb-1">Total Price</h5>
            <div className="text-muted">
              Includes all taxes and fees
            </div>
          </Col>
          <Col className="text-end">
            <div className="fs-4 fw-bold text-success">
              {flight.price.currency} {flight.price.total}
            </div>
          </Col>
        </Row>

        <Row className="text-muted small">
          <Col>
            <div>
              <span className="fw-semibold">Stops:</span> {flight.itineraries.reduce((acc, it) => acc + it.segments.length - 1, 0)}
            </div>
          </Col>
          <Col className="text-end">
            <div>
              <span className="fw-semibold">Currency:</span> {flight.price.currency}
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="px-5 py-3">
        <Button variant="secondary" onClick={handleClose} className="px-4">
          Close
        </Button>
        <Button variant="primary" onClick={handleContinueBooking} className="px-4">
          Continue Booking
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlightDetailsModal;

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Container, Row, Col, Badge, ListGroup, Button } from 'react-bootstrap';
import { FaPlaneDeparture, FaPlaneArrival, FaUser, FaPassport, FaPhone, FaEnvelope, FaDollarSign } from 'react-icons/fa';
import OrderDetails from '../Components/OrderDetails';
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { useEffect } from 'react';
import { useSessionTimeout } from '../Components/SessionTimeoutContext';
import './BaggageDetails.css';

const getAirlineName = (iataCode) => {
  const match = airlineData.find((airline) => airline.iata === iataCode);
  return match ? match.name : iataCode;
};

// Mapping airports to IATA codes for quick lookup
const airportNameMap = airports.reduce((map, airport) => {
  map[airport.iata] = airport.name;
  return map;
}, {});

const getAirportName = (iataCode) => airportNameMap[iataCode] || iataCode;



const BaggageDetails = () => {
  const location = useLocation();
  const { flight, passengers } = location.state || {};
  const { startBookingUpdateTimer } = useSessionTimeout();
  const { startPricingTimer } = useSessionTimeout();
  console.log('Flight:', flight);
  console.log('Passengers:', passengers);

  // Inside your component
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

// useEffect(() => {
//   startBookingUpdateTimer();
// }, []);
useEffect(() => {
  startPricingTimer();
}, []);

  // Error handling for missing data
  if (!flight || !passengers) {
    return (
      <div className="baggage-details-container">
        <Container>
          <div className="error-container">
            <h2 className="error-message">Error: No flight or passenger data provided.</h2>
            <Button variant="primary" href="/" className="error-button">Go back and select a flight</Button>
          </div>
        </Container>
      </div>
    );
  }

  // Check if it is a return flight
  const isReturnTrip = flight.returnDate !== undefined;

  

  return (
    <div className="baggage-details-container">
      <div className="baggage-details-header">
        <Container>
          <h1 className="baggage-details-title">Booking Summary</h1>
        </Container>
      </div>

      <Container>
      {/* Flight Details */}
      <Card className="flight-info-card">
  <Card.Header className="flight-info-header">
    <h4>
      <FaPlaneDeparture className="me-2" /> Flight Information
    </h4>
  </Card.Header>
  <Card.Body className="flight-info-body">
    {/* Outbound Flight Info */}
    <Row className="mb-4 align-items-center text-center text-md-start">
      <Col md={6} className="d-flex align-items-center justify-content-center justify-content-md-start mb-3 mb-md-0">
        <img
          src={`https://content.airhex.com/content/logos/airlines_${flight.itineraries[0]?.segments[0]?.carrierCode}_64_64_s.png`}
          alt={flight.itineraries[0]?.segments[0]?.carrierCode}
          className="airline-logo-large"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div>
          <div className="airline-name">{getAirlineName(flight.itineraries[0]?.segments[0]?.carrierCode)}</div>
          <div style={{ marginTop: '8px' }}>
            <strong style={{ color: '#64748b', fontSize: '1rem' }}>From:</strong>{' '}
            <Badge className="airport-badge">
              {getAirportName(flight.itineraries[0]?.segments[0]?.departure?.iataCode)}
            </Badge>
          </div>
        </div>
      </Col>
      <Col md={6} className="text-center text-md-end">
        <div style={{ marginTop: '8px' }}>
          <strong style={{ color: '#64748b', fontSize: '1rem' }}>To:</strong>{' '}
          <Badge className="airport-badge">
            {getAirportName(flight.itineraries[0]?.segments.at(-1)?.arrival?.iataCode)}
          </Badge>
        </div>
      </Col>
    </Row>

    {/* Time Info */}
    <Row className="mb-4 text-center text-md-start">
      <Col md={6} className="mb-3 mb-md-0">
        <div className="departure-arrival-time">
          <FaPlaneDeparture className="departure-icon" />
          <strong>Departure:</strong> <span style={{ marginLeft: '8px' }}>{new Date(flight.itineraries[0]?.segments[0]?.departure?.at).toLocaleString()}</span>
        </div>
      </Col>
      <Col md={6}>
        <div className="departure-arrival-time arrival-time-right">
          <FaPlaneArrival className="arrival-icon" />
          <strong>Arrival:</strong> <span style={{ marginLeft: '8px' }}>{new Date(flight.itineraries[0]?.segments.at(-1)?.arrival?.at).toLocaleString()}</span>
        </div>
      </Col>
    </Row>

    {/* Return Flight */}
    {isReturnTrip && (
      <>
        <hr className="return-flight-divider" />
        <h5 className="return-flight-title">Return Flight Information</h5>
        <Row className="mb-4 align-items-center text-center text-md-start">
          <Col md={6} className="d-flex align-items-center justify-content-center justify-content-md-start mb-3 mb-md-0">
            <img
              src={`https://content.airhex.com/content/logos/airlines_${flight.returnFlight?.carrierCode}_64_64_s.png`}
              alt={flight.returnFlight?.carrierCode}
              className="airline-logo-large"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div>
              <div className="airline-name">{getAirlineName(flight.returnFlight?.carrierCode)}</div>
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#64748b', fontSize: '1rem' }}>From:</strong>{' '}
                <Badge className="airport-badge">
                  {getAirportName(flight.returnFlight?.departure?.iataCode)}
                </Badge>
              </div>
            </div>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div style={{ marginTop: '8px' }}>
              <strong style={{ color: '#64748b', fontSize: '1rem' }}>To:</strong>{' '}
              <Badge className="airport-badge">
                {getAirportName(flight.returnFlight?.arrival?.iataCode)}
              </Badge>
            </div>
          </Col>
        </Row>

        <Row className="mb-4 text-center text-md-start">
          <Col md={6} className="mb-3 mb-md-0">
            <div className="departure-arrival-time">
              <FaPlaneDeparture className="departure-icon" />
              <strong>Departure:</strong> <span style={{ marginLeft: '8px' }}>{new Date(flight.returnFlight?.departure?.at).toLocaleString()}</span>
            </div>
          </Col>
          <Col md={6}>
            <div className="departure-arrival-time arrival-time-right">
              <FaPlaneArrival className="arrival-icon" />
              <strong>Arrival:</strong> <span style={{ marginLeft: '8px' }}>{new Date(flight.returnFlight?.arrival?.at).toLocaleString()}</span>
            </div>
          </Col>
        </Row>
      </>
    )}

    {/* Total Price */}
    <div className="total-price-section">
      <div className="text-center">
        <span className="total-price-text">Total Price:</span>
        <span className="total-price-amount">
          {flight.price?.total} {flight.price?.currency}
        </span>
      </div>
    </div>
  </Card.Body>
</Card>

      {/* Passenger Details */}
      <Card className="passenger-details-card">
  <Card.Header className="passenger-details-header">
    <h4>
      <FaUser className="me-2" /> Passenger Details
    </h4>
  </Card.Header>
  <Card.Body className="passenger-details-body">
    <ListGroup variant="flush">
      {passengers.map((p, idx) => (
        <ListGroup.Item key={idx} className="passenger-list-item">
          <h4 className="passenger-name">
            Passenger {idx + 1}: {p.firstName} {p.lastName}
          </h4>
          <Row className="mb-3">
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">DOB:</span>
              <span className="passenger-info-value">{p.dob}</span>
            </Col>
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">Gender:</span>
              <span className="passenger-info-value">{p.gender}</span>
            </Col>
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">Nationality:</span>
              <span className="passenger-info-value">{p.nationality}</span>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6} className="mb-2">
              <span className="passenger-info-label">
                <FaEnvelope className="passenger-info-icon email-icon" />
                Email:
              </span>
              <span className="passenger-info-value">{p.email}</span>
            </Col>
            <Col md={6} className="mb-2">
              <span className="passenger-info-label">
                <FaPhone className="passenger-info-icon phone-icon" />
                Phone:
              </span>
              <span className="passenger-info-value">{p.phone}</span>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">
                <FaPassport className="passenger-info-icon passport-icon" />
                Passport No:
              </span>
              <span className="passenger-info-value">{p.passportNumber}</span>
            </Col>
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">Expiry:</span>
              <span className="passenger-info-value">{p.passportExpiry}</span>
            </Col>
            <Col md={4} className="mb-2">
              <span className="passenger-info-label">Issued By:</span>
              <span className="passenger-info-value">{p.issuanceCountry}</span>
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Card.Body>
</Card>


      {/* Booking Section */}
      <Card className="finalize-booking-card">
        <Card.Header className="finalize-booking-header">
          <h5><FaPlaneArrival className="me-2" /> Finalize Booking</h5>
        </Card.Header>
        <Card.Body className="finalize-booking-body">
          <OrderDetails flight={flight} passengers={passengers} />
        </Card.Body>
      </Card>
      </Container>
    </div>
  );
};

export default BaggageDetails;

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Container, Row, Col, Badge, ListGroup, Button } from 'react-bootstrap';
import { FaPlaneDeparture, FaPlaneArrival, FaUser, FaPassport, FaPhone, FaEnvelope, FaDollarSign } from 'react-icons/fa';
import OrderDetails from '../Components/OrderDetails';
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { useEffect } from 'react';
import { useSessionTimeout } from '../Components/SessionTimeoutContext';

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
      <Container className="mt-5">
        <h2 className="text-center text-danger">Error: No flight or passenger data provided.</h2>
        <Button variant="primary" href="/">Go back and select a flight</Button>
      </Container>
    );
  }

  // Check if it is a return flight
  const isReturnTrip = flight.returnDate !== undefined;

  

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center display-5" style={{ marginTop: '-50px' }}>
  Booking Summary
</h2>


      {/* Flight Details */}
      <Card className="mb-4 shadow-sm border-0">
  <Card.Header className="bg-info text-white text-center">
    <h4 className="mb-0 display-6">
      <FaPlaneDeparture className="me-2" /> Flight Information
    </h4>
  </Card.Header>
  <Card.Body>
    {/* Outbound Flight Info */}
    <Row className="mb-4 align-items-center text-center text-md-start">
      <Col md={6} className="d-flex align-items-center justify-content-center justify-content-md-start mb-3 mb-md-0">
        <img
          src={`https://content.airhex.com/content/logos/airlines_${flight.itineraries[0]?.segments[0]?.carrierCode}_64_64_s.png`}
          alt={flight.itineraries[0]?.segments[0]?.carrierCode}
          width="70"
          height="70"
          className="me-3"
        />
        <div>
          <div className="fw-bold fs-3">{getAirlineName(flight.itineraries[0]?.segments[0]?.carrierCode)}</div>
          <div className="fs-5"><br/>
            <strong>From:</strong>{' '}
            <Badge bg="secondary" className="fs-5 text-uppercase">
              {getAirportName(flight.itineraries[0]?.segments[0]?.departure?.iataCode)}
            </Badge>
          </div>
        </div>
      </Col>
      <Col md={6} className="text-center text-md-end">
        <br/>
        <div className="fs-5 mt-5">
          <strong>To:</strong>{' '}
          <Badge bg="secondary" className="fs-5 text-uppercase">
            {getAirportName(flight.itineraries[0]?.segments.at(-1)?.arrival?.iataCode)}
          </Badge>
        </div>
      </Col>
    </Row>

    {/* Time Info */}
    <Row className="mb-4 text-center text-md-start">
      <Col md={6} className="mb-3 mb-md-0">
        <div className="d-flex align-items-center justify-content-center justify-content-md-start fs-4 fw-semibold">
          <FaPlaneDeparture className="me-2 text-primary" />
          Departure: {new Date(flight.itineraries[0]?.segments[0]?.departure?.at).toLocaleString()}
        </div>
      </Col>
      <Col md={6}>
        <div className="d-flex align-items-center justify-content-center justify-content-md-end fs-4 fw-semibold">
          <FaPlaneArrival className="me-2 text-success" />
          Arrival: {new Date(flight.itineraries[0]?.segments.at(-1)?.arrival?.at).toLocaleString()}
        </div>
      </Col>
    </Row>

    {/* Return Flight */}
    {isReturnTrip && (
      <>
        <hr />
        <h5 className="text-center mb-4 fs-3">Return Flight Information</h5>
        <Row className="mb-4 align-items-center text-center text-md-start">
          <Col md={6} className="d-flex align-items-center justify-content-center justify-content-md-start mb-3 mb-md-0">
            <img
              src={`https://content.airhex.com/content/logos/airlines_${flight.returnFlight?.carrierCode}_64_64_s.png`}
              alt={flight.returnFlight?.carrierCode}
              width="70"
              height="70"
              className="me-3"
            />
            <div>
              <div className="fw-bold fs-3">{getAirlineName(flight.returnFlight?.carrierCode)}</div>
              <div className="fs-5">
                <strong>From:</strong>{' '}
                <Badge bg="secondary" className="fs-5 text-uppercase">
                  {getAirportName(flight.returnFlight?.departure?.iataCode)}
                </Badge>
              </div>
            </div>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="fs-5">
              <strong>To:</strong>{' '}
              <Badge bg="secondary" className="fs-5 text-uppercase">
                {getAirportName(flight.returnFlight?.arrival?.iataCode)}
              </Badge>
            </div>
          </Col>
        </Row>

        <Row className="mb-4 text-center text-md-start">
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start fs-4 fw-semibold">
              <FaPlaneDeparture className="me-2 text-primary" />
              Departure: {new Date(flight.returnFlight?.departure?.at).toLocaleString()}
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex align-items-center justify-content-center justify-content-md-end fs-4 fw-semibold">
              <FaPlaneArrival className="me-2 text-success" />
              Arrival: {new Date(flight.returnFlight?.arrival?.at).toLocaleString()}
            </div>
          </Col>
        </Row>
      </>
    )}

    {/* Total Price */}
    <Row className="mt-4">
      <Col className="text-center">
        <div className="fs-2 fw-bold">
          Total Price:{' '}
          <span className="text-success">
            {flight.price?.total} {flight.price?.currency}
          </span>
        </div>
      </Col>
    </Row>
  </Card.Body>
</Card>

      {/* Passenger Details */}
      <Card className="mb-4 shadow-sm border-0">
  <Card.Header className="bg-info text-white text-center">
    <h4 className="mb-0 display-6">
      <FaUser className="me-2" /> Passenger Details
    </h4>
  </Card.Header>
  <Card.Body>
    <ListGroup variant="flush">
      {passengers.map((p, idx) => (
        <ListGroup.Item key={idx} className="py-4">
          <h4 className="fw-bold mb-3">
            Passenger {idx + 1}: {p.firstName} {p.lastName}
          </h4>
          <Row className="mb-3 fs-5">
            <Col md={4}>
              <strong>DOB:</strong> {p.dob}
            </Col>
            <Col md={4}>
              <strong>Gender:</strong> {p.gender}
            </Col>
            <Col md={4}>
              <strong>Nationality:</strong> {p.nationality}
            </Col>
          </Row>
          <Row className="mb-3 fs-5">
            <Col md={4}>
              <strong>
                <FaEnvelope className="me-2 text-primary" />
                Email:
              </strong>{' '}
              {p.email}
            </Col>
            <Col md={4}>
              <strong>
                <FaPhone className="me-2 text-success" />
                Phone:
              </strong>{' '}
              {p.phone}
            </Col>
          </Row>
          <Row className="fs-5">
            <Col md={4}>
              <strong>
                <FaPassport className="me-2 text-info" />
                Passport No:
              </strong>{' '}
              {p.passportNumber}
            </Col>
            <Col md={4}>
              <strong>Expiry:</strong> {p.passportExpiry}
            </Col>
            <Col md={4}>
              <strong>Issued By:</strong> {p.issuanceCountry}
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Card.Body>
</Card>


      {/* Booking Section */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0 display-6"><FaPlaneArrival /> Finalize Booking</h5>
        </Card.Header>
        <Card.Body>
          <OrderDetails flight={flight} passengers={passengers} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BaggageDetails;

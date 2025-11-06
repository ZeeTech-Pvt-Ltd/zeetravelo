import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import { FaClock, FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { useSessionTimeout } from '../Components/SessionTimeoutContext';
import './BookingDetails.css';


const airportNameMap = airports.reduce((map, airport) => {
  map[airport.iata] = airport.name;
  return map;
}, {});

const getAirlineName = (iataCode) => {
  const match = airlineData.find((airline) => airline.iata === iataCode);
  return match ? match.name : iataCode;
};


const BookingDetails = ({ confirmedPricingData }) => {
  const { startPricingTimer } = useSessionTimeout();
  const { state } = useLocation();
  const navigate = useNavigate();
  const flight = state?.flight;
  const tripType = state?.tripType;

  console.log('Flight:', flight);
  console.log('Trip Type', tripType);

  useEffect(() => {
    startPricingTimer(); // triggers redirect after 15 minutes
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!flight) {
      console.warn("❗ No flight data received via navigation state.");
    }
  }, [flight]);

  const [passengers, setPassengers] = useState([
    {
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      nationality: '',
      email: '',
      phone: '',
      passportNumber: '',
      passportExpiry: '',
      issuanceCountry: '',
    },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmitBooking = () => {
    const defaultPassenger = {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1990-01-01',
      gender: 'MALE',
      nationality: 'ES',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      passportNumber: 'X1234567',
      passportExpiry: '2030-12-31',
      issuanceCountry: 'ES',
    };

    const cleanedPassengers = passengers.map((p) => ({
      firstName: p.firstName || defaultPassenger.firstName,
      lastName: p.lastName || defaultPassenger.lastName,
      dob: p.dob || defaultPassenger.dob,
      gender: p.gender || defaultPassenger.gender,
      nationality: p.nationality || defaultPassenger.nationality,
      email: p.email || defaultPassenger.email,
      phone: p.phone || defaultPassenger.phone,
      passportNumber: p.passportNumber || defaultPassenger.passportNumber,
      passportExpiry: p.passportExpiry || defaultPassenger.passportExpiry,
      issuanceCountry: p.issuanceCountry || defaultPassenger.issuanceCountry,
    }));

    navigate('/baggage-details', {
      state: {
        flight,
        passengers: cleanedPassengers,
        searchParams: {
          origin: flight.origin,
          destination: flight.destination,
          date: flight.date,
          returnDate: flight.returnDate, // Include return date if it's a return flight
          adults: passengers.length,
          tripType: flight.returnDate ? 'return' : 'one-way', // Dynamically add trip type
        },
      },
    });
  };

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)",
    "Congo (Kinshasa)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];


  const segments = flight?.itineraries?.[0]?.segments || [];

  // Group traveler types
  const travelerCountMap = flight?.travelerPricings?.reduce((acc, tp) => {
    acc[tp.travelerType] = (acc[tp.travelerType] || 0) + 1;
    return acc;
  }, {});


  if (!flight) {
    return (
      <h3 className="text-center mt-5 text-danger">
        ⚠️ No flight selected. Please go back and select a flight.
      </h3>
    );
  }

  return (
    <div className="booking-details-container">
      <div className="booking-details-header">
        <Container>
          <h1 className="booking-details-title">Flight Details</h1>
        </Container>
      </div>

      <Container>

      <Row className="mb-4">
        {/* Flight Details (75%) */}
        <Col md={9}>
          {flight?.itineraries?.map((itinerary, i) => (
            <Card key={i} className="flight-details-card">
              <Card.Body className="flight-card-body">
                <h5 className="flight-route-header">
                  <FaPlaneDeparture className="me-2" style={{ color: '#2563eb' }} />
                  {itinerary.segments[0].departure.iataCode} →{" "}
                  {itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                  <FaPlaneArrival className="ms-2" style={{ color: '#2563eb' }} />
                  <span className="ms-3" style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
                    {new Date(itinerary.segments[0].departure.at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </h5>

                {itinerary.segments.map((segment, index) => {
                  const departure = new Date(segment.departure.at);
                  const arrival = new Date(segment.arrival.at);
                  const stopOver =
                    index < itinerary.segments.length - 1
                      ? Math.round(
                        (new Date(itinerary.segments[index + 1].departure.at) -
                          new Date(segment.arrival.at)) / 60000
                      )
                      : null;

                  return (
                    <div key={index}>
                      <div className="segment-card">
                        <div className="segment-time">
                          {departure.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                          <span className="mx-2" style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>
                          {arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>

                        <div className="segment-route">
                          <span className="fw-bold" style={{ color: '#1e293b' }}>{segment.departure.iataCode}</span>{" "}
                          {airportNameMap[segment.departure.iataCode] || "Unknown Airport"} →{" "}
                          <span className="fw-bold" style={{ color: '#1e293b' }}>{segment.arrival.iataCode}</span>{" "}
                          {airportNameMap[segment.arrival.iataCode] || "Unknown Airport"}
                        </div>

                        <div className="segment-info d-flex align-items-center mb-3">
                          <FaClock className="me-2" style={{ color: '#f59e0b' }} />
                          <strong>Flight Time:</strong>{" "}
                          <span className="ms-1">
                            {segment.duration.replace("PT", "").toLowerCase()}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
                          <div className="d-flex align-items-center">
                            <img
                              src={`https://content.airhex.com/content/logos/airlines_${segment.carrierCode}_64_64_s.png`}
                              alt={segment.carrierCode}
                              width="40"
                              height="40"
                              className="me-3 airline-logo"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            <div>
                              <div className="fw-bold" style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '4px' }}>
                                {getAirlineName(segment.carrierCode)}
                              </div>
                              <div className="segment-info">
                                <strong>Flight</strong> {segment.number} ·{" "}
                                <strong>Aircraft</strong> {segment.aircraft?.code || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="mb-2">
                              <span className="fw-semibold" style={{ color: '#1e293b' }}>Cabin:</span>{" "}
                              <span style={{ color: '#2563eb', fontWeight: 600 }}>{segment.cabin || "Coach"}</span>
                            </div>
                            <div>
                              <span className="fw-semibold" style={{ color: '#1e293b' }}>Brand:</span>{" "}
                              <span style={{ color: '#64748b' }}>{segment.brandName || "Economy Light"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {stopOver && (
                        <div className="stopover-info">
                          <FaClock className="me-2" style={{ color: '#2563eb' }} />
                          <span className="fw-semibold">Stop {index + 1}:</span>{" "}
                          {Math.floor(stopOver / 60)}h {stopOver % 60}m in{" "}
                          <strong>{segment.arrival.iataCode}</strong>{" "}
                          <span>
                            {airportNameMap[segment.arrival.iataCode] || "Unknown Airport"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          ))}
        </Col>

        {/* Pricing Details (25%) */}
        <Col md={3}>
          <div className="pricing-card">
            <h4 className="pricing-title">Pricing Details</h4>

            {Object.entries(travelerCountMap).map(([type, count], index) => {
              const pricing = flight.travelerPricings.find(tp => tp.travelerType === type);
              return (
                <div key={index} className="pricing-item">
                  <div className="pricing-item-title">
                    {count}x {type} {count > 1 ? 'Passengers' : 'Passenger'}
                  </div>
                  <div className="pricing-item-price">
                    {pricing?.price.total} {pricing?.price.currency}
                  </div>
                </div>
              );
            })}
          </div>
        </Col>

      </Row>


      <hr className="section-divider" />
      <h2 className='fw-bold mb-4' style={{ fontSize: '2rem', color: '#1e293b', letterSpacing: '-0.02em' }}>Passenger Details</h2>

      {passengers?.map((passenger, index) => (
        <Card key={index} className="passenger-card">
          <Card.Body className="passenger-card-body">
            <h4 className="passenger-number">Passenger {index + 1}</h4>

            <Form>
              {/* Personal Details */}
              <div className="mb-4">
                <h5 className="fw-bold mb-4">
                  <span className="section-badge">
                    Personal Details
                  </span>
                </h5>

                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter first name"
                        value={passenger.firstName}
                        onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter last name"
                        value={passenger.lastName}
                        onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={passenger.dob}
                        onChange={(e) => handleChange(index, 'dob', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Gender</Form.Label>
                      <Form.Select
                        value={passenger.gender}
                        onChange={(e) => handleChange(index, 'gender', e.target.value)}
                        className="booking-form-select"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Nationality</Form.Label>
                      <Form.Select
                        value={passenger.nationality}
                        onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                        className="booking-form-select"
                      >
                        <option value="">Select nationality</option>
                        {countries.map((country, idx) => (
                          <option key={idx} value={country}>
                            {country}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Contact Details */}
              <div className="mb-4 mt-5">
              <h5 className="fw-bold mb-4">
  <span className="section-badge">
    Contact Details
  </span>
</h5>
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        value={passenger.email}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter phone number"
                        value={passenger.phone}
                        onChange={(e) => handleChange(index, 'phone', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Passport Details */}
              <div>
              <h5 className="fw-bold mb-4">
  <span className="section-badge">
    Passport Details
  </span>
</h5>
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Passport Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter passport number"
                        value={passenger.passportNumber}
                        onChange={(e) => handleChange(index, 'passportNumber', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Expiry Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={passenger.passportExpiry}
                        onChange={(e) => handleChange(index, 'passportExpiry', e.target.value)}
                        className="booking-form-control"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="booking-form-label">Issuance Country</Form.Label>
                      <Form.Select
                        value={passenger.issuanceCountry}
                        onChange={(e) => handleChange(index, 'issuanceCountry', e.target.value)}
                        className="booking-form-select"
                      >
                        <option value="">Select country</option>
                        {countries.map((country, idx) => (
                          <option key={idx} value={country}>
                            {country}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ))}



      <div className="d-flex justify-content-center mt-5 mb-5">
        <Button variant="primary" size="lg" onClick={handleSubmitBooking} className="confirm-booking-btn">
          Confirm Booking
        </Button>
      </div>

      {/* {error && (
  <Card className="mb-4 shadow-sm border-danger border-2">
    <Card.Header className="bg-danger text-white text-center">
      <h4 className="mb-0">
        <FaExclamationTriangle className="me-2" />
        Error
      </h4>
    </Card.Header>
    <Card.Body>
      <Alert variant="danger" className="fs-5">
        {error.message || "An unexpected error occurred."}
      </Alert>
    </Card.Body>
  </Card>
)} */}

      </Container>
    </div>
  );
};

export default BookingDetails;

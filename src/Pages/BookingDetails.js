import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaClock } from "react-icons/fa";
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { useSessionTimeout } from '../Components/SessionTimeoutContext';


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
    <div className="container mt-4">
      <h1 className="mb-2 display-6">Flight Details</h1>

      {/* Divider */}
      <hr className="my-3 border-top border-secondary-subtle" />

      <Row className="mb-2">
        {/* Flight Details (75%) */}
        <Col md={9}>
          {flight?.itineraries?.map((itinerary, i) => (
            <Card key={i} className="mb-4 shadow-sm border-0">
              <Card.Body className="bg-light p-4 rounded">
                <h5 className="fw-bold fs-4 mb-3">
                  {itinerary.segments[0].departure.iataCode} to{" "}
                  {itinerary.segments[itinerary.segments.length - 1].arrival.iataCode} –{" "}
                  {new Date(itinerary.segments[0].departure.at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
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
                      <div className="p-4 border rounded mb-3 bg-white shadow-sm">
                        <div className="mb-2 fs-5 fw-semibold">
                          {departure.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                          <span className="text-muted mx-2">—</span>
                          {arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>

                        <div className="mb-2 small text-muted fs-6">
                          <span className="fw-semibold">{segment.departure.iataCode}</span>{" "}
                          {airportNameMap[segment.departure.iataCode] || "Unknown Airport"} →{" "}
                          <span className="fw-semibold">{segment.arrival.iataCode}</span>{" "}
                          {airportNameMap[segment.arrival.iataCode] || "Unknown Airport"}
                        </div>

                        <div className="mb-3 text-muted d-flex align-items-center fs-6">
                          <FaClock className="me-2" />
                          Flight Time:{" "}
                          <span className="ms-1">
                            {segment.duration.replace("PT", "").toLowerCase()}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between fs-6">
                          <div className="d-flex align-items-center">
                            <img
                              src={`https://content.airhex.com/content/logos/airlines_${segment.carrierCode}_64_64_s.png`}
                              alt={segment.carrierCode}
                              width="32"
                              height="32"
                              className="me-2"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            <div>
                              <div className="fw-semibold">
                                {getAirlineName(segment.carrierCode)}
                              </div>
                              <div>
                                <strong>Flight</strong> {segment.number} ·{" "}
                                <strong>Aircraft</strong> {segment.aircraft?.code || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="text-end">
                            <div>
                              <span className="fw-semibold">Cabin:</span>{" "}
                              {segment.cabin || "Coach"}
                            </div>
                            <div>
                              <span className="fw-semibold">Brand:</span>{" "}
                              {segment.brandName || "Economy Light"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {stopOver && (
                        <div className="mb-4 ms-2 ps-3 border-start border-3 fs-6">
                          <span className="fw-semibold">Stop {index + 1}:</span>{" "}
                          {Math.floor(stopOver / 60)}h {stopOver % 60}m in{" "}
                          <strong>{segment.arrival.iataCode}</strong>{" "}
                          <span className="text-muted">
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
          <div className="bg-light p-3 rounded border shadow-sm" style={{ minHeight: "40%" }}>
            <h4 className="border-bottom pb-2 mb-3 fw-semibold text-dark">Pricing Details</h4>

            {Object.entries(travelerCountMap).map(([type, count], index) => {
              const pricing = flight.travelerPricings.find(tp => tp.travelerType === type);
              return (
                <div key={index} className="mb-4">
                  <h6 className="mb-2">
                    <strong>{count}x Passenger{count > 1 ? 's' : ''}:</strong> {type}
                  </h6>
                  {/* <p className="mb-1">
            <strong>Base:</strong> {pricing?.price.base} {pricing?.price.currency}
          </p> */}
                  <p className="mb-1">
                    <strong>Total:</strong> {pricing?.price.total} {pricing?.price.currency}
                  </p>
                </div>
              );
            })}
          </div>
        </Col>

      </Row>


      <hr />
      <h3 className='fw-semibold'>Passenger Details</h3>

      {passengers?.map((passenger, index) => (
        <Card key={index} className="mb-4 border-primary shadow-sm rounded-3">
          <Card.Body className="p-4">
            <h4 className="mb-3 fw-bold text">Passenger {index + 1}</h4>

            <Form>
              {/* Personal Details */}
              <div className="mb-2">
                <h5 className="fw-bold mb-4">
                  <span className="badge bg-dark  fs-6 px-3 py-2">
                    Personal Details
                  </span>
                </h5>

                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter first name"
                        value={passenger.firstName}
                        onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter last name"
                        value={passenger.lastName}
                        onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={passenger.dob}
                        onChange={(e) => handleChange(index, 'dob', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Gender</Form.Label>
                      <Form.Select
                        value={passenger.gender}
                        onChange={(e) => handleChange(index, 'gender', e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Nationality</Form.Label>
                      <Form.Select
                        value={passenger.nationality}
                        onChange={(e) => handleChange(index, 'nationality', e.target.value)}
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
              <div className="mb-5 mt-5">
              <h5 className="fw-bold mb-4">
  <span className="badge bg-dark fs-6 px-3 py-2">
    Contact Details
  </span>
</h5>
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        value={passenger.email}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter phone number"
                        value={passenger.phone}
                        onChange={(e) => handleChange(index, 'phone', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Passport Details */}
              <div>
              <h5 className="fw-bold mb-4">
  <span className="badge bg-dark fs-6 px-3 py-2">
    Passport Details
  </span>
</h5>
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Passport Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter passport number"
                        value={passenger.passportNumber}
                        onChange={(e) => handleChange(index, 'passportNumber', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Expiry Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={passenger.passportExpiry}
                        onChange={(e) => handleChange(index, 'passportExpiry', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Issuance Country</Form.Label>
                      <Form.Select
                        value={passenger.issuanceCountry}
                        onChange={(e) => handleChange(index, 'issuanceCountry', e.target.value)}
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



      <br />
      <div className="d-flex justify-content-center mt-2">
        <Button variant="primary" size="lg" onClick={handleSubmitBooking}>
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

      <div style={{ marginBottom: '100px' }}></div>
    </div>
  );
};

export default BookingDetails;

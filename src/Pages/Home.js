import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import FlightBg from '../Assets/FlightBg.jpg';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Card,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { NavLink } from 'react-router-dom';
import { FaPlaneDeparture, FaHotel, FaCarSide, FaShip, FaTags } from 'react-icons/fa';
// import { useSessionTimeout } from '../Components/SessionTimeoutContext';
import './Home.css';
import TravelBanner from '../Components/TravelBanner';
import Footer from '../Components/Footer';
import PopularFlights from '../Components/PopularFlight';
import TravelRecommend from '../Components/TravelRecommend';


function Home({ header = 'Search Flights', setSearchParams }) {
  const [tripType, setTripType] = useState('oneway');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('Economy');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const dropdownRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [flights, setFlights] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  // const { startTimer } = useSessionTimeout();


  const navigate = useNavigate();


  const adjustCount = (setter, newValue) => {
    const total = (setter === setAdults ? newValue : adults) +
      (setter === setChildren ? newValue : children) +
      (setter === setInfants ? newValue : infants);
    if (newValue >= 0 && total <= 9) setter(newValue);
  };

  const fetchSuggestions = async (keyword, setSuggestions) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/locations/airports?keyword=${keyword}`);
      setSuggestions(response.data.data);
    } catch {
      setSuggestions([]);
    }
  };

  const extractIataCode = (location) => {
    const match = location.match(/\((.*?)\)/);
    return match ? match[1] : '';
  };



  const handleSearch = () => {
    // startTimer();

    const triggerSearch = () => {
        const params = {
          origin: extractIataCode(from),
          destination: extractIataCode(to),
          date: departureDate.toISOString().split('T')[0],
          returnDate: tripType === 'return' && returnDate ? returnDate.toISOString().split('T')[0] : '',
          adults,
          children,
          infants,
          travelClass,
          tripType,
          searchId: Date.now()
        };
    
        localStorage.setItem('lastSearchParams', JSON.stringify(params));
        setSearchParams(params);
    
        // Convert to query string and navigate
        const query = new URLSearchParams(params).toString();
        navigate(`/flights?${query}`);
      };


    //setSearchParams({ triggerSearch }); // Save the search for reuse after timeout

    // Validation logic remains the same...
    setError(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalPassengers = adults + children + infants;

    if (!from.trim() || !to.trim()) {
      setError('Please select both origin and destination airports.');
      return;
    }
    if (extractIataCode(from) === extractIataCode(to)) {
      setError('Origin and destination cannot be the same.');
      return;
    }
    if (!departureDate) {
      setError('Please select a departure date.');
      return;
    }
    if (departureDate < today) {
      setError('Departure date cannot be in the past.');
      return;
    }
    if (tripType === 'return') {
      if (!returnDate) {
        setError('Please select a return date.');
        return;
      }
      if (returnDate <= departureDate) {
        setError('Return date must be after departure date.');
        return;
      }
    }
    if (adults < 1) {
      setError('At least one adult passenger is required.');
      return;
    }
    if (totalPassengers > 9) {
      setError('You can only book up to 9 passengers in total.');
      return;
    }

    triggerSearch(); // Perform the search
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mouseclick', handleClickOutside);
    return () => document.removeEventListener('mouseclick', handleClickOutside);
  }, []);

  return (
    <div>
    <div
      style={{
        backgroundImage: `url(${FlightBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: '50px',
        paddingBottom: '40px',
      }}
    >
      <Container className="my-5">
      <div className="kayak-tab-container">
      <NavLink
        to="/flights"
        className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}
      >
        <FaPlaneDeparture className="icon" />
        <span>Flights</span>
      </NavLink>

      <NavLink
        to="/hotels"
        className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}
      >
        <FaHotel className="icon" />
        <span>Hotels</span>
      </NavLink>

      <NavLink
        to="/cars"
        className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}
      >
        <FaCarSide className="icon" />
        <span>Cars</span>
      </NavLink>

      <NavLink
        to="/cruise"
        className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}
      >
        <FaShip className="icon" />
        <span>Cruise</span>
      </NavLink>

      <NavLink
        to="/deals"
        className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}
      >
        <FaTags className="icon" />
        <span>Deals</span>
      </NavLink>
    </div>

        <Card className="p-4 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <Form ref={dropdownRef}>
            <Row className="mb-3">
              <Col>
                <Form.Check inline label="One-way" type="radio" name="tripType" value="oneway" checked={tripType === 'oneway'} onChange={(e) => setTripType(e.target.value)} />
                <Form.Check inline label="Return" type="radio" name="tripType" value="return" checked={tripType === 'return'} onChange={(e) => setTripType(e.target.value)} />
                <Form.Check inline label="Multi-city" type="radio" name="tripType" value="multicity" checked={tripType === 'multicity'} disabled />
              </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="align-items-end">
              <Col md={2} className="position-relative">
                <Form.Label className="fw-semibold">From</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="From Airport"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    fetchSuggestions(e.target.value, setFromSuggestions);
                    setShowFromSuggestions(true);
                  }}
                />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <ListGroup className="position-absolute w-100" style={{ zIndex: 2000, minWidth: '350px' }}>
                    {fromSuggestions.map((sug) => (
                      <ListGroup.Item
                        key={sug.id}
                        action
                        onClick={() => {
                          setFrom(`${sug.name} (${sug.iataCode})`);
                          setShowFromSuggestions(false);
                        }}

                      >
                        {sug.name} ({sug.iataCode}) - {sug.address.cityName}, {sug.address.countryCode}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>

              <Col md="auto" className="d-flex align-items-end">
                <Button
                  variant="light"
                  onClick={() => {
                    const temp = from;
                    setFrom(to);
                    setTo(temp);
                  }}
                  title="Swap airports"
                >
                  ⇄
                </Button>
              </Col>

              <Col md={2} className="position-relative">
                <Form.Label className="fw-semibold">To</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="To Airport"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    fetchSuggestions(e.target.value, setToSuggestions);
                    setShowToSuggestions(true);
                  }}
                />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <ListGroup className="position-absolute w-100" style={{ zIndex: 2000, minWidth: '350px' }}>
                    {toSuggestions.map((sug) => (
                      <ListGroup.Item
                        key={sug.id}
                        action
                        onClick={() => {
                          setTo(`${sug.name} (${sug.iataCode})`);
                          setShowToSuggestions(false);
                        }}
                      >
                        {sug.name} ({sug.iataCode}) - {sug.address.cityName}, {sug.address.countryCode}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>

              {/* Date picker(s) */}
              {tripType === 'return' ? (
                <Col md={3} className="d-flex flex-column">
                  <Form.Label className="mb-1 fw-semibold">Departure & Return</Form.Label>
                  <DatePicker
                    selectsRange
                    startDate={departureDate}
                    endDate={returnDate}
                    onChange={([start, end]) => {
                      setDepartureDate(start);
                      setReturnDate(end);
                    }}
                    className="form-control"
                    placeholderText="Departure - Return"
                    minDate={new Date()}
                    monthsShown={2}
                  />
                </Col>
              ) : (
                <Col md={3}>
                  <Form.Label className="fw-semibold">Departure</Form.Label>
                  <DatePicker
                    selected={departureDate}
                    onChange={(date) => setDepartureDate(date)}
                    className="form-control"
                    placeholderText="Departure Date"
                    minDate={new Date()}

                  />
                </Col>
              )}

              {/* Passengers & Class */}
              <Col md={tripType === 'return' ? 3 : 3} className="position-relative" ref={dropdownRef}>
                <Form.Label className="fw-semibold">Passengers & Class</Form.Label>
                <div className="dropdown w-100">
                  <Button
                    variant="outline-secondary"
                    className="form-control text-start d-flex justify-content-between align-items-center"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {`${adults} Adult${adults > 1 ? 's' : ''}, ${children} Children, ${infants} Infants, ${travelClass}`}
                    </span>
                    <span className="ms-2 dropdown-toggle" />
                  </Button>

                  {showDropdown && (
                    <div className="dropdown-menu show p-3 shadow" style={{ zIndex: 1050, width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
                      {['Adults', 'Children', 'Infants'].map((type, idx) => {
                        const count = { Adults: adults, Children: children, Infants: infants }[type];
                        const setCount = { Adults: setAdults, Children: setChildren, Infants: setInfants }[type];
                        return (
                          <div className="d-flex justify-content-between align-items-center mb-2" key={idx}>
                            <span>{type}</span>
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="outline-secondary" size="sm" onClick={() => adjustCount(setCount, count - 1)} disabled={count <= 0}>–</Button>
                              <span>{count}</span>
                              <Button variant="outline-secondary" size="sm" onClick={() => adjustCount(setCount, count + 1)} disabled={adults + children + infants >= 9}>+</Button>
                            </div>
                          </div>
                        );
                      })}

                      <Form.Group className="mt-3">
                        <Form.Label>Class</Form.Label>
                        <Form.Select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
                          <option value="Economy">Economy</option>
                          <option value="Business">Business</option>
                          <option value="First">First</option>
                        </Form.Select>
                      </Form.Group>

                      <div className="text-end mt-3">
                        <Button variant="primary" size="sm" onClick={() => setShowDropdown(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Col>

              {/* Search Button */}
              <Col md={1}>
                <Button variant="primary" onClick={handleSearch} disabled={loading || !from.trim()}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                </Button>
              </Col>
            </Row>

          </Form>
        </Card>
        
      </Container>
      
    </div>
    <TravelRecommend/>
    <TravelBanner/>
    <PopularFlights/>
    <Footer/>
    </div>
  );
}

export default Home;

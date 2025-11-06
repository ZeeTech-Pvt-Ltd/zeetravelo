// React & Router
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
// Bootstrap Components
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Spinner,
  Card,
  Alert,
} from 'react-bootstrap';

// Font Awesome Icons (react-icons)
import {
  FaPlaneDeparture,
  FaHotel,
  FaCarSide,
  FaShip,
  FaTags,
} from 'react-icons/fa';

// Custom Hooks and Styles
import { useSessionTimeout } from '../Components/SessionTimeoutContext';
import './AirportSearch.css';

// Background image or asset
import FlightBg from '../Assets/FlightBg.jpg'; // adjust path as needed


function AirportSearch({ header = 'Search Flights', setSearchParams }) {
  const [searchParams] = useSearchParams();
  const { startTimer } = useSessionTimeout();

  const parseDateParam = (param) => {
    const value = searchParams.get(param);
    if (!value) return null;
    // Parse date string (YYYY-MM-DD) in local time to avoid timezone shift
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };
  const navigate = useNavigate();
  const [tripType, setTripType] = useState(searchParams.get('tripType') || 'oneway');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState(() => parseDateParam('date'));
  const [returnDate, setReturnDate] = useState(() => parseDateParam('returnDate'));
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults')) || 1);
  const [children, setChildren] = useState(parseInt(searchParams.get('children')) || 0);
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants')) || 0);
  const [travelClass, setTravelClass] = useState((searchParams.get('travelClass') || 'ECONOMY').toUpperCase());

  // Suggestions
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);


  const adjustCount = (type, value) => {
    if (type === 'adults') setAdults(prev => Math.max(1, prev + value));
    if (type === 'children') setChildren(prev => Math.max(0, prev + value));
    if (type === 'infants') setInfants(prev => Math.max(0, prev + value));
  };


  // Auto-resolve airport names from IATA codes
  useEffect(() => {
    const resolveAirportName = async (code, setter) => {
  if (!code) return;
  try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const res = await axios.get(`${API_BASE_URL}/api/locations/airportByCode?code=${code}`);
    const data = res.data?.data?.[0]; // ✅ FIXED: use first airport result
    if (data && data.name && data.iataCode) {
      setter(`${data.name} (${data.iataCode})`);
    } else {
      setter(code);
    }
  } catch {
    setter(code);
  }
};

    resolveAirportName(searchParams.get('origin'), setFrom);
    resolveAirportName(searchParams.get('destination'), setTo);
  }, [searchParams]);

  const fetchSuggestions = async (keyword, setSuggestions) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    try {
              const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
              const response = await axios.get(`${API_BASE_URL}/api/locations/airports?keyword=${keyword}`);
      setSuggestions(response.data.data);
    } catch {
      setSuggestions([]);
    }
  };

  const extractIataCode = (location) => {
    const match = location.match(/\((.*?)\)/);
    return match ? match[1] : '';
  };

  const formatDateToYYYYMMDDLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = () => {
    startTimer();
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

    const params = {
      origin: extractIataCode(from),
      destination: extractIataCode(to),
      date: formatDateToYYYYMMDDLocal(departureDate),
      returnDate: tripType === 'return' && returnDate ? formatDateToYYYYMMDDLocal(returnDate) : '',
      adults,
      children,
      infants,
      travelClass,
      tripType,
      searchId: Date.now(),
    };

    setSearchParams(params);
    navigate(`/flights?${new URLSearchParams(params).toString()}`, { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(11, 17, 30, 0.45), rgba(11, 17, 30, 0.45)), url(${FlightBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: '70px',
        paddingBottom: '48px',
      }}
    >
      <Container className="my-3">
        <div className="site-container text-center" style={{ marginBottom: '16px' }}>
          <h1 className="hero-title">Find your next flight</h1>
          <p className="hero-subtitle">Compare deals across airlines and book in minutes</p>
        </div>
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

        <Card className="bookme-search-panel p-4 shadow-sm search-card">
          <Form ref={dropdownRef}>
            <Row className="mb-3 bookme-trip-pills">
              <Col>
                <Form.Check inline type="radio" name="tripType" value="oneway" id="trip-oneway" checked={tripType === 'oneway'} onChange={(e) => setTripType(e.target.value)} />
                <Form.Label htmlFor="trip-oneway" className="form-check-label">One Way</Form.Label>
                <Form.Check inline type="radio" name="tripType" value="return" id="trip-return" checked={tripType === 'return'} onChange={(e) => setTripType(e.target.value)} />
                <Form.Label htmlFor="trip-return" className="form-check-label">Round Trip</Form.Label>
                <Form.Check inline type="radio" name="tripType" value="multicity" id="trip-multi" checked={tripType === 'multicity'} disabled />
                <Form.Label htmlFor="trip-multi" className="form-check-label">Multi-City</Form.Label>
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
  );
}

export default AirportSearch;

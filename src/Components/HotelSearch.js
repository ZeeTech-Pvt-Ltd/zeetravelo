import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Row, Col, Spinner, Container } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import HotelBg from '../Assets/HotelBg.jpg';
import './HotelSearch.css';
import './AirportSearch.css';
import HotelModal from './HotelModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faMapMarkerAlt, faBarcode, faPlane, faRulerCombined, faClock, faDollarSign, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FaPlaneDeparture, FaHotel, FaCarSide, FaShip, FaTags } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import SidebarHotel from './SidebarHotel';
import HotelOffersButton from './HotelOffersButton';

const HotelSearch = () => {
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [cityCode, setCityCode] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hotelOffers, setHotelOffers] = useState([]);
  const [error, setError] = useState(null);

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
  };

  const fetchLocationSuggestions = async (keyword) => {
    if (!keyword.trim()) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_BASE_URL}/api/locations?keyword=${keyword}`);
      setLocationSuggestions(response.data.data || []);
      setShowLocationSuggestions(true);
    } catch (err) {
      setLocationSuggestions([]);
      console.error('Location fetch error:', err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${API_BASE_URL}/api/hotels`, {
        params: {
          cityCode,
          radius: 5,
          radiusUnit: 'KM',
          hotelSource: 'ALL',
          checkInDate: checkInDate?.toISOString().split('T')[0],
          checkOutDate: checkOutDate?.toISOString().split('T')[0],
          adults: guests,      // match backend's param name
          roomQuantity: rooms, // match backend's param name
          currency: 'USD',     // optional, you can hardcode or make dynamic
        },
      });
      setHotels(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setHotels([]);
    }
    setLoading(false);
  };

  const fetchHotelOffers = async (hotelId) => {
  if (!hotelId || !checkInDate || !checkOutDate) {
    setError('Missing required fields to fetch offers.');
    return;
  }

  // setLoading(true);
  // setError(null);

  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${API_BASE_URL}/api/fetch-hotel-offers`, {
      params: {
        hotelIds: hotelId,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        adults: guests,
        roomQuantity: rooms,
        currency: 'USD',
      },
    });

    console.log("Offers fetched:", response.data);
    setHotelOffers(response.data.data || []);
  } catch (err) {
    console.error("Offer fetch error:", err.response?.data || err.message);
    setError('Failed to fetch hotel offers.');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(11, 17, 30, 0.45), rgba(11, 17, 30, 0.45)), url(${HotelBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '70px',
          paddingBottom: '48px',
        }}
      >
        <Container className="my-3">
          <div className="site-container text-center" style={{ marginBottom: '16px' }}>
            <h1 className="hero-title">Find your perfect hotel</h1>
            <p className="hero-subtitle">Compare prices and book your stay</p>
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
              <Form>
              <Row className="align-items-end g-3">
                <Col xs={12} sm={6} md={4} lg={4} className="position-relative">
                  <Form.Group controlId="location">
                    <Form.Label className="fw-semibold">Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter a city name"
                      value={location}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLocation(value);
                        fetchLocationSuggestions(value);
                      }}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                      }}
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <ul className="list-group position-absolute z-3 w-100">
                        {locationSuggestions.map((suggestion, idx) => (
                          <li
                            key={idx}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setLocation(suggestion.name);
                              if (suggestion.subType === 'CITY') {
                                setCityCode(suggestion.iataCode);
                              } else {
                                console.warn('Selected location is not a CITY, skipping.');
                              }
                              setShowLocationSuggestions(false);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {suggestion.name} ({suggestion.iataCode})
                          </li>
                        ))}
                      </ul>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={4} lg={4}>
                  <Form.Group controlId="dateRange">
                    <Form.Label className="fw-semibold">Check-In & Check-Out</Form.Label>
                    <DatePicker
                      selectsRange
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      onChange={(update) => {
                        setCheckInDate(update[0]);
                        setCheckOutDate(update[1]);
                      }}
                      minDate={new Date()}
                      placeholderText="Select your stay dates"
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </Form.Group>
                </Col>

                <Col xs={6} sm={3} md={1} lg={1}>
                  <Form.Group controlId="guests">
                    <Form.Label className="fw-semibold">Guests</Form.Label>
                    <Form.Select
                      aria-label="Select number of guests"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={6} sm={3} md={1} lg={1}>
                  <Form.Group controlId="rooms">
                    <Form.Label className="fw-semibold">Rooms</Form.Label>
                    <Form.Select
                      aria-label="Select number of rooms"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value))}
                    >
                      {[...Array(5)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={12} md={2} lg={2} className="search-button-col">
                  <Button
                    variant="primary"
                    onClick={handleSearch}
                    disabled={loading || !cityCode || !checkInDate || !checkOutDate}
                    className="w-100"
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                  </Button>
                </Col>
              </Row>
              </Form>
            </Card>
          </Container>
        </div>

      <div className="position-relative" style={{
        backgroundColor: hotels.length > 0 ? "rgb(245, 245, 245)" : "white",
        paddingTop: "50px"
      }}>
        <Container >
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2">Loading hotels...</div>
            </div>
          ) : hotels.length > 0 ? (
            <Row  >
              <Col md={3}>

                <div className="sticky-sidebar" >
                  <SidebarHotel />
                  
                </div>


              </Col>

              <Col md={9}>
                <Row>
                  {hotels.map((hotel, index) => (
                    <Col key={index} md={12} className="mb-4">
                      <Card className="modern-hotel-card d-flex flex-row overflow-hidden shadow-sm">
                        <div className="modern-hotel-img">
                          <img src={HotelBg} alt="Hotel" />
                          <span className="new-design-label">NEW DESIGN</span>
                        </div>
                        <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                          <div>
                            <h5 className="fw-bold mb-2">{hotel.name}</h5>
                            <p className="mb-1 text-muted">
                              <strong>Hotel ID:</strong> {hotel.hotelId}<br /><br />
                              <i className="bi bi-geo-alt"></i> {hotel.address?.cityName} • {hotel.distance?.value} {hotel.distance?.unit}
                            </p>
                            <div className="text-secondary small mb-2">{hotel.address?.lines?.join(', ')}</div>
                            <div className="d-flex gap-2 flex-wrap mb-2">
                              <span className="badge bg-light text-dark border">King size bed</span>
                              <span className="badge bg-light text-dark border">SuperRooms</span>
                              <span className="badge bg-light text-dark border">WiFi</span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-end mt-3">
                            <div>
                              <div className="text-muted small">From</div>
                              <div className="price-tag">£{hotel.price || 'N/A'}</div>
                            </div>
                            <div className="hotel-buttons">
                              <Button
                                variant="outline-primary"
                                onClick={() => handleSelectHotel(hotel)}
                                style={{ marginRight: '10px' }}
                              >
                                Select
                              </Button>
                              <Button variant="outline-secondary" onClick={() => fetchHotelOffers(hotel.hotelId)}>
  Search Offers
</Button>

                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          ) : null
          }
        </Container>

      </div>
      {selectedHotel && (
        <HotelModal
          show={showModal}
          onHide={handleCloseModal}
          hotel={selectedHotel}
        />
      )}

    </>
  );
};

export default HotelSearch;

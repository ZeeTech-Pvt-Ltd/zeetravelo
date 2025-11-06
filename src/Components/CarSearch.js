import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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
import { FaPlaneDeparture, FaHotel, FaCarSide, FaShip, FaTags } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import CarBg from '../Assets/CarBg.jpg';
import CarOffers from './CarOffers';
import './AirportSearch.css';

function CarSearchForm({ header }) {
  const [pickupDate, setPickupDate] = useState(null);
  const [dropoffDate, setDropoffDate] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const dropdownRef = useRef(null);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocationSuggestions = async (keyword) => {
    if (!keyword.trim()) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/locations?keyword=${keyword}`);
      setLocationSuggestions(response.data.data);
    } catch (err) {
      setLocationSuggestions([]);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    setCars([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (date) {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    return '';
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(11, 17, 30, 0.45), rgba(11, 17, 30, 0.45)), url(${CarBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '70px',
          paddingBottom: '48px',
        }}
      >
        <Container className="my-3">
          <div className="site-container text-center" style={{ marginBottom: '16px' }}>
            <h1 className="hero-title">Find your perfect car</h1>
            <p className="hero-subtitle">Compare deals and book your rental</p>
          </div>
          <div className="kayak-tab-container">
            <NavLink to="/flights" className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}>
              <FaPlaneDeparture className="icon" />
              <span>Flights</span>
            </NavLink>
            <NavLink to="/hotels" className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}>
              <FaHotel className="icon" />
              <span>Hotels</span>
            </NavLink>
            <NavLink to="/cars" className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}>
              <FaCarSide className="icon" />
              <span>Cars</span>
            </NavLink>
            <NavLink to="/cruise" className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}>
              <FaShip className="icon" />
              <span>Cruise</span>
            </NavLink>
            <NavLink to="/deals" className={({ isActive }) => `kayak-tab ${isActive ? 'active' : ''}`}>
              <FaTags className="icon" />
              <span>Deals</span>
            </NavLink>
          </div>

          <Card className="bookme-search-panel p-4 shadow-sm search-card">
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="fw-semibold">Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter City or Pickup Location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      fetchLocationSuggestions(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                  />
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <ListGroup style={{ zIndex: 2000 }} className="position-absolute w-100">
                      {locationSuggestions.map((suggestion) => (
                        <ListGroup.Item
                          key={suggestion.id}
                          action
                          onClick={() => {
                            setLocation(suggestion.name);
                            setShowLocationSuggestions(false);
                          }}
                        >
                          {suggestion.name} - {suggestion.city}, {suggestion.country}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
              </Row>

              <Row className="align-items-end g-3 mb-3">
                <Col md={3}>
                  <Form.Label className="fw-semibold">Pickup Date</Form.Label>
                  <DatePicker
                    selected={pickupDate}
                    onChange={(date) => setPickupDate(date)}
                    className="form-control"
                    placeholderText="Pickup Date"
                  />
                </Col>

                <Col md={3}>
                  <Form.Label className="fw-semibold">Dropoff Date</Form.Label>
                  <DatePicker
                    selected={dropoffDate}
                    onChange={(date) => setDropoffDate(date)}
                    className="form-control"
                    placeholderText="Dropoff Date"
                  />
                </Col>

                <Col md={2}>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleSearch}
                    disabled={loading || !location.trim() || !pickupDate || !dropoffDate}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Container>
      </div>

      <CarOffers/>
    </>
  );
}

export default CarSearchForm;

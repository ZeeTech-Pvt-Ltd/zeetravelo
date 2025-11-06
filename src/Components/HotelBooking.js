import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaHotel, FaUser, FaEnvelope, FaPhone, FaCreditCard, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const HotelBooking = () => {
  const location = useLocation();
  const hotel = location.state?.hotel;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cardHolderName: '',
    billingAddress: '',
  });

  const [bookingResponse, setBookingResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBooking = async () => {
    setLoading(true);
    setErrorMsg(null);

    const guestData = {
      name: {
        firstName: formData.firstName || 'John',
        lastName: formData.lastName || 'Doe',
      },
      contact: {
        phone: formData.phone || '+1234567890',
        email: formData.email || 'test@example.com',
      }
    };

    const paymentData = {
      method: 'creditCard',
      card: {
        vendorCode: 'VI',
        cardNumber: formData.cardNumber || '4111111111111111',
        expiryDate: formData.expiryDate || '2026-08',
        cardHolder: {
          name: formData.cardHolderName || 'John Doe'
        }
      },
      billingAddress: {
        lines: [formData.billingAddress || '123 Main Street']
      }
    };

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_BASE_URL}/api/book-hotel`, {
        offerId: hotel.offerId || 'TEST_OFFER_ID',
        guests: [guestData],
        payments: [paymentData]
      });
      setBookingResponse(response.data);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) return <p>No hotel data found.</p>;

  return (
    <div className="container my-5">
      <Card className="shadow-lg border-0 rounded-4 bg-light-subtle">
        <Card.Body>
          <Card.Title className="display-5 text-center mb-4">
            <FaHotel className="me-2" /> {hotel.name}
          </Card.Title>
          <hr />
          <Row className="mb-3">
            <Col md={6}><strong>Hotel ID:</strong> {hotel.hotelId}</Col>
            <Col md={6}><strong>Price:</strong> {hotel.price ? `${hotel.price} ${hotel.currency}` : 'N/A'}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}><strong>City:</strong> {hotel.address?.cityName}</Col>
            <Col md={6}><strong>Country:</strong> {hotel.address?.countryCode}</Col>
          </Row>
          <Row className="mb-4">
            <Col><strong>Address:</strong> <FaMapMarkerAlt className="me-2" /> {hotel.address?.lines?.join(', ')}</Col>
          </Row>

          <Form className="mb-4">
            <h5 className="mb-3 text-primary fw-bold">Guest Details <FaUser /></h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control name="firstName" onChange={handleInputChange} placeholder="John" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control name="lastName" onChange={handleInputChange} placeholder="Doe" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <FaEnvelope /></Form.Label>
                  <Form.Control name="email" type="email" onChange={handleInputChange} placeholder="john@example.com" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone <FaPhone /></Form.Label>
                  <Form.Control name="phone" onChange={handleInputChange} placeholder="+1234567890" />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3 text-primary fw-bold mt-4">Payment Details <FaCreditCard /></h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control name="cardNumber" onChange={handleInputChange} placeholder="4111 1111 1111 1111" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date <FaCalendarAlt /></Form.Label>
                  <Form.Control name="expiryDate" onChange={handleInputChange} placeholder="YYYY-MM" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Cardholder Name</Form.Label>
              <Form.Control name="cardHolderName" onChange={handleInputChange} placeholder="John Doe" />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Billing Address <FaMapMarkerAlt /></Form.Label>
              <Form.Control name="billingAddress" onChange={handleInputChange} placeholder="123 Main Street" />
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" className="px-5 py-2 fw-semibold" onClick={handleBooking} disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Booking...</> : 'Confirm Booking'}
              </Button>
            </div>
          </Form>

          {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}

          {bookingResponse && (
            <Alert variant="success" className="mt-4">
              <h5 className="text-success fw-bold"><FaCheckCircle className="me-2" /> Booking Confirmed!</h5>
              <p><strong>Booking ID:</strong> {bookingResponse.id}</p>
              <p><strong>Status:</strong> {bookingResponse.status}</p>
              <p><strong>Guest:</strong> {bookingResponse.guests?.[0]?.name?.firstName} {bookingResponse.guests?.[0]?.name?.lastName}</p>
            </Alert>
          )}

          {bookingResponse && (
            <Card className="mt-5 shadow-sm border-success border-2 rounded-4">
              <Card.Header className="bg-success text-white fw-bold">Booking Summary</Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}><strong>Booking ID:</strong></Col>
                  <Col md={6}>{bookingResponse.id}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Status:</strong></Col>
                  <Col md={6}>{bookingResponse.status}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Guest Name:</strong></Col>
                  <Col md={6}>{`${bookingResponse.guests?.[0]?.name?.firstName} ${bookingResponse.guests?.[0]?.name?.lastName}`}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Hotel Name:</strong></Col>
                  <Col md={6}>{hotel.name}</Col>
                </Row>
              </Card.Body>
            </Card>
          )}

        </Card.Body>
      </Card>
    </div>
  );
};

export default HotelBooking;

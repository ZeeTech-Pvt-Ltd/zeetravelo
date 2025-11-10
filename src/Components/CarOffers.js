import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CarOffers = ({
  defaultStartLocationCode = 'CDG',
  defaultEndAddressLine = 'Avenue Anatole France, 5',
  defaultStartDateTime = '2025-07-10T11:00:00',
  
}) => {
  const [formData, setFormData] = useState({
    startLocationCode: '',
    endAddressLine: '',
    startDateTime: '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getFinalFormData = () => {
    return {
      startLocationCode: formData.startLocationCode || defaultStartLocationCode,
      endAddressLine: formData.endAddressLine || defaultEndAddressLine,
      startDateTime: formData.startDateTime || defaultStartDateTime,
          };
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalFormData = getFinalFormData();

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_BASE_URL}/api/transfer-offers`, finalFormData);
      setResults(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transfer offers.');
    } finally {
      setLoading(false);
    }
  };

  const viewDeal = async () => {
    setLoading(true);

    const payload = {
      data: {
        note: "Pickup instructions",
        passengers: [
          {
            firstName: "John",
            lastName: "Doe",
            title: "MR",
            contacts: {
              phoneNumber: "+33123456789",
              email: "user@email.com"
            },
            billingAddress: {
              line: "Avenue de la Bourdonnais, 19",
              zip: "75007",
              countryCode: "FR",
              cityName: "Paris"
            }
          }
        ],
        agency: {
          contacts: [{ email: { address: "abc@test.com" } }]
        },
        payment: {
          methodOfPayment: "CREDIT_CARD",
          creditCard: {
            number: "4111111111111111",
            holderName: "JOHN DOE",
            vendorCode: "VI",
            expiryDate: "1026",
            cvv: "111"
          }
        },
        extraServices: [{ code: "EWT", itemId: "EWT0291" }],
        equipment: [{ code: "BBS" }],
        corporation: {
          address: {
            line: "5 Avenue Anatole France",
            zip: "75007",
            countryCode: "FR",
            cityName: "Paris"
          },
          info: {
            AU: "FHOWMD024",
            CE: "280421GH"
          }
        },
        startConnectedSegment: {
          transportationType: "FLIGHT",
          transportationNumber: "AF380",
          departure: {
            uicCode: "7400001",
            iataCode: "CDG",
            localDateTime: "2025-06-28T20:03:00"
          },
          arrival: {
            uicCode: "7400001",
            iataCode: "CDG",
            localDateTime: "2025-06-28T21:03:00"
          }
        },
        endConnectedSegment: {
          transportationType: "FLIGHT",
          transportationNumber: "AF380",
          departure: {
            uicCode: "7400001",
            iataCode: "CDG",
            localDateTime: "2025-06-28T20:03:00"
          },
          arrival: {
            uicCode: "7400001",
            iataCode: "CDG",
            localDateTime: "2025-06-28T21:03:00"
          }
        }
      }
    };

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_BASE_URL}/api/transfer-booking`, payload);

      navigate('/car-booking', {
        state: { bookingData: response.data }
      });
    } catch (error) {
      console.error('Transfer booking failed:', error);
      alert('Failed to confirm transfer booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Search Private Transfers</h2>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start Location Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.startLocationCode}
                placeholder="e.g., CDG"
                onChange={(e) => setFormData({ ...formData, startLocationCode: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Address Line</Form.Label>
              <Form.Control
                type="text"
                value={formData.endAddressLine}
                placeholder="e.g., Avenue Anatole France, 5"
                onChange={(e) => setFormData({ ...formData, endAddressLine: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.startDateTime}
                placeholder="e.g., 2025-07-10T11:00:00"
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <span className="ms-2">Loading transfers...</span>
          </div>
        ) : (
          <Button type="submit" className="mt-3">
            Search Transfers
          </Button>
        )}
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {results.map((offer, idx) => (
          <Col md={12} key={idx} className="mb-4">
            <Card className="p-3 shadow-sm border rounded d-flex flex-row align-items-center">
              <div className="d-flex w-100">
                <div style={{ flex: '0 0 180px' }}>
                  <Card.Img
                    src={offer.vehicle?.imageURL}
                    alt="Vehicle"
                    style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                  />
                </div>

                <div className="px-4 flex-grow-1">
                  <div className="mb-1">
                    <span className="badge bg-primary">Top Pick</span>
                  </div>
                  <Card.Title className="mb-1">
                    {offer.vehicle?.description || 'Vehicle'}
                  </Card.Title>
                  <Card.Subtitle className="text-muted mb-2">
                    {offer.vehicle?.category || 'car'}
                  </Card.Subtitle>
                  <div className="d-flex flex-wrap text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    <div className="me-3"><i className="bi bi-person"></i> {offer.vehicle?.seats?.[0]?.count || 0} seats</div>
                    <div className="me-3"><i className="bi bi-speedometer"></i> {offer.distance?.value || 'N/A'} {offer.distance?.unit}</div>
                  </div>
                  <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                    {offer.start?.locationCode} → {offer.end?.address?.cityName}, {offer.end?.address?.line}
                  </p>
                  <div className="d-flex align-items-center mt-2">
                    {offer.serviceProvider?.logoUrl && (
                      <img
                        src={offer.serviceProvider.logoUrl}
                        alt="Provider Logo"
                        height={25}
                        className="me-2"
                      />
                    )}
                    <span className="me-2 fw-bold text-primary">{offer.serviceProvider?.name}</span>
                    <span className="badge bg-secondary">Rating N/A</span>
                  </div>
                </div>

                <div className="text-end" style={{ minWidth: '170px' }}>
                  <div className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>Price:</div>
                  <h5 className="text-success mb-1">
                    {offer.converted?.monetaryAmount} {offer.converted?.currencyCode}
                  </h5>

                  {offer.cancellationRules?.find(rule => rule.feeValue === "0") && (
                    <div className="text-success mb-2" style={{ fontSize: '0.85rem' }}>
                      {offer.cancellationRules.find(rule => rule.feeValue === "0").ruleDescription}
                    </div>
                  )}

                  <Button variant="primary" className="w-100" onClick={viewDeal}>View deal</Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CarOffers;

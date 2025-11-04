// src/pages/CarBooking.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Container, Row, Col, Image, Alert } from 'react-bootstrap';

const CarBooking = () => {
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  const errorData = bookingData?.errors;

  // Handle cancelled or incomplete booking
  if (bookingData?.reservationStatus === "CANCELLED") {
    return (
      <Container className="my-5">
        <Card className="p-4 shadow-lg border-danger">
          <h3 className="mb-4 text-center text-danger">Booking Not Confirmed</h3>
          <h5 className="text-center text-muted">Reference Number: {bookingData.confirmNbr}</h5>
          <Alert variant="danger" className="mt-4 text-center">
            <strong>Status:</strong> {bookingData.reservationStatus}<br />
            <strong>Reason:</strong> {errorData?.[0]?.detail || "Unknown Error"}
          </Alert>
        </Card>
      </Container>
    );
  }

  // Handle missing data
  if (!bookingData || !bookingData.transfers || !bookingData.passengers) {
    return <Alert variant="danger">No valid booking data available.</Alert>;
  }

  const transfer = bookingData.transfers[0];
  const passenger = bookingData.passengers[0];
  const vehicle = transfer.vehicle;
  const provider = transfer.serviceProvider;

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-lg">
        <h3 className="mb-4 text-center">Transfer Booking Confirmed</h3>
        <h5 className="text-muted text-center mb-4">Reference: {bookingData.reference}</h5>

        <Row className="mb-4">
          <Col md={6}>
            <h6>Passenger Information</h6>
            <p><strong>Name:</strong> {passenger.title} {passenger.firstName} {passenger.lastName}</p>
            <p><strong>Email:</strong> {passenger.contacts?.email}</p>
            <p><strong>Phone:</strong> {passenger.contacts?.phoneNumber}</p>
          </Col>

          <Col md={6}>
            <h6>Transfer Details</h6>
            <p><strong>Status:</strong> {transfer.status}</p>
            <p><strong>Confirm No:</strong> {transfer.confirmNbr}</p>
            <p><strong>Payment:</strong> {transfer.methodOfPayment}</p>
            <p><strong>Type:</strong> {transfer.transferType}</p>
            <p><strong>Pick-up:</strong> {transfer.start.dateTime} ({transfer.start.locationCode})</p>
            <p><strong>Drop-off:</strong> {transfer.end.dateTime} ({transfer.end.locationCode})</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <h6>Vehicle</h6>
            <Image src={vehicle.imageURL} fluid rounded className="mb-2" style={{ maxHeight: '150px' }} />
            <p><strong>Description:</strong> {vehicle.description}</p>
            <p><strong>Seats:</strong> {vehicle.seats?.[0]?.count}</p>
            <p><strong>Baggage:</strong> {vehicle.baggages?.[0]?.count} ({vehicle.baggages?.[0]?.size})</p>
          </Col>

          <Col md={6}>
            <h6>Service Provider</h6>
            <Image src={provider.logoUrl} alt="provider logo" fluid style={{ maxHeight: '60px' }} className="mb-2" />
            <p><strong>Name:</strong> {provider.name}</p>
            <a href={provider.termsUrl} target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
          </Col>
        </Row>

        <Row>
          <Col>
            <h6>Pricing</h6>
            <p><strong>Total:</strong> {transfer.quotation.monetaryAmount} {transfer.quotation.currencyCode}</p>
            <p><strong>Taxes:</strong> {transfer.quotation.totalTaxes?.monetaryAmount} {transfer.quotation.currencyCode}</p>
            <p><strong>Fees:</strong> {transfer.quotation.totalFees?.monetaryAmount} {transfer.quotation.currencyCode}</p>
            {transfer.quotation.isEstimated && (
              <p className="text-warning"><em>Note: This amount is estimated.</em></p>
            )}
          </Col>
        </Row>

        <hr />

        <h6>Cancellation Rules</h6>
        {transfer.cancellationRules?.map((rule, index) => (
          <Alert variant="info" key={index} className="mb-2">
            {rule.ruleDescription}
          </Alert>
        ))}

        {errorData && errorData.length > 0 && (
          <>
            <hr />
            <Alert variant="danger">
              <strong>Error Code:</strong> {errorData[0].code}<br />
              <strong>Details:</strong> {errorData[0].detail}
            </Alert>
          </>
        )}
      </Card>
    </Container>
  );
};

export default CarBooking;

import React, { useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { Spinner, Button } from 'react-bootstrap';
import {
  FaPlaneDeparture, FaPlaneArrival, FaClock, FaUser, FaEnvelope, FaPhone,
  FaIdCard, FaMoneyBillWave, FaInfoCircle, FaHashtag, FaDownload
} from 'react-icons/fa';

const DisplayBookingOrder = () => {
  const [bookingId, setBookingId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = () => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/booking-details/${bookingId}`)
      .then((res) => {
        setOrderDetails(res.data.data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch booking details');
        setOrderDetails(null);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin: 0.3,
      filename: `Booking_${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="container mt-4">
      <h3>Retrieve Booking Details</h3>
      <div className="input-group mb-3">
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="form-control"
          placeholder="Enter Amadeus Booking ID"
        />
        <Button
          variant="primary"
          className="px-4 fw-semibold"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              GETTING DETAILS...
            </>
          ) : (
            'Get Details'
          )}
        </Button>
      </div>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading booking details...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {orderDetails && !loading && (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="danger" onClick={handleDownloadPDF}>
              <FaDownload className="me-2" />
              Download PDF
            </Button>
          </div>

          <div id="pdf-content" className="card shadow-lg rounded-4 border-0 p-3">
            <div className="card-body">
              <h4 className="card-title text-primary mb-3 d-flex align-items-center">
                <FaInfoCircle className="me-2" /> Booking Summary
              </h4>
              <p className="mb-2 fs-5">
                <FaHashtag className="me-2 text-secondary" />
                <strong>ID:</strong> {orderDetails.id}
              </p>
              <p className="mb-3 fs-6">
                <strong>Type:</strong> {orderDetails.type}
              </p>

              <hr className="my-3" />
              {orderDetails.flightOffers?.map((offer, i) => (
                <div key={i} className="mb-4">
                  <h5 className="mb-3 text-dark">✈️ Flight Offer #{i + 1}</h5>
                  {offer.itineraries?.map((itinerary, idx) => (
                    <div key={idx}>
                      {itinerary.segments.map((segment, sidx) => (
                        <div key={sidx} className="card mb-3 p-3 shadow-sm border-0 rounded-3 bg-light">
                          <h6 className="fw-bold mb-2 text-secondary">Segment {sidx + 1}</h6>
                          <p className="mb-2 fs-6">
                            <FaPlaneDeparture className="me-2 text-success" />
                            <strong>From:</strong> {segment.departure.iataCode} at{" "}
                            {new Date(segment.departure.at).toLocaleString()}
                          </p>
                          <p className="mb-2 fs-6">
                            <FaPlaneArrival className="me-2 text-danger" />
                            <strong>To:</strong> {segment.arrival.iataCode} at{" "}
                            {new Date(segment.arrival.at).toLocaleString()}
                          </p>
                          <p className="mb-2 fs-6">
                            <strong>Carrier:</strong> {segment.carrierCode} {segment.number}
                          </p>
                          <p className="mb-0 fs-6">
                            <FaClock className="me-2 text-warning" />
                            <strong>Duration:</strong> {segment.duration.replace("PT", "").toLowerCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              <hr className="my-3" />
              <h5 className="text-dark mb-3">🧍 Traveler Details</h5>
              {orderDetails.travelers?.map((traveler, index) => (
                <div key={index} className="card mb-3 p-3 shadow-sm border-0 rounded-3">
                  <h6 className="fw-semibold mb-2">Traveler #{index + 1}</h6>
                  <p className="mb-2 fs-6">
                    <FaUser className="me-2 text-primary" />
                    {traveler.name.firstName} {traveler.name.lastName}
                  </p>
                  <p className="mb-2 fs-6">
                    <strong>DOB:</strong> {traveler.dateOfBirth} | <strong>Gender:</strong>{" "}
                    {traveler.gender}
                  </p>
                  <p className="mb-2 fs-6">
                    <FaEnvelope className="me-2 text-danger" />
                    {traveler.contact?.emailAddress}
                  </p>
                  <p className="mb-2 fs-6">
                    <FaPhone className="me-2 text-success" />
                    {traveler.contact?.phones?.[0]?.number}
                  </p>
                  <p className="mb-0 fs-6">
                    <FaIdCard className="me-2 text-secondary" />
                    {traveler.documents?.[0]?.documentType} - {traveler.documents?.[0]?.number}
                  </p>
                </div>
              ))}

              <hr className="my-3" />
              <h5 className="text-dark mb-3 d-flex align-items-center">
                <FaMoneyBillWave className="me-2 text-success" /> Price Summary
              </h5>
              <p className="mb-0 fs-5">
                <strong>Total:</strong> {orderDetails.flightOffers?.[0]?.price?.total}{" "}
                {orderDetails.flightOffers?.[0]?.price?.currency}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayBookingOrder;

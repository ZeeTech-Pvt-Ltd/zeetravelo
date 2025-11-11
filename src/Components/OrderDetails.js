import React, { useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { BsFillSendFill, BsFillSignpost2Fill } from 'react-icons/bs';
import { AiOutlineNumber } from 'react-icons/ai';
import { FaPlaneDeparture } from 'react-icons/fa';
import { AiOutlineDollar } from 'react-icons/ai';
import { FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { FaIdBadge, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa'
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const getAirlineName = (iataCode) => {
  const match = airlineData.find((airline) => airline.iata === iataCode);
  return match ? match.name : iataCode;
};

// Mapping airports to IATA codes for quick lookup
const airportNameMap = airports.reduce((map, airport) => {
  map[airport.iata] = airport.name;
  return map;
}, {});

const getAirportName = (iataCode) => airportNameMap[iataCode] || iataCode;


const OrderDetails = ({ flight, passengers }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState('');
  const navigate = useNavigate();
  

  const handleBookFlight = async () => {
    setLoading(true);
    setError('');
    setOrderDetails(null);

    try {
      const travelerData = passengers?.map((p, index) => ({
        id: (index + 1).toString(),
        dateOfBirth: p.dob,
        gender: p.gender.toUpperCase(),
        name: {
          firstName: p.firstName,
          lastName: p.lastName,
        },
        contact: {
          emailAddress: p.email,
          phones: [
            {
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: p.phone,
            },
          ],
        },
        documents: [
          {
            documentType: 'PASSPORT',
            number: p.passportNumber,
            expiryDate: p.passportExpiry,
            issuanceCountry: p.issuanceCountry,
            nationality: p.nationality,
            holder: true,
          },
        ],
      }));

      const enrichedFlightOffer = {
        ...flight,
        oneWay: flight.oneWay !== undefined ? flight.oneWay : false,
        numberOfBookableSeats: flight.numberOfBookableSeats !== undefined
          ? flight.numberOfBookableSeats
          : passengers.length,
      };

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const bookingRes = await fetch(`${API_BASE_URL}/api/book-flight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightOffer: enrichedFlightOffer,
          travelers: travelerData,
        }),
      });
    
      const bookingData = await bookingRes.json();
      console.log("Booking response", bookingData);
    
      if (bookingRes.ok) {
        setOrderDetails(bookingData);
        setError(null); // Clear any previous error
        console.log("Booking Data", bookingData);
        // Navigate to ConfirmBooking page and pass bookingData
        navigate('/confirm-booking', {
          state: {
            orderDetails: bookingData,
            flight: flight,
            passengers: passengers,
          },
        });
        

      } else {
        console.error('Booking response error:', bookingData);
        setError(bookingData.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Error booking flight:', err);
      setError(err.message || 'Booking failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };


  const renderFlightSummary = () => {
    const flightOffer = orderDetails?.data?.flightOffers?.[0];
    if (!flightOffer) return null;

    const segments = flightOffer.itineraries.flatMap(itinerary => itinerary.segments);

    return (
      <div style={{
        background: '#ffffff',
        padding: '28px',
        borderRadius: '18px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        marginBottom: '28px',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <h3 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#1a1a1a',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaPlaneDeparture size={26} /> Flight Summary
        </h3>
      
        {/* Outbound Flight */}
        {flight.itineraries[0]?.segments?.length > 0 && (
          <>
            <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Departure Flight</h4>
            {flight.itineraries[0].segments.map((seg, idx) => (
              <div key={`dep-${idx}`} style={{
                marginBottom: '20px',
                padding: '16px 20px',
                backgroundColor: '#f5f7fa',
                borderRadius: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  gap: '12px'
                }}>
                  <img
                    src={`https://content.airhex.com/content/logos/airlines_${seg.carrierCode}_64_64_s.png`}
                    alt={seg.carrierCode}
                    width="32"
                    height="32"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#004085'
                  }}>
                    {getAirlineName(seg.carrierCode)} ({seg.carrierCode})
                  </div>
                </div>
      
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  fontSize: '17px',
                  color: '#333',
                  lineHeight: '1.8'
                }}>
                  <div>
                    <BsFillSendFill style={{ marginRight: '6px' }} />
                    <strong>Departure:</strong><br />
                    {seg.departure.iataCode} – {getAirportName(seg.departure.iataCode)}<br />
                    {new Date(seg.departure.at).toLocaleString()}
                  </div>
                  <div>
                    <BsFillSignpost2Fill style={{ marginRight: '6px' }} />
                    <strong>Arrival:</strong><br />
                    {seg.arrival.iataCode} – {getAirportName(seg.arrival.iataCode)}<br />
                    {new Date(seg.arrival.at).toLocaleString()}
                  </div>
                </div>
      
                <div style={{
                  fontSize: '16px',
                  color: '#555',
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AiOutlineNumber size={18} />
                  <strong>Flight:</strong> {seg.carrierCode}{seg.number} &nbsp;|&nbsp;
                  <strong>Aircraft:</strong> {seg.aircraft.code}
                </div>
              </div>
            ))}
          </>
        )}
      
        {/* Return Flight (if present) */}
        {flight.itineraries[1]?.segments?.length > 0 && (
          <>
            <h4 style={{ fontSize: '22px', fontWeight: '600', margin: '32px 0 16px', textAlign: 'center' }}>Return Flight</h4>
            {flight.itineraries[1].segments.map((seg, idx) => (
              <div key={`ret-${idx}`} style={{
                marginBottom: '20px',
                padding: '16px 20px',
                backgroundColor: '#f5f7fa',
                borderRadius: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  gap: '12px'
                }}>
                  <img
                    src={`https://content.airhex.com/content/logos/airlines_${seg.carrierCode}_64_64_s.png`}
                    alt={seg.carrierCode}
                    width="32"
                    height="32"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#004085'
                  }}>
                    {getAirlineName(seg.carrierCode)} ({seg.carrierCode})
                  </div>
                </div>
      
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  fontSize: '17px',
                  color: '#333',
                  lineHeight: '1.8'
                }}>
                  <div>
                    <BsFillSendFill style={{ marginRight: '6px' }} />
                    <strong>Departure:</strong><br />
                    {seg.departure.iataCode} – {getAirportName(seg.departure.iataCode)}<br />
                    {new Date(seg.departure.at).toLocaleString()}
                  </div>
                  <div>
                    <BsFillSignpost2Fill style={{ marginRight: '6px' }} />
                    <strong>Arrival:</strong><br />
                    {seg.arrival.iataCode} – {getAirportName(seg.arrival.iataCode)}<br />
                    {new Date(seg.arrival.at).toLocaleString()}
                  </div>
                </div>
      
                <div style={{
                  fontSize: '16px',
                  color: '#555',
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AiOutlineNumber size={18} />
                  <strong>Flight:</strong> {seg.carrierCode}{seg.number} &nbsp;|&nbsp;
                  <strong>Aircraft:</strong> {seg.aircraft.code}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
    );
        
  };

  const renderPriceSummary = () => {
    const price = orderDetails?.data?.flightOffers?.[0]?.price;
    if (!price) return null;

    return (
      <div style={{
        background: '#ffffff',
        padding: '28px',
        borderRadius: '18px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        marginBottom: '28px',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <h3 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#1a1a1a',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaReceipt size={26} /> Price Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          fontSize: '17px',
          color: '#333',
          lineHeight: '1.8'
        }}>
    
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaMoneyBillWave size={20} style={{ color: '#007bff' }} />
            <div>
              <div style={{ fontWeight: '600' }}>Base Price</div>
              <div>{`${price.base} ${price.currency}`}</div>
            </div>
          </div>
    
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AiOutlineDollar size={20} style={{ color: 'Green' }} />
            <div>
              <div style={{ fontWeight: '600' }}>Grand Total</div>
              <div>{`${price.grandTotal} ${price.currency}`}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', background: '#f4f7fa', minHeight: '100px' }}>
      {/* <h2 style={{ marginBottom: '20px' }}>Flight Booking</h2> */}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
  <button
    onClick={handleBookFlight}
    disabled={loading}
    style={{
      padding: '15px 20px',       // bigger padding for large button
      fontSize: '25px',           // larger font size
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: loading ? '#888888' : '#007BFF',
      border: 'none',
      borderRadius: '8px',
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)',  // stronger shadow for impact
      transition: 'all 0.3s ease',
      opacity: loading ? 0.8 : 1,
      minWidth: '220px',          // ensure a consistent minimum width
    }}
  >
    {loading ? 'Booking...' : 'Confirm Flight'}
  </button>
</div>


      <Modal show={loading} centered backdrop="static" keyboard={false} contentClassName="text-center">
        <Modal.Body className="py-5">
          <Spinner animation="border" role="status" variant="primary" className="mb-3" />
          <h5 className="fw-semibold">Booking Your Flight…</h5>
          <p className="text-muted">Please wait while we complete the booking process.</p>
        </Modal.Body>
      </Modal>

      {errorMsg && <p style={{ color: 'red', marginTop: '20px' }}>{errorMsg}</p>}

      {orderDetails && (
        <div style={{
          marginTop: '30px',
          background: '#f9f9f9',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#222' }}>Order Summary</h2>

          <div style={{
  background: '#ffffff',
  padding: '28px',
  borderRadius: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
  marginBottom: '28px',
  fontFamily: 'Segoe UI, sans-serif'
}}>
  <h3 style={{
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a1a',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    <FaIdBadge size={26} /> Booking Details
  </h3>
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    fontSize: '17px',
    color: '#333',
    lineHeight: '1.8'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FaIdBadge size={22} style={{ color: '#007bff' }} />
      <div>
        <div style={{ fontWeight: '600' }}>Booking ID</div>
        <div>{orderDetails.data?.id || 'N/A'}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FaCalendarAlt size={20} style={{ color: '#28a745' }} />
      <div>
        <div style={{ fontWeight: '600' }}>Booking Date</div>
        <div>{new Date(orderDetails.data?.associatedRecords?.[0]?.creationDate).toLocaleString() || 'N/A'}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FaTicketAlt size={20} style={{ color: '#6f42c1' }} />
      <div>
        <div style={{ fontWeight: '600' }}>Record Locator</div>
        <div>{orderDetails.data?.associatedRecords?.[0]?.reference || 'N/A'}</div>
      </div>
    </div>
  </div>
</div>

          {renderFlightSummary()}
          {renderPriceSummary()}
          {errorMsg && (
  <Card className="mb-4 shadow border-danger border-2">
    <Card.Header className="bg-danger text-white text-center">
      <h4 className="mb-0 d-flex align-items-center justify-content-center">
        <FaExclamationTriangle className="me-2" />
        Booking Failed
      </h4>
    </Card.Header>
    <Card.Body>
      <Alert variant="danger" className="fs-5 text-center">
        {typeof errorMsg === "string" ? errorMsg : errorMsg.message || 'Something went wrong. Please try again.'}
      </Alert>
    </Card.Body>
  </Card>
)}

        </div>
      )}
    </div>
  );
};

export default OrderDetails;

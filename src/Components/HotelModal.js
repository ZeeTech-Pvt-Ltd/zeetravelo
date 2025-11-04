import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaDollarSign, FaHotel, FaGlobe, FaRoad } from 'react-icons/fa';

const HotelModal = ({ show, onHide, hotel }) => {
  const navigate = useNavigate();

  const handleProceedToBooking = () => {
    navigate('/hotel-booking', { state: { hotel } });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" className="rounded-3 shadow">
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title><FaHotel className="me-2" />{hotel.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        <p><FaHotel className="me-2 text-secondary" /><strong>Hotel ID:</strong> {hotel.hotelId}</p>
        <p><FaDollarSign className="me-2 text-success" /><strong>Price:</strong> {hotel.price ? `${hotel.price} ${hotel.currency}` : 'Not Available'}</p>
        <p><FaRoad className="me-2 text-warning" /><strong>Distance:</strong> {hotel.distance?.value} {hotel.distance?.unit}</p>
        <p><FaGlobe className="me-2 text-info" /><strong>Country:</strong> {hotel.address?.countryCode}</p>
        <p><FaMapMarkerAlt className="me-2 text-danger" /><strong>Address:</strong> {hotel.address?.lines?.join(', ')}</p>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onHide} className="rounded-pill px-4">Close</Button>
        <Button variant="primary" onClick={handleProceedToBooking} className="rounded-pill px-4 fw-bold">Proceed to Booking</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HotelModal;
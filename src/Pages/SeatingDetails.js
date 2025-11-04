// SeatingDetails.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

const SeatingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedFare } = location.state || {};
  const [selectedSeat, setSelectedSeat] = useState('');

  const handleProceed = () => {
    navigate('/final-overview', { state: { selectedFare, selectedSeat } });
  };

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4 display-4">Seating Selection</h1>
      <p>Selected Fare: {selectedFare?.type} - ${selectedFare?.price}</p>
      <Form>
        <Form.Group controlId="seatSelection">
          <Form.Label>Select Your Seat</Form.Label>
          <Form.Control
            as="select"
            value={selectedSeat}
            onChange={(e) => setSelectedSeat(e.target.value)}
          >
            <option value="">Choose a seat</option>
            <option value="1A">1A</option>
            <option value="1B">1B</option>
            <option value="1C">1C</option>
            {/* Add more seat options as needed */}
          </Form.Control>
        </Form.Group>
        <Button variant="primary" className="mt-3" onClick={handleProceed} disabled={!selectedSeat}>
          Proceed to Overview
        </Button>
      </Form>
    </div>
  );
};

export default SeatingDetails;

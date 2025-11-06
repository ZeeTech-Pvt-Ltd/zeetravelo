import React, { useState } from 'react';

const HotelApitude = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE_URL}/api/hotelbeds-status`);
      const data = await res.json();
      setResponse(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch status');
      setResponse(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleClick}>Check HotelBeds API Status</button>
      <pre style={{ background: '#f0f0f0', marginTop: '10px', padding: '10px' }}>
        {response ? JSON.stringify(response, null, 2) : error}
      </pre>
    </div>
  );
};

export default HotelApitude;

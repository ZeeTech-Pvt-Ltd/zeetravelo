// HotelOffersButton.js (Frontend Component)
import React, { useState } from 'react';
import axios from 'axios';

const HotelOffersButton = () => {
  const [hotelOffers, setHotelOffers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/fetch-hotel-offers', {
        params: {
          hotelIds: 'HLLON101', // You can replace with dynamic values
          checkInDate: '2025-05-10',
          checkOutDate: '2025-05-12',
          adults: 1,
          roomQuantity: 1,
          currency: 'USD'
        }
      });

      setHotelOffers(response.data); // Save the fetched data
    } catch (err) {
      setError('Failed to fetch hotel offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Get Hotel Offers'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {hotelOffers && (
        <div>
          <h3>Hotel Offers:</h3>
          <pre>{JSON.stringify(hotelOffers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HotelOffersButton;

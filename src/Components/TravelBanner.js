import React, { useEffect, useState } from 'react';
import './TravelBanner.css';
import { useNavigate } from 'react-router-dom';
import airports from '../data/New_airports.json';

const PEXELS_API_KEY = '71WEVDy1HxrnEiAMWDnRn48neMMDjoXcCCcXUuZPXfF7yzyEwNMtUAaE';

const destinations = [
  {
    name: 'Paris',
    description: 'Experience the City of Light with its iconic landmarks and cuisine.',
  },
  {
    name: 'Tokyo',
    description: "Discover the blend of tradition and technology in Japan's capital.",
  },
  {
    name: 'New York',
    description: 'Explore the vibrant life of the Big Apple, from Times Square to Central Park.',
  },
  {
    name: 'Sydney',
    description: 'Enjoy the stunning beaches and the iconic Sydney Opera House.',
  },
];

const TravelBanner = () => {
  const [currentCity, setCurrentCity] = useState('Your City');
  const [images, setImages] = useState({});
  const [iataMap, setIataMap] = useState(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    const map = new Map();
    for (let entry of airports) {
      if (entry.city && entry.code) {
        const city = entry.city.trim().toLowerCase();
        if (!map.has(city)) {
          map.set(city, entry.code);
        }
      }
    }
    setIataMap(map);
  }, []);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json?token=c4183fbc6098f9');
        const data = await response.json();
        if (data.city) {
          setCurrentCity(data.city);
        }
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };
    fetchCity();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const imageMap = {};
      for (let destination of destinations) {
        try {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${destination.name}&per_page=1`,
            {
              headers: {
                Authorization: PEXELS_API_KEY,
              },
            }
          );
          const data = await res.json();
          imageMap[destination.name] =
            data.photos && data.photos[0]
              ? data.photos[0].src.medium
              : 'https://via.placeholder.com/300x200?text=Destination';
        } catch (err) {
          console.error(`Failed to load image for ${destination.name}:`, err);
          imageMap[destination.name] = 'https://via.placeholder.com/300x200?text=Destination';
        }
      }
      setImages(imageMap);
    };

    fetchImages();
  }, []);

  const getIATA = (cityName) => {
    if (!cityName) return null;
    const key = cityName.trim().toLowerCase();
    return iataMap.get(key) || null;
  };

  const getFutureDate = (daysAhead = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handleClick = (destination) => {
    const originIATA = getIATA(currentCity);
    const destIATA = getIATA(destination.name);

    if (!originIATA || !destIATA) {
      alert(`IATA code missing for ${!originIATA ? currentCity : destination.name}`);
      return;
    }

    const params = new URLSearchParams({
      origin: originIATA,
      destination: destIATA,
      date: getFutureDate(),
      returnDate: '',
      adults: '1',
      children: '0',
      infants: '0',
      travelClass: 'Economy',
      tripType: 'oneway',
      searchId: Date.now().toString(),
    });

    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div>
      <div className="recommended-header-container text-center">
        <h5 className="recommended-header-title">Travel Deals</h5>
      </div>

      <div className="popular-flights-container deals-container">
        <div className="popular-flights-grid">
        {destinations.map((destination, index) => (
          <div
            key={index}
            className="travel-card"
            onClick={() => handleClick(destination)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={images[destination.name] || 'https://via.placeholder.com/300x200?text=Loading'}
              alt={destination.name}
              className="travel-image"
            />
            <div className="travel-content">
              <h3 className="travel-title">{currentCity} → {destination.name}</h3>
              <p className="travel-desc">{destination.description}</p>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default TravelBanner;

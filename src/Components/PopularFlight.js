import React, { useEffect, useState } from 'react';
import './PopularFlight.css';
import './TravelBanner.css';
import newAirports from '../data/New_airports.json';
import { useNavigate } from 'react-router-dom';

const baseRoutes = [
  '{city} ⇌ Istanbul',
  '{city} ⇌ Barcelona',
  '{city} ⇌ Tirana',
  '{city} ⇌ Jeddah',
  '{city} ⇌ Canada',
  '{city} ⇌ Athens',
  '{city} ⇌ Paris',
  '{city} ⇌ Lisbon',
  '{city} ⇌ Bucharest',
  '{city} ⇌ Rome',
  '{city} ⇌ Prague',
  '{city} ⇌ New York',
];

const PEXELS_API_KEY = '71WEVDy1HxrnEiAMWDnRn48neMMDjoXcCCcXUuZPXfF7yzyEwNMtUAaE';

const PopularFlight = () => {
  const [currentCity, setCurrentCity] = useState('Home City');
  const [cityImages, setCityImages] = useState({});
  const navigate = useNavigate();

  const buildCityIndex = () => {
    const map = new Map();
    for (const entry of newAirports) {
      if (entry.city) {
        const key = entry.city.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, entry.code);
        }
      }
      if (entry.country) {
        const key = entry.country.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, entry.code);
        }
      }
    }
    return map;
  };

  const cityIATAMap = buildCityIndex();

  const getIATACode = (location) => {
    if (!location) return null;
    const lower = location.trim().toLowerCase();
    if (cityIATAMap.has(lower)) return cityIATAMap.get(lower);

    for (const [key, value] of cityIATAMap.entries()) {
      if (key.includes(lower)) {
        return value;
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json?token=c4183fbc6098f9');
        const data = await response.json();
        if (data.city) {
          setCurrentCity(data.city);
        }
      } catch (error) {
        console.error('Location fetch error:', error);
      }
    };
    fetchCity();
  }, []);

  const routes = baseRoutes.map(route => route.replace(/{city}/g, currentCity));

  useEffect(() => {
    const fetchImages = async () => {
      const imageMap = {};
      for (let route of baseRoutes) {
        const destination = route.split('⇌')[1].trim();
        try {
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${destination}&per_page=1`,
            {
              headers: {
                Authorization: PEXELS_API_KEY,
              },
            }
          );
          const data = await response.json();
          imageMap[destination] = data.photos?.[0]?.src?.medium || null;
        } catch (err) {
          console.error(`Error fetching image for ${destination}:`, err);
          imageMap[destination] = null;
        }
      }
      setCityImages(imageMap);
    };

    fetchImages();
  }, []);

  const getFormattedDate = (daysFromToday = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split('T')[0];
  };

  const handleRouteClick = (fromCity, toCity) => {
    const originIATA = getIATACode(fromCity);
    const destinationIATA = getIATACode(toCity);

    if (!originIATA || !destinationIATA) {
      alert(`Could not find IATA codes for ${fromCity} or ${toCity}`);
      return;
    }

    const date = getFormattedDate(); // Proper ISO format

    navigate(`/flights?origin=${originIATA}&destination=${destinationIATA}&date=${date}&returnDate=&adults=1&children=0&infants=0&travelClass=Economy&tripType=oneway&searchId=${Date.now()}`);
  };

  return (
    <div>
      <div className="recommended-header-container text-center">
        <h5 className="recommended-header-title">Popular Flights</h5>
      </div>

      <div className="popular-flights-container deals-container">
        <div className="popular-flights-grid">
          {routes.map((route, index) => {
            const [fromCity, toCity] = route.split('⇌').map(x => x.trim());
            const imgSrc = cityImages[toCity];
            return (
              <div
                key={index}
                className="travel-card"
                onClick={() => handleRouteClick(fromCity, toCity)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={imgSrc || 'https://via.placeholder.com/300x200?text=Flight'}
                  alt={toCity}
                  className="travel-image"
                />
                <div className="travel-content">
                  <h3 className="travel-title">{`${fromCity} ⇌ ${toCity}`}</h3>
                </div>
              </div>
            );
          })}
        </div>
        <div className="show-more-wrapper">
          <button className="show-more-btn">Show more</button>
        </div>
      </div>
    </div>
  );
};

export default PopularFlight;

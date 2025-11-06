import React, { useEffect, useState } from 'react';
import './TravelRecommend.css';
import './TravelBanner.css';
import airports from '../data/New_airports.json';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PEXELS_API_KEY = '71WEVDy1HxrnEiAMWDnRn48neMMDjoXcCCcXUuZPXfF7yzyEwNMtUAaE';

const TravelRecommend = () => {
    const [recommended, setRecommended] = useState([]);
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [iataMap, setIataMap] = useState(new Map());
    const [currentCity, setCurrentCity] = useState('Your City');
    const navigate = useNavigate();

    // Build map of city -> IATA
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

    // Get user location and fetch recommendations
    useEffect(() => {
        const fetchCityAndRecommendations = async () => {
            try {
                const res = await fetch('https://ipinfo.io/json?token=c4183fbc6098f9');
                const data = await res.json();
                const city = data.city?.trim().toLowerCase();

                if (city) setCurrentCity(city);

                if (!city || !iataMap.has(city)) {
                    throw new Error(`City not found or not mapped: ${city}`);
                }

                const originIATA = iataMap.get(city);
                const recRes = await fetch(`http://localhost:3001/api/recommended-locations?origin=${originIATA}`);
                const contentType = recRes.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    const recData = await recRes.json();
                    setRecommended(recData.data || []);
                } else {
                    const text = await recRes.text();
                    console.error('Expected JSON, got:', text);
                }
            } catch (err) {
                console.error('Error during recommendation fetch:', err);
            } finally {
                setLoading(false);
            }
        };

        if (iataMap.size > 0) {
            fetchCityAndRecommendations();
        }
    }, [iataMap]);

    // Fetch Pexels images
    useEffect(() => {
        const fetchImages = async () => {
            const imageMap = {};
            for (let dest of recommended) {
                try {
                    const res = await fetch(
                        `https://api.pexels.com/v1/search?query=${encodeURIComponent(dest.name)}&per_page=1`,
                        {
                            headers: { Authorization: PEXELS_API_KEY },
                        }
                    );
                    const data = await res.json();
                    imageMap[dest.name] =
                        data.photos && data.photos[0]
                            ? data.photos[0].src.medium
                            : 'https://via.placeholder.com/300x200?text=Destination';
                } catch {
                    imageMap[dest.name] = 'https://via.placeholder.com/300x200?text=Destination';
                }
            }
            setImages(imageMap);
        };

        if (recommended.length > 0) {
            fetchImages();
        }
    }, [recommended]);

    const getIATA = (cityName) => {
        if (!cityName) return null;
        const key = cityName.trim().toLowerCase();
        return iataMap.get(key) || null;
    };

    const getFutureDate = (daysAhead = 7) => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
    };

    const handleCardClick = (destination) => {
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
                <h5 className="recommended-header-title">Recommended Travel Sites</h5>
            </div>

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading recommendations...</p>
                </div>
            ) : recommended.length === 0 ? (
                <div className="text-center my-4">
                    <p>No recommendations found based on your location.</p>
                </div>
            ) : (
                <div className="popular-flights-container deals-container">
                    <div className="popular-flights-grid">
                        {recommended.map((place, idx) => (
                            <div
                                key={idx}
                                className="travel-card"
                                onClick={() => handleCardClick(place)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    className="travel-image"
                                    src={images[place.name] || 'https://via.placeholder.com/300x200?text=Destination'}
                                    alt={place.name}
                                />
                                <div className="travel-content">
                                    <h3 className="travel-title">{currentCity.charAt(0).toUpperCase() + currentCity.slice(1)} → {place.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelRecommend;

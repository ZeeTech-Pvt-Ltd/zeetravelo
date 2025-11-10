import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NewFlightList.css';
import { Container, Row, Col, Card, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import SortOptions from './SortOptions';
import './SortOptions.css';
import SidebarFilters from './SidebarFilters';
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import airlineData from '../data/airlines.json';
import airports from '../data/airports.json';
import { TbPlane } from 'react-icons/tb';
import { useSessionTimeout } from '../Components/SessionTimeoutContext';
import noPlane from '../Assets/noPlane.png'



const NewFlightList = ({ searchParams, setConfirmedPricingData }) => {
  const [flights, setFlights] = useState([]);
  const [sortType, setSortType] = useState('best');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();


  const [loadingSort, setLoadingSort] = useState(false);

  const { startPricingTimer } = useSessionTimeout();



  const handleSortChange = (newSortType) => {
    setLoadingSort(true); // Start spinner
    setTimeout(() => {
      setSortType(newSortType);
      setLoadingSort(false); // Hide spinner after delay
    }, 600); // 600ms delay for UI polish
  };

  // useEffect(() => {
  //   startFlightTimer();
  // }, []);

  useEffect(() => {
    startPricingTimer(); // Starts pricing timeout when component loads
  }, [startPricingTimer]);



  const handleSelectWithModal = async (flight, index) => {
    setShowModal(true); // Show modal
    try {
      await handleSelect(flight, index); // Wait for pricing confirmation
    } finally {
      setShowModal(false);
    }
  };

  const getAirlineName = (iataCode) => {
    const match = airlineData.find((airline) => airline.iata === iataCode);
    return match ? match.name : iataCode;
  };

  const airportNameMap = airports.reduce((map, airport) => {
    map[airport.iata] = airport.name;
    return map;
  }, {});

  const [filters, setFilters] = useState({
    stops: new Set(),
    durationRange: [0, 2000],
    priceRange: [0, 2000],
    airlines: new Set(),
  });



  const getAvailableFilters = (flights) => {
    const stopsSet = new Set();
    let minDuration = Infinity;
    let maxDuration = -Infinity;

    flights.forEach(flight => {
      const segments = flight.itineraries[0].segments;
      const stops = segments.length - 1;

      if (stops === 0) stopsSet.add('0');
      else if (stops === 1) stopsSet.add('1');
      else stopsSet.add('2+');

      const match = flight.itineraries[0].duration.match(/PT(\d+H)?(\d+M)?/);
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const totalMinutes = hours * 60 + minutes;

      minDuration = Math.min(minDuration, totalMinutes);
      maxDuration = Math.max(maxDuration, totalMinutes);
    });

    return {
      availableStops: Array.from(stopsSet),
      durationBounds: [minDuration, maxDuration],
    };
  };
  const getSortData = () => {
    if (!flights.length) return {};

    const formatDuration = (duration) => {
      return duration.replace('PT', '').toLowerCase();
    };

    const cheapest = [...flights].sort((a, b) => a.price.total - b.price.total)[0];
    const fastest = [...flights].sort((a, b) => {
      const parseDuration = (d) => {
        const match = d.match(/PT(\d+H)?(\d+M)?/);
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        return hours * 60 + minutes;
      };
      return parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration);
    })[0];

    const best = flights[0]; // or your own "best" logic

    return {
      best: {
        price: best?.price?.total,
        duration: formatDuration(best?.itineraries[0]?.duration),
      },
      cheapest: {
        price: cheapest?.price?.total,
        duration: formatDuration(cheapest?.itineraries[0]?.duration),
      },
      fastest: {
        price: fastest?.price?.total,
        duration: formatDuration(fastest?.itineraries[0]?.duration),
      },
    };
  };

  const sortData = getSortData();

  const applyFilters = () => {
    let filtered = flights.filter(flight => {
      const segments = flight.itineraries[0]?.segments || [];

      // Stops
      const stopLabel = segments.length === 1 ? '0' : segments.length === 2 ? '1' : '2+';
      const stopsMatch = filters.stops.size === 0 || filters.stops.has(stopLabel);

      // Duration
      const match = flight.itineraries[0].duration.match(/PT(\d+H)?(\d+M)?/);
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const totalMinutes = hours * 60 + minutes;
      const durationMatch =
        totalMinutes >= filters.durationRange[0] &&
        totalMinutes <= filters.durationRange[1];

      // Price
      const price = parseFloat(flight.price.total);
      const [minPrice, maxPrice] = filters.priceRange;
      const priceMatch = price >= minPrice && price <= maxPrice;

      // Airline
      const segmentAirlines = new Set(segments.map(seg => seg.carrierCode));
      const airlineMatch =
        filters.airlines.size === 0 ||
        [...segmentAirlines].some(code => filters.airlines.has(code));

      return stopsMatch && durationMatch && priceMatch && airlineMatch;
    });

    // Sorting
    if (sortType === 'cheapest') {
      filtered.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    } else if (sortType === 'fastest') {
      filtered.sort((a, b) => {
        const parseDuration = (d) => {
          const match = d.match(/PT(\d+H)?(\d+M)?/);
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          return hours * 60 + minutes;
        };
        return parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration);
      });
    }

    return filtered;
  };

  useEffect(() => {
    const { durationBounds } = getAvailableFilters(flights);
    setFilters(prev => ({
      ...prev,
      durationRange: durationBounds,
    }));
  }, [flights]);


  useEffect(() => {
    const fetchFlights = async () => {
      const query = new URLSearchParams(location.search);

      const origin = query.get('origin');
      const destination = query.get('destination');
      const date = query.get('date');
      const returnDate = query.get('returnDate');
      const adults = parseInt(query.get('adults') || '1');
      const children = parseInt(query.get('children') || '0');
      const infants = parseInt(query.get('infants') || '0');
      const travelClass = query.get('travelClass') || 'ECONOMY';
      const tripType = query.get('tripType') || 'oneway';

      if (!origin || !destination || !date) {
        console.warn('Missing essential parameters.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let apiUrl;
        let requestBody;
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        if (tripType === 'oneway') {
          apiUrl = `${API_BASE_URL}/api/flights`;
          requestBody = {
            origin,
            destination,
            date,
            adults,
            children,
            infants,
            travelClass,
          };
        } else if (tripType === 'return') {
          apiUrl = `${API_BASE_URL}/api/return-flights`;
          requestBody = {
            currencyCode: "USD",
            originDestinations: [
              {
                id: "1",
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDateTimeRange: { date },
              },
              {
                id: "2",
                originLocationCode: destination,
                destinationLocationCode: origin,
                departureDateTimeRange: { date: returnDate },
              },
            ],
            travelers: Array.from({ length: adults }, (_, i) => ({
              id: (i + 1).toString(),
              travelerType: "ADULT",
            })),
            sources: ["GDS"],
            travelClass,
          };
        } else {
          throw new Error('Invalid trip type');
        }

        const response = await axios.post(apiUrl, requestBody);
        const results = response.data.data || response.data;

        setFlights(results);
        // setSortedFlights(results); // This line is removed
      } catch (error) {
        console.error('Error fetching flights:', error.response?.data || error.message);
        setError('Failed to fetch flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [location.search]);

  const handleSelect = async (flight, index) => {
    setError(null);
    setExpandedIndex(index);

    try {
      // Send flight data to the API for pricing
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_BASE_URL}/api/flight-pricing`, flight);
      const confirmedFlight = response.data.data?.flightOffers?.[0];  // Extract the first flight offer

      console.log('Confirmed Flight:', confirmedFlight);
      console.log("HnadleSelect", searchParams.tripType);

      if (!confirmedFlight) {
        throw new Error('No confirmed flight found in the response');
      }

      // Set confirmed pricing data
      if (setConfirmedPricingData) {
        setConfirmedPricingData(confirmedFlight);
      }

      // Navigate to BookingDetails page and pass both flight and pricing data
      navigate('/booking-details', {
        state: {
          flight: confirmedFlight,  // Pass the flight details
          //pricing: confirmedFlight, // Assuming confirmedFlight contains pricing info
          tripType: searchParams.tripType,  // Ensure this is available in your scope
        },
      });

    } catch (error) {
      console.error('Error fetching confirmed pricing:', error);
      setError('Failed to confirm flight pricing.');
    }
  };


  if (error)
    return (
      <Alert variant="danger" className="my-5 text-center">
        Error: {error}
      </Alert>
    );

  const filteredFlights = applyFilters();

  return (
    <section className="flight-results-section">
      <Container className="flight-results-container">
        <div className="flight-results-panel">
          <Row className="flight-results-row">
            {/* Sidebar Filters on the left */}
            <Col xs={12} md={3} lg={3} className="filter-column">
              <SidebarFilters
                availableStops={['0', '1', '2+']}
                filters={filters}
                onFiltersChange={setFilters}
                flightData={filteredFlights}
                airlineData={airlineData} // pass as-is (array)
              />
            </Col>

            {/* Main Content: Sort Options and Flight List */}
            <Col xs={12} md={9} lg={9} className="results-column">
              <SortOptions
                sortType={sortType}
                onSortChange={handleSortChange}
                sortData={sortData}
              />

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" /> Loading flights...
                </div>
              ) : (
                <>
                  {loadingSort && (
                    <div className="text-center my-3">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <span className="ms-2">Updating Flights...</span>
                    </div>
                  )}

              {filteredFlights
                .slice(0, visibleCount)
                .map((flight, index) => (

                      <Card className="mb-3 flight-card" key={index} style={{ border: 'none', boxShadow: 'none' }}>
                        <Card.Body className="p-3">
                      <Row className="gx-2 py-1 mx-0">
                        <Col xs={12} md={9} className="px-2 px-md-3">
                          {flight.itineraries.map((itinerary, i) => (
                            <div key={i} className="mb-2">
                              <Row className="align-items-center text-center g-2 g-md-3 mx-0">
                                <Col xs={12} sm={6} md={4} className="mb-2 mb-md-0 px-2">
                                  <div className="d-flex align-items-center justify-content-center mb-1">
                                    <img
                                      src={`https://content.airhex.com/content/logos/airlines_${itinerary.segments[0].carrierCode}_64_64_s.png`}
                                      alt={itinerary.segments[0].carrierCode}
                                      width="40"
                                      height="40"
                                      className="me-2"
                                      style={{ borderRadius: '4px' }}
                                      onError={(e) => (e.target.style.display = 'none')}
                                    />
                                    <span className="fw-bold" style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                                      {getAirlineName(itinerary.segments[0].carrierCode)}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                    <strong>Flight No:</strong> {itinerary.segments[0].number}
                                  </div>
                                </Col>

                                <Col xs={12} sm={6} md={4} className="mb-2 mb-md-0 px-2">
                                  <div style={{ fontSize: '0.95rem', marginBottom: '8px', fontWeight: 700, color: '#1e293b' }}>
                                    <FaClock className="me-1" style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                                    <strong>Duration:</strong>{' '}
                                    {itinerary.duration.replace('PT', '').toLowerCase()}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                    <strong>Stops:</strong> {itinerary.segments.length - 1}
                                  </div>
                                </Col>

                                <Col xs={12} sm={12} md={4} className="mb-2 mb-md-0 px-2">
                                  <div className="fw-bold mb-2" style={{ fontSize: '1rem', color: '#1e293b' }}>
                                    <FaPlaneDeparture className="me-1" style={{ color: '#2563eb', fontSize: '0.9rem' }} />
                                    {itinerary.segments[0].departure.iataCode} →{' '}
                                    {itinerary.segments.slice(-1)[0].arrival.iataCode}
                                    <FaPlaneArrival className="ms-1" style={{ color: '#2563eb', fontSize: '0.9rem' }} />
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                                    {new Date(itinerary.segments[0].departure.at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {new Date(itinerary.segments.slice(-1)[0].arrival.at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </Col>

                        <Col
                          xs={12}
                          md={3}
                          className="d-flex flex-column justify-content-center align-items-center border-start-0 border-md-start border-secondary-subtle ps-2 ps-md-3 mt-3 mt-md-0 pt-3 pt-md-0 px-2"
                        >
                          <div className="text-uppercase mb-2 text-center" style={{ letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', width: '100%' }}>
                            {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Class'}
                          </div>
                          <h3 className="mb-3 fw-bold text-center" style={{ color: '#2563eb', fontSize: '1.5rem', letterSpacing: '-0.02em', lineHeight: '1.2', width: '100%' }}>
                            {flight.price.total} {flight.price.currency}
                          </h3>

                          <Button
                            variant="primary"
                            onClick={() => handleSelectWithModal(flight, index)}
                            className="flight-select-btn w-100 w-md-auto mb-3"
                            style={{ 
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              border: 'none',
                              padding: '10px 24px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            Select Flight
                          </Button>
                        </Col>
                      </Row>

                      {/* Expanded Flight Details */}
                      {expandedIndex === index &&
                        flight.itineraries.map((itinerary, itinIdx) => {
                          const tripLabel = itinIdx === 0 ? 'Outbound Flight' : 'Return Flight';

                          return (
                            <div
                              key={itinIdx}
                              className="mb-2 p-3 border rounded"
                              style={{
                                borderLeft: '3px solid #2563eb',
                                background: '#ffffff',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                                borderRadius: '10px',
                              }}
                            >
                              <h6 className="fw-bold mb-2 text-center" style={{ color: '#2563eb', letterSpacing: '-0.01em', fontSize: '0.9rem' }}>{tripLabel}</h6>

                              {itinerary.segments.map((segment, segIdx, segmentsArray) => {
                                const departureTime = new Date(segment.departure.at);
                                const arrivalTime = new Date(segment.arrival.at);
                                const duration = segment.duration.replace('PT', '').toLowerCase();

                                const airlineLogoUrl = `https://content.airhex.com/content/logos/airlines_${segment.carrierCode}_64_64_s.png`;

                                let layover = null;
                                let layoverMinutes = 0;

                                if (segIdx < segmentsArray.length - 1) {
                                  const nextDeparture = new Date(segmentsArray[segIdx + 1].departure.at);
                                  const diffMs = nextDeparture - arrivalTime;
                                  layoverMinutes = Math.floor(diffMs / 60000);
                                  const hours = Math.floor(layoverMinutes / 60);
                                  const mins = layoverMinutes % 60;
                                  layover = `${hours}h ${mins}m`;
                                }

                                return (
                                  <React.Fragment key={`${itinIdx}-${segIdx}`}>
                                    <div className="position-relative mb-2 p-3 border rounded segment-detail d-flex justify-content-between align-items-center" style={{ background: '#ffffff', borderRadius: '10px', borderColor: '#eef2f7' }}>

                                      {/* Top-right: Duration Badge */}
                                      <div className="position-absolute top-0 end-0 m-2">
                                        <span className="badge" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}>
                                          Duration: {duration}
                                        </span>
                                      </div>

                                      {/* Main Content: Airport info + Airline info */}
                                      <div className="d-flex align-items-start flex-wrap">

                                        {/* Left: Airport names + Times + Dates */}
                                        <div className="d-flex flex-column align-items-start me-4">
                                          {/* Departure section */}
                                          <div className="d-flex align-items-center flex-wrap mb-2" style={{ maxWidth: '320px' }}>
                                            <div className="me-2 text-end">
                                              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                <strong>{departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                              </div>
                                              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                                {departureTime.toLocaleDateString()}
                                              </div>
                                            </div>
                                            <div className="text-muted small text-wrap fw-bold" style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                                              {airportNameMap[segment.departure.iataCode] || 'Unknown Airport'}
                                            </div>
                                          </div>

                                          {/* Plane icon between departure and arrival */}
                                          <div className="my-2 d-flex justify-content-center w-100">
                                            <TbPlane style={{ transform: 'rotate(90deg)', fontSize: '1.5rem', opacity: 0.7, marginLeft: '20px' }} />
                                          </div>


                                          {/* Arrival section */}
                                          <div className="d-flex align-items-center flex-wrap" style={{ maxWidth: '320px' }}>
                                            <div className="me-2 text-end">
                                              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                <strong>{arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                              </div>
                                              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                                {arrivalTime.toLocaleDateString()}
                                              </div>
                                            </div>
                                            <div className="text-muted small text-wrap fw-bold" style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                                              {airportNameMap[segment.arrival.iataCode] || 'Unknown Airport'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Airline logo + name + aircraft info */}
                                        <div className="d-flex  py-5">
                                          <img
                                            src={airlineLogoUrl}
                                            alt={segment.carrierCode}
                                            width="50"
                                            height="50"
                                            className="me-3"
                                            onError={(e) => (e.target.style.display = 'none')}
                                          />
                                          <div className="d-flex flex-column text-start">
                                            <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                                              {getAirlineName(segment.carrierCode)} {segment.number}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                              {segment.carrierCode}
                                              <span className="badge bg-dark ms-2" style={{ fontSize: '0.7rem' }}>
                                                {segment.aircraft?.code || 'N/A'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Layover info if applicable */}
                                    {layover && (
                                      <div className="text-center mb-2">
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                          Layover in <strong>{airportNameMap[segment.arrival.iataCode] || 'Unknown Airport'}</strong>: {layover}
                                        </span>
                                        {layoverMinutes >= 180 && (
                                          <span className="badge bg-danger-subtle text-danger ms-2" style={{ fontSize: '0.7rem' }}>Long layover</span>
                                        )}
                                      </div>
                                    )}
                                  </React.Fragment>


                                );
                              })}
                            </div>
                          );
                        })}
                      

                      {/* Show/Hide Details Button */}
                      <div className="text-center mt-3">
                        <Button
                          variant="link"
                          onClick={() => {
                            if (expandedIndex === index) {
                              setExpandedIndex(null);
                            } else {
                              setExpandedIndex(index);
                            }
                          }}
                          className="text-decoration-none"
                          style={{ padding: '8px 16px' }}
                        >
                          {expandedIndex === index ? (
                            <>
                              Hide Details <FaChevronUp className="ms-1" />
                            </>
                          ) : (
                            <>
                              Show Details <FaChevronDown className="ms-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                ))}

                  {filteredFlights.length === 0 && (
                    <div className="no-flights-message">
                      <img
                        src={noPlane}
                        alt="No flights"
                        style={{ width: 100, marginBottom: 20 }}
                      />
                      <h3>Oops! No flights available for your search.</h3>
                      <p>Try changing your travel dates or destinations and search again.</p>
                    </div>
                  )}


              {visibleCount < filteredFlights.length && (
                <div className="text-center my-4">
                  <Button
                    variant="outline-primary"
                    className="fw-semibold"
                    onClick={() => setVisibleCount((prev) => prev + 15)}
                  >
                    Load More Flights
                  </Button>
                </div>
              )}

              <Modal
                show={showModal}
                centered
                backdrop="static"
                keyboard={false}
                contentClassName="text-center"
              >
                <Modal.Body className="py-5">
                  <Spinner animation="border" role="status" variant="primary" className="mb-3" />
                  <h5 className="fw-semibold">Confirming Flight Pricing…</h5>
                  <p className="text-muted">Please wait while we finalize the latest prices.</p>
                </Modal.Body>
              </Modal>
            </>
          )}
        </Col>
      </Row>
        </div>
    </Container>
  </section>
  );

};

export default NewFlightList;

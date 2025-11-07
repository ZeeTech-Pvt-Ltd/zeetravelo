import React, { useEffect, useState } from 'react';
import { Card, Collapse, Button, Form } from 'react-bootstrap';
import { FaFilter, FaPlaneDeparture, FaPlaneArrival, FaClock, FaTags, FaBuilding } from 'react-icons/fa';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './SidebarFilters.css';

const SidebarFilters = ({
  filters,
  onFiltersChange,
  flightData = [],
  airlineData = [],
  availableStops = ['0', '1', '2+'],
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [airlineCounts, setAirlineCounts] = useState({});
  const [airlineOptions, setAirlineOptions] = useState([]);

  const airports = Array.from(
    new Set(
      flightData.flatMap((flight) => {
        const allItineraries = flight.itineraries;
        const firstSegment = allItineraries[0]?.segments?.[0];
        const lastItinerary = allItineraries[allItineraries.length - 1];
        const lastSegment = lastItinerary?.segments?.[lastItinerary.segments.length - 1];
  
        const originCode = firstSegment?.departure?.iataCode;
        const destinationCode = lastSegment?.arrival?.iataCode;
  
        return [originCode, destinationCode].filter(Boolean);
      })
    )
  );
  
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Count airlines from flight data
  useEffect(() => {
    const counts = {};
    flightData.forEach(offer => {
      offer.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
          const carrier = segment.carrierCode;
          if (carrier) {
            counts[carrier] = (counts[carrier] || 0) + 1;
          }
        });
      });
    });
    setAirlineCounts(counts);
  }, [flightData]);

  // Prepare airline dropdown options using airlineData array
  useEffect(() => {
    const options = Object.entries(airlineCounts).map(([code, count]) => {
      const match = airlineData.find(a => a.iata === code);
      return {
        value: code,
        label: `${match?.name || code} (${count})`,
      };
    });
    setAirlineOptions(options);
  }, [airlineCounts, airlineData]);

  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatPriceShort = (price) => {
    if (price >= 1000) {
      const kValue = price / 1000;
      return `${kValue.toFixed(1)}K`;
    }
    return price.toFixed(0);
  };

  const getTimeIcon = (iconType) => {
    switch (iconType) {
      case 'morning':
      case 'evening':
        return <FaPlaneDeparture style={{ fontSize: '18px', color: '#94a3b8' }} />;
      case 'noon':
      case 'night':
        return <FaClock style={{ fontSize: '18px', color: '#94a3b8' }} />;
      default:
        return null;
    }
  };

  // Ensure filters.priceRange exists and is correctly accessed
  if (!filters || !filters.priceRange) return null;  // Early exit if priceRange is undefined

  const sidebarStyle = {
    position: 'relative',
    width: '100%',
  };

  const totalFlights = Array.isArray(flightData) ? flightData.length : 0;

  

  return (
    
    <div style={sidebarStyle} className="mb-3">
      {isMobile && (
        <Button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-100 mb-2"
          variant="outline-primary"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      )}

      <Collapse in={!isMobile || showMobileFilters}>
        <div style={sidebarStyle}>
          <Card className="shadow-sm border-0 filter-card">
            <h5 className="mb-3 fw-bold filter-header">Filters</h5>

            {/* Price Range */}
            <div className="mb-3 filter-section">
              <Form.Label className="fw-bold mb-2 filter-label">Price Range</Form.Label>
              <Slider
                range
                min={0}
                max={2000}
                value={filters.priceRange}
                onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
                className="price-slider"
              />
              <div className="d-flex justify-content-between mt-2 price-values">
                <span className="price-value">{formatPriceShort(filters.priceRange[0])}</span>
                <span className="price-value">{formatPriceShort(filters.priceRange[1])}</span>
              </div>
            </div>
            <hr className="filter-divider" />

            {/* Number of Layover */}
            <div className="mb-3 filter-section">
              <Form.Label className="fw-bold mb-2 filter-label">Number of Layover</Form.Label>
              <div className="layover-buttons">
                {['0', '1', '2', '3'].map(layover => {
                  const stopsSize = filters.stops?.size || 0;
                  const isSelected = 
                    (layover === '0' && filters.stops?.has('0')) ||
                    (layover === '1' && filters.stops?.has('1')) ||
                    (layover === '2' && filters.stops?.has('2')) ||
                    (layover === '3' && filters.stops?.has('3'));
                  
                  return (
                    <button
                      key={layover}
                      className={`layover-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        const updatedStops = new Set();
                        if (layover === '0') {
                          updatedStops.add('0');
                        } else {
                          updatedStops.add(layover);
                        }
                        onFiltersChange({ ...filters, stops: updatedStops });
                      }}
                    >
                      {layover}
                    </button>
                  );
                })}
              </div>
              <button
                className={`layover-btn layover-btn-any ${filters.stops?.size === 0 ? 'selected' : ''}`}
                onClick={() => {
                  onFiltersChange({ ...filters, stops: new Set() });
                }}
              >
                Any
              </button>
            </div>
            <hr className="filter-divider" />

            {/* Duration Range */}
            <div className="mb-3 filter-section">
              <Form.Label className="fw-bold mb-2 filter-label">Duration</Form.Label>
              <div className="text-muted small mb-2">
                {formatDuration(filters.durationRange[0])} – {formatDuration(filters.durationRange[1])}
              </div>
              <Slider
                range
                min={0}
                max={2000}
                value={filters.durationRange}
                onChange={(value) => onFiltersChange({ ...filters, durationRange: value })}
                className="price-slider"
                marks={{
                  0: '0h',
                  600: '10h',
                  1200: '20h',
                  1800: '30h',
                  2000: '33h',
                }}
                step={50}
              />
            </div>
            <hr className="filter-divider" />

            {/* Times Filter */}
            <div className="mb-3 filter-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-bold mb-0 filter-label">Times</Form.Label>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none"
                  style={{ fontSize: '0.75rem', color: '#64748b' }}
                  onClick={() => {
                    const resetTimeRange = {};
                    airports.forEach((code) => (resetTimeRange[code] = [0, 1440]));
                    onFiltersChange({
                      ...filters,
                      timeType: 'takeoff',
                      timeRange: resetTimeRange,
                    });
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="btn-group w-100 mb-3" style={{ gap: '4px' }}>
                <Button
                  variant={filters.timeType === 'takeoff' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, timeType: 'takeoff' })}
                  style={{ 
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                    ...(filters.timeType === 'takeoff' ? { 
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none'
                    } : {})
                  }}
                >
                  Take-off
                </Button>
                <Button
                  variant={filters.timeType === 'landing' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, timeType: 'landing' })}
                  style={{ 
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                    ...(filters.timeType === 'landing' ? { 
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none'
                    } : {})
                  }}
                >
                  Landing
                </Button>
              </div>

              {airports.map((airport) => (
                <div key={airport} className="mb-4 airport-time-section">
                  <div className="mb-2 fw-semibold small d-flex align-items-center text-muted">
                    <FaClock className="me-1" style={{ fontSize: '0.75rem' }} />
                    {filters.timeType === 'takeoff' ? 'Depart from' : 'Arrive at'} {airport}
                  </div>
                  <Slider
                    range
                    min={0}
                    max={1440}
                    step={30}
                    value={filters.timeRange?.[airport] || [0, 1440]}
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        timeRange: {
                          ...filters.timeRange,
                          [airport]: value,
                        },
                      })
                    }
                    tipFormatter={(val) => {
                      const hrs = String(Math.floor(val / 60)).padStart(2, '0');
                      const mins = String(val % 60).padStart(2, '0');
                      return `${hrs}:${mins}`;
                    }}
                    marks={{
                      0: '00:00',
                      360: '06:00',
                      720: '12:00',
                      1080: '18:00',
                      1440: '24:00',
                    }}
                    className="price-slider"
                  />
                </div>
              ))}
            </div>
            <hr className="filter-divider" />

            {/* Airlines */}
            <div className="mb-3 filter-section airlines-section">
              <Form.Label className="fw-bold mb-2 filter-label">Airlines</Form.Label>
              <Select
                isMulti
                options={airlineOptions}
                placeholder="Select airlines..."
                value={airlineOptions.filter(option =>
                  filters.airlines instanceof Set && filters.airlines.has(option.value)
                )}
                onChange={(selectedOptions) => {
                  const updatedAirlines = new Set();
                  selectedOptions.forEach(opt => updatedAirlines.add(opt.value));
                  onFiltersChange({ ...filters, airlines: updatedAirlines });
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    minHeight: '38px',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#e0f2fe',
                    borderRadius: '6px',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#1e293b',
                    fontSize: '0.85rem',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#64748b',
                    ':hover': {
                      backgroundColor: '#cbd5e1',
                      color: '#1e293b',
                    },
                  }),
                }}
              />
              {airlineOptions.length === 0 && (
                <div className="text-muted small mt-2">No airlines found</div>
              )}
            </div>

          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default SidebarFilters;

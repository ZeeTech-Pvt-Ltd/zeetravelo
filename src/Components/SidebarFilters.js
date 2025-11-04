import React, { useEffect, useState } from 'react';
import { Card, Collapse, Button, Form } from 'react-bootstrap';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
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
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
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

  // Ensure filters.priceRange exists and is correctly accessed
  if (!filters || !filters.priceRange) return null;  // Early exit if priceRange is undefined

  const sidebarStyle = {
    position: 'sticky',
    top: '80px',
    alignSelf: 'flex-start',
    zIndex: 1000,
    marginTop: '-63px',
    
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
        <div>
          <Card className="p-4 shadow-sm border-0">
            <h5 className="mb-2 fw-bold">Flight Filters</h5>

            {/* Flight Count */}
            <div className="">
              <strong>Total Flights:</strong> {totalFlights}
            </div>
            <hr/>

            {/* Stops Filter */}
            <div className="mb-2">
              <Form.Label className="fw-bold">Stops</Form.Label>
              {availableStops.map(stop => (
                <Form.Check
                  key={stop}
                  type="checkbox"
                  className="mb-1"
                  label={`${stop} Stop${stop !== '1' ? 's' : ''}`}
                  checked={filters.stops instanceof Set && filters.stops.has(stop)}
                  onChange={(e) => {
                    const updatedStops = new Set(filters.stops);
                    if (e.target.checked) {
                      updatedStops.add(stop);
                    } else {
                      updatedStops.delete(stop);
                    }
                    onFiltersChange({ ...filters, stops: updatedStops });
                  }}
                />
              ))}
            </div>

            {/* Airline Dropdown */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Airlines</Form.Label>
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
              />
              {airlineOptions.length === 0 && (
                <div className="text-muted small mt-2">No airlines found</div>
              )}
            </div>
            
            {/* Times Filter */}
            <div className="">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Label className="fw-bold mb-0">Times</Form.Label>
        <Button
          variant="link"
          size="sm"
          className="p-0"
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

      <div className="btn-group w-100 mb-3">
        <Button
          variant={filters.timeType === 'takeoff' ? 'secondary' : 'outline-secondary'}
          onClick={() => onFiltersChange({ ...filters, timeType: 'takeoff' })}
        >
          Take-off
        </Button>
        <Button
          variant={filters.timeType === 'landing' ? 'secondary' : 'outline-secondary'}
          onClick={() => onFiltersChange({ ...filters, timeType: 'landing' })}
        >
          Landing
        </Button>
      </div>

      {airports.map((airport) => (
        <div key={airport} className="mb-5">
          <div className="mb-1 fw-semibold small">
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
           
          />
        </div>
      ))}
    </div>


      {/* Duration Range */}
<div className="mb-4">
  <Form.Label className="fw-bold">Duration</Form.Label>
  <strong>
    <div className="text-muted">
      {formatDuration(filters.durationRange[0])} – {formatDuration(filters.durationRange[1])}
    </div>
  </strong>
  
  <Slider className='mt-2'
    range
    min={0}
    max={2000}
    value={filters.durationRange}
    onChange={(value) => {
      onFiltersChange({ ...filters, durationRange: value });
    }}
    marks={{
      0: '0h',
      600: '10h',
      1200: '20h',
      1800: '30h',
      2000: '33h',  // 2000 is the max, adjust this to suit your range
    }}
    step={50}
  />
</div>

 {/* Price Range */}
 <Form.Label className="fw-bold mt-2">Price Range</Form.Label>
      <strong>
        <div className="text-muted">
          {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
        </div>
      </strong>
      <Slider
        range
        min={0}
        max={2000} // Adjust this max based on your data
        value={filters.priceRange}
        onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
        marks={{
          0: formatPrice(0),
          
          1000: formatPrice(1000),
          
          2000: formatPrice(2000), // Adjust to your max price value
        }}
        step={50}
      />

          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default SidebarFilters;

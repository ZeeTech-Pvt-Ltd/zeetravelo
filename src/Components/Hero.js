import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import airportData from 'airport-data-js';

const Hero = () => {
  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: today,
    returnDate: oneWeekLater,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    tripType: 'roundTrip',
    showPassengerDropdown: false,
    tempPassengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    errorMessage: ''
  });

  const [travelClass, setTravelClass] = useState('economy');
  const [airportList, setAirportList] = useState([]);

  useEffect(() => {
    // Fetch airport data and set to state
    const airports = airportData.getAllAirports();
    setAirportList(airports);
  }, []);

  const updatePassengers = (type, operation) => {
    setFormData(prev => {
      const currentTotal = prev.tempPassengers.adults + prev.tempPassengers.children + prev.tempPassengers.infants;
      let newValue = prev.tempPassengers[type];

      if (operation === 'increase') {
        if (currentTotal >= 9) return prev;
        newValue = prev.tempPassengers[type] + 1;
      } else {
        newValue = Math.max(
          type === 'adults' ? 1 : 0,
          prev.tempPassengers[type] - 1
        );
      }

      // Ensure that the number of infants is not greater than adults
      if (type === 'adults' && prev.tempPassengers.infants > newValue) {
        return {
          ...prev,
          tempPassengers: {
            ...prev.tempPassengers,
            adults: newValue,
            infants: newValue
          }
        };
      }

      return {
        ...prev,
        tempPassengers: {
          ...prev.tempPassengers,
          [type]: newValue
        }
      };
    });
  };

  const getPassengerSummary = () => {
    const { adults, children, infants } = formData.passengers;
    let summary = [];
    if (adults > 0) summary.push(`${adults} Adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) summary.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    if (infants > 0) summary.push(`${infants} Infant${infants !== 1 ? 's' : ''}`);
    return summary.join(', ');
  };

  const handleSwap = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const toggleTripType = (type) => {
    setFormData(prev => ({
      ...prev,
      tripType: type,
      returnDate: type === 'oneWay' ? null : prev.returnDate || oneWeekLater
    }));
  };

  const handleDateChange = (dates) => {
    if (Array.isArray(dates)) {
      const [start, end] = dates;
      setFormData(prev => ({
        ...prev,
        departDate: start,
        returnDate: prev.tripType === 'roundTrip' ? end : null,
        errorMessage: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        departDate: dates,
        returnDate: null,
        errorMessage: ''
      }));
    }
  };

  const handleApplyPassengers = () => {
    setFormData(prev => ({
      ...prev,
      passengers: { ...prev.tempPassengers },
      showPassengerDropdown: false
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    if (formData.tripType === 'roundTrip' && formData.returnDate <= formData.departDate) {
      setFormData(prev => ({ ...prev, errorMessage: 'Return date must be after departure date!' }));
      return;
    }

    if (!formData.from || !formData.to) {
      setFormData(prev => ({ ...prev, errorMessage: 'Please select both departure and destination airports!' }));
      return;
    }

    setFormData(prev => ({ ...prev, errorMessage: '' }));

    // Extract IATA codes from selected options
    const fromIATA = formData.from;
    const toIATA = formData.to;

    // Construct the flight search URL
    const searchURL = `/flights?from=${fromIATA}&to=${toIATA}`;
    console.log('Navigating to:', searchURL);
    // You can use your routing logic here to navigate to the searchURL
  };
  
  return (
    <section className="hero-section py-5" style={{
        backgroundImage: 'url(/hero-banner.png)', // Path to your image in the public folder
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        color: 'white'
      }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col">
            <div className="card shadow-lg border-0 bg-light bg-opacity-90">
              <div className="card-header bg-primary text-white py-3">
                <h1 className="h3 mb-0 text-center">Find Your Perfect Flight</h1>
              </div>

              <div className="card-body p-4 text-dark">
                {formData.errorMessage && (
                  <div className="alert alert-danger mb-4">
                    {formData.errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Trip Type Section (Separate) */}
                  <div className="mb-4">
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${formData.tripType === 'roundTrip' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => toggleTripType('roundTrip')}
                      >
                        <FontAwesomeIcon icon={faArrowRightArrowLeft} className="me-2" />
                        Round Trip
                      </button>
                      <button
                        type="button"
                        className={`btn ${formData.tripType === 'oneWay' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => toggleTripType('oneWay')}
                      >
                        <FontAwesomeIcon icon={faArrowRight} className="me-2" />
                        One Way
                      </button>
                    </div>
                  </div>

                  <div className="row g-3">
                    {/* From / To Inputs */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold">From</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faPlaneDeparture} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.from}
                          onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                          placeholder="City or Airport"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleSwap}
                          title="Swap destinations"
                        >
                          <FontAwesomeIcon icon={faExchangeAlt} />
                        </button>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold">To</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faPlaneArrival} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.to}
                          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                          placeholder="City or Airport"
                          required
                        />
                      </div>
                    </div>

                    {/* Date Fields */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        {formData.tripType === 'roundTrip' ? 'Departure - Return' : 'Departure'}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </span>
                        <DatePicker
                        selected={formData.departDate}
                        onChange={handleDateChange}
                        startDate={formData.departDate}
                        endDate={formData.tripType === 'roundTrip' ? formData.returnDate : null}
                        selectsRange={formData.tripType === 'roundTrip'}
                        minDate={today}
                        dateFormat="MMMM d, yyyy"
                        className="form-control" 
                        placeholderText="Select dates"
                        required
                        disabled={formData.tripType === 'oneWay' && formData.returnDate !== null}
                        monthsShown={2}
                        showMonthDropdown
                        />
                      </div>
                    </div>

                    {/* Passengers Section */}
                    <div className="col-md-6 position-relative">
                      <label className="form-label fw-bold">Passengers</label>
                      <div
                        className="form-control d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({...prev, showPassengerDropdown: !prev.showPassengerDropdown}))}
                      >
                        <div>
                          <span className="me-2">{getTotalPassengers()} Passenger{getTotalPassengers() !== 1 ? 's' : ''}</span>
                          {getTotalPassengers() > 0 && (
                            <small className="text-muted d-block">({getPassengerSummary()})</small>
                          )}
                        </div>
                        <FontAwesomeIcon
                          icon={formData.showPassengerDropdown ? faChevronUp : faChevronDown}
                          className="text-muted"
                        />
                      </div>
                      
                      {formData.showPassengerDropdown && (
                        <div className="card position-absolute w-100 mt-1 z-3">
                          <div className="card-body p-3">
                            {/* Adult, Child, Infant Controls */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                <span>Adults (12+ yrs)</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={formData.tempPassengers.adults <= 1}
                                  onClick={() => updatePassengers('adults', 'decrease')}
                                >
                                  -
                                </button>
                                <span className="mx-3">{formData.tempPassengers.adults}</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={getTotalPassengers() >= 9}
                                  onClick={() => updatePassengers('adults', 'increase')}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <FontAwesomeIcon icon={faChild} className="me-2 text-primary" />
                                <span>Children (2-12 yrs)</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={formData.tempPassengers.children <= 0}
                                  onClick={() => updatePassengers('children', 'decrease')}
                                >
                                  -
                                </button>
                                <span className="mx-3">{formData.tempPassengers.children}</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={getTotalPassengers() >= 9}
                                  onClick={() => updatePassengers('children', 'increase')}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <div>
                                <FontAwesomeIcon icon={faBaby} className="me-2 text-primary" />
                                <span>Infants (under 2 yrs)</span>
                                <small className="d-block text-muted">On lap (max 1 per adult)</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={formData.tempPassengers.infants <= 0}
                                  onClick={() => updatePassengers('infants', 'decrease')}
                                >
                                  -
                                </button>
                                <span className="mx-3">{formData.tempPassengers.infants}</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  disabled={formData.tempPassengers.infants >= formData.tempPassengers.adults || getTotalPassengers() >= 9}
                                  onClick={() => updatePassengers('infants', 'increase')}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="text-end">
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleApplyPassengers}
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Separate Cabin Class Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Cabin Class</label>
                      <select
                        className="form-select"
                        value={travelClass} // Use separate state for travel class
                        onChange={(e) => setTravelClass(e.target.value)} // Update only travelClass
                      >
                        <option value="economy">Economy</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-primary btn-lg w-100 py-2 fw-bold">SEARCH FLIGHTS</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

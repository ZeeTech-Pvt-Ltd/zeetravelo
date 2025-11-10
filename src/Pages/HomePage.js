import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AirportSearch from '../Components/AirportSearch';
import NewFlightList from '../Components/NewFlightList';
import BookingDetails from './BookingDetails';



const HomePage = ({ searchParams, setSearchParams, confirmedPricingData, setConfirmedPricingData }) => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const parsedParams = {
      origin: params.get('origin'),
      destination: params.get('destination'),
      date: params.get('date'),
      returnDate: params.get('returnDate'),
      tripType: params.get('tripType'),
      adults: parseInt(params.get('adults')),
      children: parseInt(params.get('children')),
      infants: parseInt(params.get('infants')),
      travelClass: params.get('travelClass'),
    };

    if (parsedParams.origin && parsedParams.destination && parsedParams.date) {
      setSearchParams(parsedParams);
    } else {
      const stored = JSON.parse(localStorage.getItem('lastSearchParams'));
      if (stored) setSearchParams(stored);
    }
  }, [location.search, setSearchParams]);


  return (
    <div style={{ backgroundColor: 'rgb(245, 245, 245)', minHeight: '100vh', paddingBottom: '20px' }}>
      {/* <AirportSearch header="Zeetech Flight Booking System" setSearchParams={setSearchParams} /> */}
      <AirportSearch
        header="Zeetech Flight Booking System"
        setSearchParams={setSearchParams}
        initialValues={searchParams}
      />
      
      {searchParams.origin && searchParams.destination && searchParams.date && (
        <NewFlightList
          searchParams={searchParams}
          setConfirmedPricingData={setConfirmedPricingData}
        />
      )}
      {confirmedPricingData && (
        <BookingDetails confirmedBooking={confirmedPricingData} />
      )}
    </div>
  );
};

export default HomePage;

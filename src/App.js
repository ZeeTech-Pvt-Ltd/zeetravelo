import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import HomePage from './Pages/HomePage';
import AirportSearch from './Components/AirportSearch';
import Home from './Pages/Home';
import Navbar from './Components/Navbar';
import BaggageDetails from './Pages/BaggageDetails';
import TicketFare from './Pages/TicketFare';
import SeatingDetails from './Pages/SeatingDetails';
import FinalOverview from './Pages/FinalOverview';
import BookingConfirmation from './Pages/BookingConfirmation';
import NewFlightList from './Components/NewFlightList';
import OrderDetails from './Components/OrderDetails';
import BookingDetails from './Pages/BookingDetails';
import HotelSearch from './Components/HotelSearch';
import HotelBooking from './Components/HotelBooking';
import ConfirmBooking from './Pages/ConfirmBooking';
import DisplayBookingOrder from './Pages/DisplayBookingOrder';
import { SessionTimeoutProvider } from './Components/SessionTimeoutContext';
import CarSearch from './Components/CarSearch';
import CarBooking from './Pages/CarBooking';
import HotelApitude from './Components/HotelApitude';

const stepMap = {
  '/': 0,
  '/booking-details': 1,
  '/baggage-details': 2,
  '/ticket-fare': 3,
  '/seating-details': 4,
  '/final-overview': 5,
};

const StepAwareWrapper = ({ children }) => {
  const location = useLocation();
  const currentStep = stepMap[location.pathname] ?? 0;
  const hideNavbar = location.pathname === '/confirmation';

  return (
    <>
      {!hideNavbar && <Navbar currentStep={currentStep} />}
      {children}
    </>
  );
};

const AppRoutes = ({ searchParams, setSearchParams, confirmedPricingData, setConfirmedPricingData }) => (
  <Routes>
    {/* Routes inside SessionTimeoutProvider */}
    <Route
      path="/flights"
      element={
        <HomePage
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          confirmedPricingData={confirmedPricingData}
          setConfirmedPricingData={setConfirmedPricingData}
        />
      }
    />
    <Route
      path="/flight-results"
      element={
        <NewFlightList
          searchParams={searchParams}
          setConfirmedPricingData={setConfirmedPricingData}
        />
      }
    />
    <Route path="/hotels" element={<HotelSearch />} />
    <Route path="/cars" element={<CarSearch />} />
    <Route path="/hotel-booking" element={<HotelBooking />} />
    <Route path="/booking-details" element={<BookingDetails confirmedPricingData={confirmedPricingData} />} />
    <Route path="/baggage-details" element={<BaggageDetails />} />
    <Route path="/ticket-fare" element={<TicketFare />} />
    <Route path="/seating-details" element={<SeatingDetails />} />
    <Route path="/final-overview" element={<FinalOverview />} />
    <Route path="/confirmation" element={<BookingConfirmation />} />
    <Route path="/confirm-booking" element={<ConfirmBooking />} />
    <Route path="/display-order" element={<DisplayBookingOrder />} />
    <Route path="/car-booking" element={<CarBooking />} />
  </Routes>
);

const AppContent = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    returnDate: '',
    tripType: 'oneway',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'ECONOMY',
  });

  const [confirmedPricingData, setConfirmedPricingData] = useState(null);

  return (
    <StepAwareWrapper>
      <Routes>
        {/* Home route - outside SessionTimeoutProvider */}
        <Route
          path="/"
          element={<Home searchParams={searchParams} setSearchParams={setSearchParams} />}
        />
      </Routes>

      {/* All other routes wrapped in session timeout provider */}
      <SessionTimeoutProvider>
        <AppRoutes
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          confirmedPricingData={confirmedPricingData}
          setConfirmedPricingData={setConfirmedPricingData}
        />
      </SessionTimeoutProvider>
    </StepAwareWrapper>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';

const SessionTimeoutContext = createContext();

export const SessionTimeoutProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    token: false,
    pricing: false,
    bookingUpdate: false,
    flightUpdate: false
  });

  const [savedSearchParams, setSavedSearchParams] = useState(null);

  const timerRef = useRef(null);
  const pricingTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomepage = location.pathname === '/';

  const closeAllModals = useCallback(() => {
    setModalState({
      token: false,
      pricing: false,
      bookingUpdate: false,
      flightUpdate: false
    });
  }, []);

  // Save search params when on flights page
  useEffect(() => {
    if (location.pathname.startsWith('/flights')) {
      const params = Object.fromEntries(new URLSearchParams(location.search));
      setSavedSearchParams(params);
      localStorage.setItem('lastSearchParams', JSON.stringify(params));
    }
  }, [location.pathname, location.search]);

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    if (isHomepage) return;

    timerRef.current = setTimeout(() => {
      if (
        location.pathname !== '/booking-details' &&
        location.pathname !== '/baggage-details' &&
        !location.pathname.startsWith('/flights') &&
        !isHomepage
      ) {
        closeAllModals();
        setModalState(prev => ({ ...prev, token: true }));
      }
    }, 1 * 60 * 1000);
  }, [closeAllModals, isHomepage, location.pathname]);

  const startPricingTimer = useCallback(() => {
    clearTimeout(pricingTimerRef.current);
    if (isHomepage) return;

    if (
      location.pathname !== '/booking-details' &&
      location.pathname !== '/baggage-details' &&
      !location.pathname.startsWith('/flights')
    ) return;

    pricingTimerRef.current = setTimeout(() => {
      closeAllModals();
      if (!isHomepage) {
        setModalState(prev => ({ ...prev, pricing: true }));
      }
      startPricingTimer(); // restart loop
    }, 15 * 60 * 1000);   //15 minutes timer expier
  }, [closeAllModals, isHomepage, location.pathname]);

  const handleReload = useCallback(() => {
    if (isHomepage) return;

    let params = null;

    if (location.pathname.startsWith('/flights')) {
      params = Object.fromEntries(new URLSearchParams(location.search));
      setSavedSearchParams(params);
      localStorage.setItem('lastSearchParams', JSON.stringify(params));
    } else {
      if (savedSearchParams) {
        params = savedSearchParams;
      } else {
        const stored = localStorage.getItem('lastSearchParams');
        if (stored) {
          try {
            params = JSON.parse(stored);
          } catch {
            params = null;
          }
        }
      }
    }

    closeAllModals();

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      navigate(`/flights?${queryString}`);
    } else {
      navigate('/');
    }

    startTimer(); // restart timer
  }, [closeAllModals, isHomepage, location.pathname, location.search, navigate, savedSearchParams, startTimer]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(pricingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    closeAllModals();

    if (isHomepage) {
      // No timers for homepage
      return;
    }

    if (location.pathname === '/booking-details') {
      startPricingTimer();
    } else {
      startTimer();
    }
  }, [closeAllModals, isHomepage, location.pathname, startPricingTimer, startTimer]);

  return (
    <SessionTimeoutContext.Provider value={{ startTimer, startPricingTimer }}>
      {children}

      {/* Pricing Timeout Modal */}
      {!isHomepage && (
        <Modal show={modalState.pricing} onHide={handleReload} centered backdrop="static">
          <Modal.Header className="bg-primary text-white justify-content-center">
            <Modal.Title className="d-flex align-items-center gap-2">
              <BsClockHistory size={22} />
              Flight Prices Updated
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center fs-5">
            <br />
            The prices for the flights have been updated.
            <br /><br />
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button variant="primary" onClick={handleReload}>
              Reload Flights
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </SessionTimeoutContext.Provider>
  );
};

export const useSessionTimeout = () => useContext(SessionTimeoutContext);

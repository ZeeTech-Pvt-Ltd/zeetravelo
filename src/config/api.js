// API Configuration
// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  FLIGHTS: `${API_BASE_URL}/api/flights`,
  RETURN_FLIGHTS: `${API_BASE_URL}/api/return-flights`,
  FLIGHT_PRICING: `${API_BASE_URL}/api/flight-pricing`,
  BOOK_FLIGHT: `${API_BASE_URL}/api/book-flight`,
  LOCATIONS: `${API_BASE_URL}/api/locations`,
  LOCATIONS_AIRPORTS: `${API_BASE_URL}/api/locations/airports`,
  LOCATION_AIRPORT_BY_CODE: `${API_BASE_URL}/api/locations/airportByCode`,
  RECOMMENDED_LOCATIONS: `${API_BASE_URL}/api/recommended-locations`,
  HOTELS: `${API_BASE_URL}/api/hotels`,
  FETCH_HOTEL_OFFERS: `${API_BASE_URL}/api/fetch-hotel-offers`,
  BOOK_HOTEL: `${API_BASE_URL}/api/book-hotel`,
  HOTELBEDS_STATUS: `${API_BASE_URL}/api/hotelbeds-status`,
  TRANSFER_OFFERS: `${API_BASE_URL}/api/transfer-offers`,
  TRANSFER_BOOKING: `${API_BASE_URL}/api/transfer-booking`,
  SAVE_BOOKING: `${API_BASE_URL}/api/save-booking`,
  BOOKING_DETAILS: `${API_BASE_URL}/api/booking-details`,
  GET_TOKEN: `${API_BASE_URL}/api/getToken`,
};

export default API_BASE_URL;


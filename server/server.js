// server/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const qs = require('qs');
require('dotenv').config({ path: './.env' });


const app = express();
const port = process.env.PORT || 3001;
const BOOKINGS_FILE = path.join(__dirname, 'ConfirmedBookings.json');

// CORS configuration - allow Vercel deployments and localhost
const allowedOrigins = [
  "https://zeetravelo.vercel.app",
  /^https:\/\/zeetravelo.*\.vercel\.app$/, // Allow all Vercel preview deployments
  "http://localhost:3000",
  "http://localhost:3001"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// CORS middleware already handles OPTIONS preflight requests automatically
// No need for explicit app.options handler

app.use(express.json());



let accessToken = null; // Store the access token in memory (for simplicity, adjust for production)
let tokenExpiry = null;

// Function to fetch a new access token
const getAmadeusAccessToken = async () => {
  const clientId = process.env.AMADEUS_API_KEY;
  const clientSecret = process.env.AMADEUS_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API keys not configured on the server.');
  }

  const data = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://test.api.amadeus.com/v1/security/oauth2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000); // Store expiry time
    console.log('New access token fetched.');
    return accessToken;
  } catch (error) {
    console.error('Error fetching new access token:', error);
    throw error;
  }
};


// Middleware to ensure a valid access token
const ensureAccessToken = async (req, res, next) => {
  if (!accessToken || Date.now() >= tokenExpiry - (60 * 1000)) { // Refresh token if it's expired or about to expire
    try {
      await getAmadeusAccessToken();
      if (!accessToken) {
        return res.status(500).json({ error: 'Failed to obtain Amadeus access token - token is null.' });
      }
    } catch (error) {
      console.error('Error in ensureAccessToken:', error);
      return res.status(500).json({ error: 'Failed to obtain Amadeus access token.', details: error.message });
    }
  }
  next();
};

// Initial token fetch on server start (optional, can be triggered by the first request)
getAmadeusAccessToken().catch(error => console.error('Initial token fetch failed:', error));

app.listen(port, () => {
  console.log(`Node.js server listening on port ${port}`);
});

// Endpoint to fetch locations (previously for Airports but now for Hotels)
app.get('/api/locations', ensureAccessToken, async (req, res) => {
  const { keyword } = req.query;
  const apiUrl = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${keyword}&page[limit]=5&page[offset]=0&sort=analytics.travelers.score&view=FULL`;


  const response = await axios.get(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  res.json(response.data);

});


// Load airports.json once at server startup
let airports = [];
try {
  const data = fs.readFileSync(path.join(__dirname, '../src/data/airports.json'), 'utf8');
  airports = JSON.parse(data);
  console.log(`Loaded ${airports.length} airports from JSON.`);
} catch (err) {
  console.error('Error reading airports.json:', err);
}

// Endpoint to fetch airport locations (from local JSON instead of Amadeus API)
app.get('/api/locations/airports', (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Missing keyword parameter.' });
  }

 // Filter airports by name or IATA code (case-insensitive, with null checks)
const filtered = airports.filter(airport => {
  const name = airport.name ? airport.name.toLowerCase() : '';
  const iata = airport.iata ? airport.iata.toLowerCase() : '';
  return name.includes(keyword.toLowerCase()) || iata.includes(keyword.toLowerCase());
}).slice(0, 5);


  // Map to match Amadeus-like format
  const result = filtered.map((airport, index) => ({
    id: index,  // Optional: you can replace with airport.iata
    name: airport.name,
    iataCode: airport.iata,
    address: {
      cityName: '',               // No city field in your JSON → keep blank
      countryCode: airport.iso || ''
    }
  }));

  res.json({ data: result });
});


// Endpoint to fetch flight offers
app.get('/api/flights', ensureAccessToken, async (req, res) => {
  const { origin, destination, date, adults, children = 0, infants = 0, travelClass = 'ECONOMY' } = req.query;

  if (!origin || !destination || !date || !adults) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }

  try {
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: parseInt(adults),
        ...(children > 0 && { children: parseInt(children) }),
        ...(infants > 0 && { infants: parseInt(infants) }),
        ...(travelClass && { travelClass })
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight offers:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch flight offers.',
      details: error.response?.data || error.message 
    });
  }
});

//Endpoint to fetchdata from hotelBeds
app.get('/api/hotelbeds-status', async (req, res) => {
  const apiKey = "99031ea372dd1e7e4d94d9babe738dcd";
  const secret = "f53834167f";

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString(); // in seconds
    const rawSignature = apiKey + secret + timestamp;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawSignature, 'utf8')
      .digest('hex');

    const headers = {
      'Api-Key': apiKey,
      'X-Signature': signature,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip'
    };

    const response = await axios.get(
      'https://api.test.hotelbeds.com/hotel-api/1.0/status',
      { headers }
    );

    return res.json({
      status: "Success",
      timestamp,
      signature,
      data: response.data
    });

  } catch (error) {
    console.error("HotelBeds Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      status: "Failed",
      message: error.response?.data || error.message
    });
  }
});

// Airport lookup by IATA code
app.get('/api/locations/airportByCode', ensureAccessToken, async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'IATA code is required in query params (e.g., ?code=DEL)' });
  }

  try {
    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        keyword: code,
        subType: 'AIRPORT',
      },
    });

    const location = response.data?.data?.find(loc => loc.iataCode === code.toUpperCase());

    if (!location) {
      return res.status(404).json({ error: `No airport found with IATA code ${code}` });
    }

    res.json({
      name: location.name,
      iataCode: location.iataCode,
      cityName: location.address?.cityName || '',
      countryName: location.address?.countryName || '',
    });
  } catch (error) {
    console.error('Error fetching airport by code:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch airport information.' });
  }
});


// Return trip flights via POST
app.post('/api/return-flights', ensureAccessToken, async (req, res) => {
  const { originDestinations, travelers, sources, currencyCode } = req.body;

  if (!originDestinations || originDestinations.length !== 2 || !travelers || !sources || !currencyCode) {
    return res.status(400).json({ error: 'Missing or invalid fields in request body.' });
  }

  const requestData = {
    currencyCode,
    originDestinations,
    travelers,
    sources
  };

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Return flight search failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch return flight data.' });
  }
});

// Endpoint to fetch return trip flights
app.post('/api/flights', ensureAccessToken, async (req, res) => {
  const { origin, destination, date, adults } = req.body;

  if (!origin || !destination || !date || !adults) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const requestData = {
    currencyCode: "USD",
    originDestinations: [
      {
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: {
          date: date
        }
      }
    ],
    travelers: Array.from({ length: adults }, (_, i) => ({
      id: (i + 1).toString(),
      travelerType: "ADULT"
    })),
    sources: ["GDS"]
  };

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Flight search failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch flight data.' });
  }
});


// Endpoint to confirm flight pricing
app.post('/api/flight-pricing', ensureAccessToken, async (req, res) => {
  const flightOffer = req.body;

  if (!flightOffer) {
    return res.status(400).json({ error: 'Flight offer data is required.' });
  }

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/shopping/flight-offers/pricing',
      {
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
    //console.log(response.data);
  } catch (error) {
    console.error('Error confirming flight pricing:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to confirm flight pricing.' });
  }
});

// Booking Final Flight
app.post('/api/book-flight', ensureAccessToken, async (req, res) => {
  try {
    const { flightOffer, travelers } = req.body;

    if (!flightOffer || !Array.isArray(travelers) || travelers.length === 0) {
      return res.status(400).json({ error: 'Flight offer and a non-empty travelers array are required.' });
    }

    const response = await axios.post(
      'https://test.api.amadeus.com/v1/booking/flight-orders',
      {
        data: {
          type: 'flight-order',
          flightOffers: [flightOffer],
          travelers: travelers,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Booking Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: 'Failed to book flight.',
      details: error.response?.data || error.message,
    });
  }
});

// Endpoint to fetch recommended locations (hardcoded for testing)
app.get('/api/recommended-locations', ensureAccessToken, async (req, res) => {
  const { origin, travelerCountryCode } = req.query;

  if (!origin) {
    return res.status(400).json({ error: 'Origin IATA code is required.' });
  }

  console.log('--- Fetching Recommended Locations ---');
  console.log('Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('Request Params:', { cityCodes: origin, travelerCountryCode });

  try {
    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/recommended-locations', {
      params: {
        cityCodes: origin,
        ...(travelerCountryCode && { travelerCountryCode })  // include only if provided
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Amadeus API Response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    const errData = error.response?.data || error.message;
    const status = error.response?.status || 500;
    console.error(`Error (${status}) fetching recommended locations:`, errData);
    res.status(status).json({ error: 'Failed to fetch recommended locations.', details: errData });
  }
});



// Append booking to JSON file

// Helper to read bookings safely
function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading bookings:', err);
    return [];
  }
}

// POST route to save booking
app.post('/api/save-booking', (req, res) => {
  const newBooking = req.body;

  fs.readFile(BOOKINGS_FILE, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading bookings:', err);
      return res.status(500).json({ error: 'Failed to read bookings' });
    }

    let bookings = [];
    if (data) {
      try {
        bookings = JSON.parse(data);
        if (!Array.isArray(bookings)) bookings = [];
      } catch (parseErr) {
        console.error('Error parsing bookings JSON:', parseErr);
        bookings = [];
      }
    }

    // Assign entryId incrementally
    const lastEntry = bookings[bookings.length - 1];
    const newEntryId = lastEntry ? lastEntry.entryId + 1 : 1;

    // Create full booking entry
    const bookingEntry = {
      entryId: newEntryId,
      entryTime: new Date().toISOString(),
      bookingData: newBooking
    };

    bookings.push(bookingEntry);

    // Write back the whole array as valid JSON
    fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error saving booking:', writeErr);
        return res.status(500).json({ error: 'Failed to save booking' });
      }
      console.log(`Booking saved with entryId: ${newEntryId}`);
      res.json({ message: 'Booking saved successfully', entryId: newEntryId });
    });
  });
});

// === GET Booking Order Details by ID ===
app.get('/api/booking-details/:id', async (req, res) => {
  const flightOrderId = req.params.id;

  try {
    const response = await axios.get(
      `https://test.api.amadeus.com/v1/booking/flight-orders/${flightOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching booking details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch booking details from Amadeus' });
  }
});

//***********************************Hotels****************************************** */
// Endpoint to confirm hotel Search
app.get('/api/hotels', ensureAccessToken, async (req, res) => {
  const {
    cityCode,
    radius = 5,
    radiusUnit = 'KM',
    hotelSource = 'ALL',
    checkInDate,
    checkOutDate,
    adults = 1,
    roomQuantity = 1,
  } = req.query;

  if (!cityCode || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  const hotelListUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=${radius}&radiusUnit=${radiusUnit}&hotelSource=${hotelSource}`;

  try {
    const hotelResponse = await axios.get(hotelListUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const hotels = hotelResponse.data.data || [];
    const hotelIds = hotels.map(h => h.hotelId).slice(0, 20); // limit for demo

    if (!hotelIds.length) {
      return res.json({ data: [] });
    }

    // Return only hotels list here
    res.json({ data: hotels });
  } catch (error) {
    console.error('Hotel search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});


// Endpoint to confirm hotel Offers (Hotel Offers)
app.get('/api/fetch-hotel-offers', ensureAccessToken, async (req, res) => {
  const { hotelIds, checkInDate, checkOutDate, adults, roomQuantity, currency } = req.query;

  if (!hotelIds || !checkInDate || !checkOutDate || !adults || !roomQuantity || !currency) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const response = await axios.get('https://test.api.amadeus.com/v3/shopping/hotel-offers', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        hotelIds,
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity,
        currency
      }
    });

    res.json(response.data); // Return the fetched data
  } catch (err) {
    console.error("Hotel offers fetch error:", err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch hotel offers',
      details: err.response?.data || err.message
    });
  }
});


// Endpoint to confirm hotel booking (hotel-orders)
app.post('/api/book-hotel', ensureAccessToken, async (req, res) => {
  const { offerId, guests, payments } = req.body;

  if (!offerId) {
    return res.status(400).json({ error: 'Missing required field: offerId.' });
  }

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'guests must be a non-empty array.' });
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ error: 'payments must be a non-empty array.' });
  }

  const payload = JSON.stringify({
    data: {
      offerId,
      guests,
      payments
    }
  });

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/booking/hotel-orders',
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
    console.log('Hotel booking confirmed:', response.data);
  } catch (error) {
    console.error('Error booking hotel:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to book hotel.',
      details: error.response?.data || error.message
    });
  }
});


//***********************************Cars****************************************** */

// Endpoint to fetch transfer offers
app.post('/api/transfer-offers', ensureAccessToken, async (req, res) => {
  const payload = req.body;

  if (!payload || !payload.startLocationCode || !payload.startDateTime || !payload.endAddressLine) {
    return res.status(400).json({ error: 'Missing required transfer booking details.' });
  }

  const apiUrl = 'https://test.api.amadeus.com/v1/shopping/transfer-offers';

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transfer offers:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch transfer offers.' });
  }
});

// Endpoint to confirm a transfer booking
app.post('/api/transfer-booking', ensureAccessToken, async (req, res) => {
  const payload = req.body;

  // Validate basic structure
  if (!payload?.data?.passengers || !payload?.data?.payment) {
    return res.status(400).json({ error: 'Missing required transfer booking fields.' });
  }

  const apiUrl = 'https://test.api.amadeus.com/v1/ordering/transfer-orders';

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error booking transfer:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to book transfer.' });
  }
});

import axios from 'axios';
import qs from 'qs';

const API_ENDPOINT = 'http://localhost:3001/api/getToken'; // Your Node.js API endpoint

export const fetchToken = async () => {
  try {
    const data = qs.stringify({
      'grant_type': 'client_credentials',
      'client_id': 'a0ggdS90FKAWV3XJnPDKIujLR1843fAp',
      'client_secret': 'Pr4N0g8WPIWOqqNx'
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: API_ENDPOINT,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: data
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error; // Re-throw the error to be caught in the component
  }
};
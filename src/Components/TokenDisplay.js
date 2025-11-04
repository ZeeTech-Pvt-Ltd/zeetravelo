import React, { useState, useEffect } from 'react';
import { fetchToken } from '../services/api'; // Import the API function

function TokenDisplay() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const data = await fetchToken();
        setTokenData(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    getToken();
  }, []);

  if (loading) {
    return <div>Loading token...</div>;
  }

  if (error) {
    return <div>Error fetching token: {error.message}</div>;
  }

  return (
    <div>
      <h2>Token Information</h2>
      {tokenData && (
        <div>
          <p>Application Name: {tokenData.application_name}</p>
          <p>Client ID: {tokenData.client_id}</p>
          <p>Token Type: {tokenData.token_type}</p>
          <p>Access Token: {tokenData.access_token}</p>
          <p>Expires In: {tokenData.expires_in}</p>
          <p>State: {tokenData.state}</p>
          <p>Scope: {tokenData.scope}</p>
        </div>
      )}
    </div>
  );
}

export default TokenDisplay;
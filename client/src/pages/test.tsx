import React, { useState } from 'react';
import axios from 'axios';

const TestComponent = () => {
  const [response, setResponse] = useState(null);

  const handleClick = async () => {
    try {
      // Replace 'yourUrlString' with the actual URL string you want to send
      const urlToSend = 'https://www.youtube.com/watch?v=QjihRb2E-YA';
      const response = await axios.post('http://127.0.0.1:8000/api/v1/url/', { url: urlToSend });
      console.log(response.data);
      setResponse(response.data); // Update the state with the response data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Send Request</button>
      {response && <p>Response: {JSON.stringify(response)}</p>}
    </div>
  );
};

export default TestComponent;

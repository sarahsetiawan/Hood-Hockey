import React, { useState, useEffect } from 'react';

function Skaters() {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setImageData(data.image);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Skaters</h1>
      <br />
      <h2>Scatterplot of Max Speed vs Goals</h2>
      {imageData ? (
        <img src={`data:image/png;base64,${imageData}`} alt="Scatterplot" />
      ) : (
        <div>No image data found.</div>
      )}
    </div>
  );
}

export default Skaters;
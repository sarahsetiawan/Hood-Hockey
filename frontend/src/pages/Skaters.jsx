// Skaters.jsx
import React, { useState, useEffect } from 'react';

function Skaters() {
  const [skaters, setSkaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkaters = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSkaters(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSkaters();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return <div>Loading skaters data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!skaters || skaters.length === 0) {
    return <div>No skater data found.</div>;
  }

  // Get the column names from the first skater object (assuming all objects have the same structure)
  const columns = skaters.length > 0 ? Object.keys(skaters[0]) : [];

  return (
    <div>
      <h2>Skaters Data</h2>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skaters.map((skater, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{skater[column] !== null ? skater[column].toString() : 'N/A'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Skaters;
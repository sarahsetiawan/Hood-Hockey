import React, { useState, useEffect } from 'react';

function Drive() {
  const [driveData, setDriveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriveData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/drive-query/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDriveData(data.drive); 
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDriveData();
  }, []);

  if (loading) {
    return <div>Loading drive data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!driveData || driveData.length === 0) {
    return <div>No drive data found.</div>;
  }

  return (
    <div>
      <h2>Drive Data</h2>
      <table>
        <thead>
          <tr>
            {Object.keys(driveData[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {driveData.map((drive, index) => (
            <tr key={index}>
              {Object.values(drive).map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Drive;
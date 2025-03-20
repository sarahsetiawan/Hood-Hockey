import React, { useState, useEffect } from 'react';

function Goalies() {
  const [goalies, setGoalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoaliesData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/goalies-query/'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGoalies(data.goalies); 
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchGoaliesData();
  }, []);

  if (loading) {
    return <div>Loading goalies data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
    if (!goalies || goalies.length === 0) {
    return <div>No goalie data found.</div>;
  }

  return (
    <div>
      <h2>Goalies Data</h2>
      <table>
        <thead>
          <tr>
            {/* Dynamically generate table headers */}
            {Object.keys(goalies[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {goalies.map((goalie, index) => (
            <tr key={index}>
              {/* Dynamically generate table cells */}
              {Object.values(goalie).map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Goalies;
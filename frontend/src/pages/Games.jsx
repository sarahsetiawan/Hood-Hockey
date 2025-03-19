import React, { useState, useEffect } from 'react';

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/games-query/'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data.games); // Access the 'games' key from the response
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchGamesData();
  }, []);

  if (loading) {
    return <div>Loading games data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!games || games.length === 0) {
    return <div>No games data found.</div>;
  }

  return (
    <div>
      <h2>Games Data</h2>
      <table>
        <thead>
          <tr>
            {/* Dynamically generate table headers from the first game object */}
            {Object.keys(games[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={index}>
              {/* Dynamically generate table cells from each game object */}
              {Object.values(game).map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Games;
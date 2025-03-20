import React, { useState, useEffect } from 'react';

function Games() {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [graphImage, setGraphImage] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [errorGraph, setErrorGraph] = useState(null);

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/games-query/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data.games);
        setLoadingGames(false);
      } catch (error) {
        setErrorGames(error.message);
        setLoadingGames(false);
      }
    };

    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/faceoff-wins-graph/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGraphImage(`data:image/png;base64,${data.image}`);
        setLoadingGraph(false);
      } catch (error) {
        setErrorGraph(error.message);
        setLoadingGraph(false);
      }
    };

    fetchGamesData();
    fetchGraphData();
  }, []);

  if (loadingGames || loadingGraph) {
    return <div>Loading data...</div>;
  }

  if (errorGames || errorGraph) {
    return (
      <div>
        {errorGames && <div>Error loading games: {errorGames}</div>}
        {errorGraph && <div>Error loading graph: {errorGraph}</div>}
      </div>
    );
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
            {Object.keys(games[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={index}>
              {Object.values(game).map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Faceoff Win Percentage Over Time</h2>
      {graphImage && <img src={graphImage} alt="Faceoff Win Percentage" />}
    </div>
  );
}

export default Games;
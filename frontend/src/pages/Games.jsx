import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Image, Container, Row, Col } from 'react-bootstrap';

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
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Loading data...</p>
      </Container>
    );
  }

  if (errorGames || errorGraph) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {errorGames && <p>Error loading games: {errorGames}</p>}
          {errorGraph && <p>Error loading graph: {errorGraph}</p>}
        </Alert>
      </Container>
    );
  }

  if (!games || games.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">No games data found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>Games Data</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {Object.keys(games[0]).map((key) => (
                  <th key={key}>{key.replace('game_', '').replace(/([A-Z])/g, ' $1').trim()}</th>
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
          </Table>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h2>Faceoff Win Percentage Over Time</h2>
          {graphImage && <Image src={graphImage} alt="Faceoff Win Percentage" fluid />}
        </Col>
      </Row>
    </Container>
  );
}

export default Games;
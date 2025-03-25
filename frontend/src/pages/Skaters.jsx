import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table } from 'react-bootstrap';

function Skaters() {
  const [imageData, setImageData] = useState(null);
  const [topForwards, setTopForwards] = useState([]); // State for top forwards
  const [topDefenders, setTopDefenders] = useState([]); // State for top defenders
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch scatterplot image
        const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (!imageResponse.ok) {
          throw new Error(`HTTP error! status: ${imageResponse.status}`);
        }
        const imageData = await imageResponse.json();
        setImageData(imageData.image);

        // Fetch GAR data
        const garResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/gar/'); // Replace with your GAR endpoint
        if (!garResponse.ok) {
          throw new Error(`HTTP error! status: ${garResponse.status}`);
        }
        const garData = await garResponse.json();
        setTopForwards(garData.top_forwards);
        setTopDefenders(garData.top_defenders);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1>Skaters</h1>
          <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
          {imageData ? (
            <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid />
          ) : (
            <Alert variant="info">No image data found.</Alert>
          )}

          <h2 className="mt-5">Top Players by PAR (Points Above Replacement)</h2>

          <Row>
            <Col md={6}>
              <h3>Top 5 Forwards</h3>
              {topForwards.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Assists</th>
                      <th>PAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topForwards.map((player, index) => (
                      <tr key={index}>
                        <td>{player['Shirt number']}</td>
                        <td>{player['Player']}</td>
                        <td>{player['Position']}</td>
                        <td>{player['Assists']}</td>
                        <td>{player['PAR'].toFixed(2)}</td> {/* Display PAR to 2 decimal places */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No forward data available.</Alert>
              )}
            </Col>

            <Col md={6}>
              <h3>Top 5 Defenders</h3>
              {topDefenders.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Position</th>
                        <th>Assists</th>
                      <th>PAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDefenders.map((player, index) => (
                      <tr key={index}>
                        <td>{player['Shirt number']}</td>
                        <td>{player['Player']}</td>
                        <td>{player['Position']}</td>
                        <td>{player['Assists']}</td>
                        <td>{player['PAR'].toFixed(2)}</td> {/* Display PAR to 2 decimal places */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No defender data available.</Alert>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Skaters;
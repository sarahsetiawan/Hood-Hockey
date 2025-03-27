// C:\repos\Hood-Hockey\frontend\src\pages\Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api'; // Use your API instance if fetching protected data

function Home() {
  // Add state for loading summaries if fetching data
  const [summaryData, setSummaryData] = useState({
      latestGame: null,
      topSkater: null,
      goalieAvg: null,
      // Add more summary points as needed
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchSummaries = async () => {
          setLoading(true);
          setError(null);
          try {
              // Example: Fetch small pieces of data for the dashboard
              // You'll need backend endpoints for these summaries
              // const gameRes = await api.get('/hood_hockey_app/summary/latest-game/');
              // const skaterRes = await api.get('/hood_hockey_app/summary/top-skater/');
              // const goalieRes = await api.get('/hood_hockey_app/summary/goalie-avg/');

              // Mock data for now:
              const mockSummary = {
                  latestGame: { date: '2024-03-10', opponent: 'Rival Team', scoreHC: 5, scoreOpp: 3, id: 1 },
                  topSkater: { Player: 'Player One', Metric: 'Points', Value: 15, GAR: 2.5, id: 101 },
                  goalieAvg: { savePercentage: 0.915 }
              };

              // Simulate API delay
              await new Promise(resolve => setTimeout(resolve, 500));

              // setSummaryData({
              //     latestGame: gameRes.data,
              //     topSkater: skaterRes.data,
              //     goalieAvg: goalieRes.data
              // });
              setSummaryData(mockSummary);

          } catch (err) {
              console.error("Error fetching dashboard summaries:", err);
              setError("Could not load dashboard summaries.");
          } finally {
              setLoading(false);
          }
      };

      fetchSummaries();
  }, []);


  return (
    <Container fluid className="mt-4"> {/* Use fluid container for full width */}
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard Overview</h1>
        </Col>
      </Row>

      {loading && (
          <div className="text-center"><Spinner animation="border" /> Loading dashboard...</div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
          <Row xs={1} md={2} lg={3} className="g-4"> {/* Grid for cards */}
              {/* Example Card: Latest Game */}
              {summaryData.latestGame && (
                  <Col>
                      <Card>
                          <Card.Header as="h5">Latest Game</Card.Header>
                          <Card.Body>
                              <Card.Title>{summaryData.latestGame.date} vs {summaryData.latestGame.opponent}</Card.Title>
                              <Card.Text>
                                  Result: HC {summaryData.latestGame.scoreHC} - Opp {summaryData.latestGame.scoreOpp}
                              </Card.Text>
                              <Link to="/games" className="btn btn-primary btn-sm">View All Games</Link>
                          </Card.Body>
                      </Card>
                  </Col>
              )}

              {/* Example Card: Top Skater */}
              {summaryData.topSkater && (
                   <Col>
                      <Card>
                          <Card.Header as="h5">Top Skater Highlight</Card.Header>
                          <Card.Body>
                              <Card.Title>{summaryData.topSkater.Player}</Card.Title>
                              <Card.Text>
                                  Leading in {summaryData.topSkater.Metric}: {summaryData.topSkater.Value} ({summaryData.topSkater.GAR?.toFixed(2)} GAR)
                              </Card.Text>
                              <Link to="/skaters" className="btn btn-primary btn-sm">View Skater Stats</Link>
                          </Card.Body>
                      </Card>
                  </Col>
              )}

              {/* Example Card: Goalie Average */}
               {summaryData.goalieAvg && (
                   <Col>
                      <Card>
                          <Card.Header as="h5">Goalie Performance</Card.Header>
                          <Card.Body>
                              <Card.Title>Average Save %</Card.Title>
                              <Card.Text className="fs-4 fw-bold">
                                  {(summaryData.goalieAvg.savePercentage * 100).toFixed(1)}%
                              </Card.Text>
                              <Link to="/goalies" className="btn btn-primary btn-sm">View Goalie Stats</Link>
                          </Card.Body>
                      </Card>
                  </Col>
              )}

              {/* Example Card: Quick Upload Link */}
              <Col>
                  <Card>
                      <Card.Header as="h5">Data Management</Card.Header>
                      <Card.Body>
                          <Card.Title>Upload New Data</Card.Title>
                          <Card.Text>
                              Upload new Skaters, Goalies, Games, Lines, or Drive files.
                          </Card.Text>
                          <Link to="/upload" className="btn btn-success btn-sm">Go to Upload</Link>
                      </Card.Body>
                  </Card>
              </Col>

              {/* Add more cards for Lines, Drive summaries etc. */}
          </Row>
      )}
    </Container>
  );
}

export default Home;
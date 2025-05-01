// --- START OF FILE Games.js ---

import React, { useState, useEffect } from 'react';
// Keep original fetch, but axios might be better for handling multiple requests if you refactor later
// import axios from 'axios';
import { Table, Spinner, Alert, Image, Container, Row, Col } from 'react-bootstrap';
import Plot from 'react-plotly.js'; // Import Plotly component

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Games() {
  // --- Existing State ---
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [graphImage, setGraphImage] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [errorGraph, setErrorGraph] = useState(null);
  // --- End Existing State ---

  // --- ADDED State for Logistic Regression Data ---
  const [logRegAccuracy, setLogRegAccuracy] = useState(null);
  const [logRegCoefChartData, setLogRegCoefChartData] = useState(null); // Parsed chart object
  const [logRegViolinChartData, setLogRegViolinChartData] = useState(null); // Parsed chart object
  const [loadingLogReg, setLoadingLogReg] = useState(true); // Specific loading state
  const [errorLogReg, setErrorLogReg] = useState(null); // Specific error state
  // --- END ADDED State ---

  useEffect(() => {
    // --- Existing Fetch Functions ---
    const fetchGamesData = async () => {
      // Keep setLoadingGames true at start
      try {
        // Using fetch as originally used
        const response = await fetch(`${API_BASE_URL}/games-query/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data.games);
      } catch (error) {
        console.error("Error fetching games:", error);
        setErrorGames(error.message); // Set specific games error
      } finally {
        setLoadingGames(false); // Set games loading false
      }
    };

    const fetchGraphData = async () => {
       // Keep setLoadingGraph true at start
      try {
        const response = await fetch(`${API_BASE_URL}/faceoff-wins-graph/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGraphImage(`data:image/png;base64,${data.image}`);
      } catch (error) {
        console.error("Error fetching graph image:", error);
        setErrorGraph(error.message); // Set specific graph error
      } finally {
        setLoadingGraph(false); // Set graph loading false
      }
    };
    // --- End Existing Fetch Functions ---

    // --- ADDED Fetch Function for Logistic Regression Data ---
    const fetchLogRegData = async () => {
      setLoadingLogReg(true); // Set LogReg loading true
      setErrorLogReg(null); // Clear previous LogReg error
      try {
        // --- Ensure this endpoint matches your urls.py ---
        const response = await fetch(`${API_BASE_URL}/LogReg/`); 

        if (!response.ok) {
          let errorMsg = `LogReg fetch failed: ${response.status}`;
          try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){}
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("LogReg Data Received:", data); // Log to check received data

        // Set accuracy state
        setLogRegAccuracy(data.mean_cv_accuracy ?? 'N/A'); // Use nullish coalescing

        // Safely parse and set coefficient chart data
        if (data.coefficients_chart_json) {
          try {
            setLogRegCoefChartData(JSON.parse(data.coefficients_chart_json));
          } catch (e) {
            console.error("Error parsing coefficient chart JSON:", e);
            setErrorLogReg("Failed to parse coefficient chart data."); // Set specific error
            setLogRegCoefChartData(null); // Ensure state is null on error
          }
        } else {
          console.warn("Coefficient chart JSON missing from response.");
          setLogRegCoefChartData(null);
        }

        // Safely parse and set violin chart data
        if (data.violin_chart_json) {
           try {
            setLogRegViolinChartData(JSON.parse(data.violin_chart_json));
          } catch (e) {
            console.error("Error parsing violin chart JSON:", e);
            setErrorLogReg("Failed to parse violin chart data."); // Set or append specific error
            setLogRegViolinChartData(null); // Ensure state is null on error
          }
        } else {
           console.warn("Violin chart JSON missing from response.");
           setLogRegViolinChartData(null);
        }

      } catch (error) {
        console.error("Error fetching LogReg data:", error);
        setErrorLogReg(error.message); // Set specific LogReg error
        // Ensure states are reset on error
        setLogRegAccuracy(null);
        setLogRegCoefChartData(null);
        setLogRegViolinChartData(null);
      } finally {
        setLoadingLogReg(false); // Set LogReg loading false
      }
    };
    // --- END ADDED Fetch Function ---

    // Call all fetch functions
    fetchGamesData();
    fetchGraphData();
    fetchLogRegData(); // ADDED Call

  }, []); // Keep empty dependency array for mount-only fetch

    // --- Modified Loading Check ---
    // Show spinner if ANY of the primary data sources are loading
    if (loadingGames || loadingGraph || loadingLogReg) {
        return (
          <Container className="text-center mt-5">
            <Spinner animation="border" role="status" />
            {/* Be more specific or keep general */}
            <p>Loading Hockey Data...</p>
          </Container>
        );
      }

    // --- Modified Error Check ---
    // Show combined error messages if any occurred
    const anyError = errorGames || errorGraph || errorLogReg;
    if (anyError) {
        return (
          <Container className="mt-5">
            <Alert variant="danger">
              <Alert.Heading>Error Loading Data</Alert.Heading>
              {errorGames && <p>Games Data Error: {errorGames}</p>}
              {errorGraph && <p>Graph Image Error: {errorGraph}</p>}
              {errorLogReg && <p>Regression Analysis Error: {errorLogReg}</p>}
            </Alert>
          </Container>
        );
      }

    // --- Existing Check for No Games Data ---
    // (Keep this as it might still be relevant for table rendering)
    // if (!games || games.length === 0) {
    //     return (
    //       <Container className="mt-5">
    //         <Alert variant="info">No games data found.</Alert>
    //       </Container>
    //     );
    // }


  // --- Combined Render ---
  return (
    <Container>
      {/* --- Existing Games Table Section --- */}
      {/* Render only if games data is actually available */}
      {games && games.length > 0 ? (
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
                         <td key={cellIndex}>{value !== null && value !== undefined ? String(value) : ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
         </Row>
      ) : (
           <Alert variant="warning" className="mt-3">Games data is unavailable.</Alert>
      )}
      {/* --- End Existing Games Table Section --- */}


      {/* --- Existing Faceoff Graph Section --- */}
      <Row className="mt-4">
        <Col>
          <h2>Faceoff Win Percentage Over Time</h2>
           {/* Render graph only if image exists */}
          {graphImage ? (
             <Image src={graphImage} alt="Faceoff Win Percentage" fluid />
          ) : (
             <Alert variant="warning">Faceoff graph image is unavailable.</Alert>
          )}
        </Col>
      </Row>
      {/* --- End Existing Faceoff Graph Section --- */}


      {/* --- ADDED Logistic Regression Section --- */}
      <Row className="mt-5"> {/* Add more top margin */}
          <Col>
             <h2>Game Outcome Prediction Analysis (Logistic Regression)</h2>

              {/* Display Accuracy */}
              {logRegAccuracy !== null && (
                  <Alert variant="secondary">
                      Mean Cross-Validation Accuracy: {typeof logRegAccuracy === 'number' ? logRegAccuracy.toFixed(4) : logRegAccuracy}
                  </Alert>
              )}

              {/* Coefficient Chart */}
              <h4 className="mt-4">Top Feature Importances</h4>
              {logRegCoefChartData ? (
                   <Plot
                      data={logRegCoefChartData.data}
                      layout={logRegCoefChartData.layout}
                      useResizeHandler={true}
                      style={{ width: '100%', minHeight: '450px' }} // Use minHeight
                      config={{ responsive: true }}
                  />
              ) : (
                  // Show unavailable only if not loading and no specific error occurred for this chart
                  !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Coefficient chart data unavailable.</Alert>
              )}

              {/* Violin Chart */}
              <h4 className="mt-4">Feature Distributions by Outcome</h4>
              {logRegViolinChartData ? (
                   <Plot
                      data={logRegViolinChartData.data}
                      layout={logRegViolinChartData.layout}
                      useResizeHandler={true}
                      style={{ width: '100%', minHeight: '500px' }} // Use minHeight
                      config={{ responsive: true }}
                  />
              ) : (
                   // Show unavailable only if not loading and no specific error occurred for this chart
                   !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Violin chart data unavailable.</Alert>
              )}
          </Col>
      </Row>
      {/* --- END ADDED Logistic Regression Section --- */}

    </Container>
  );
}

export default Games;
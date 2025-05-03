// --- START OF FILE Games.js ---

import React, { useState, useEffect } from 'react';
// Removed Image import
import { Table, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import Plot from 'react-plotly.js'; // Keep Plotly import

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Games() {
  // --- Existing State ---
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  // const [graphImage, setGraphImage] = useState(null); // REMOVED Image state
  // const [loadingGraph, setLoadingGraph] = useState(true); // Will rename this
  // const [errorGraph, setErrorGraph] = useState(null); // Will rename this

  // --- LogReg State (Unchanged) ---
  const [logRegAccuracy, setLogRegAccuracy] = useState(null);
  const [logRegCoefChartData, setLogRegCoefChartData] = useState(null);
  const [logRegViolinChartData, setLogRegViolinChartData] = useState(null);
  const [loadingLogReg, setLoadingLogReg] = useState(true);
  const [errorLogReg, setErrorLogReg] = useState(null);
  // --- End LogReg State ---

  // --- ADDED State for Faceoff Chart ---
  const [faceoffChartData, setFaceoffChartData] = useState(null); // Parsed Plotly object
  const [loadingFaceoffChart, setLoadingFaceoffChart] = useState(true); // Renamed loading state
  const [errorFaceoffChart, setErrorFaceoffChart] = useState(null); // Renamed error state
  // --- END ADDED State ---


  useEffect(() => {
    // --- Fetch Games Data (Unchanged) ---
    const fetchGamesData = async () => { try { const response = await fetch(`${API_BASE_URL}/games-query/`); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); setGames(data.games || []); /* Added fallback */ } catch (error) { console.error("Error fetching games:", error); setErrorGames(error.message); } finally { setLoadingGames(false); } };

    // --- MODIFIED: Fetch Faceoff Chart Data ---
    const fetchFaceoffChartData = async () => {
      setLoadingFaceoffChart(true); // Use specific loading state
      setErrorFaceoffChart(null);   // Use specific error state
      setFaceoffChartData(null);  // Reset before fetch
      try {
        // Fetch from the endpoint serving the Plotly JSON
        const response = await fetch(`${API_BASE_URL}/faceoff-wins-graph/`); // Keep endpoint name for now
        if (!response.ok) {
          let errorMsg = `Faceoff Chart fetch failed: ${response.status}`;
           try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){}
          throw new Error(errorMsg);
        }
        const data = await response.json();

        // Expect 'chart_json' key
        if (data && data.chart_json) {
           try {
                setFaceoffChartData(JSON.parse(data.chart_json)); // Parse JSON and update state
           } catch (e) {
                console.error("Error parsing faceoff chart JSON:", e);
                throw new Error("Failed to parse faceoff chart data."); // Throw error
           }
        } else {
            console.warn("Faceoff chart JSON missing from response.");
            setFaceoffChartData(null); // Set to null if missing
        }

      } catch (error) {
        console.error("Error fetching/parsing faceoff chart:", error);
        setErrorFaceoffChart(error.message); // Set specific faceoff chart error
        setFaceoffChartData(null); // Ensure reset on error
      } finally {
        setLoadingFaceoffChart(false); // Use specific loading state
      }
    };
    // --- END MODIFIED Fetch ---

    // --- Fetch LogReg Data (Unchanged) ---
    const fetchLogRegData = async () => { setLoadingLogReg(true); setErrorLogReg(null); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); try { const response = await fetch(`${API_BASE_URL}/LogReg/`); if (!response.ok) { let errorMsg = `LogReg fetch failed: ${response.status}`; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){} throw new Error(errorMsg); } const data = await response.json(); console.log("LogReg Data Received:", data); setLogRegAccuracy(data.mean_cv_accuracy ?? 'N/A'); if (data.coefficients_chart_json) { try { setLogRegCoefChartData(JSON.parse(data.coefficients_chart_json)); } catch (e) { console.error("Error parsing coefficient chart JSON:", e); setErrorLogReg("Failed to parse coefficient chart data."); setLogRegCoefChartData(null); } } else { console.warn("Coefficient chart JSON missing."); setLogRegCoefChartData(null); } if (data.violin_chart_json) { try { setLogRegViolinChartData(JSON.parse(data.violin_chart_json)); } catch (e) { console.error("Error parsing violin chart JSON:", e); setErrorLogReg(prev => prev ? `${prev} & violin` : "Failed to parse violin chart data."); setLogRegViolinChartData(null); } } else { console.warn("Violin chart JSON missing."); setLogRegViolinChartData(null); } } catch (error) { console.error("Error fetching LogReg data:", error); setErrorLogReg(error.message); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); } finally { setLoadingLogReg(false); } };

    // Call all fetch functions
    fetchGamesData();
    fetchFaceoffChartData(); // Renamed call
    fetchLogRegData();

  }, []);

    // --- Modified Loading Check ---
    // Include the new faceoff loading state
    if (loadingGames || loadingFaceoffChart || loadingLogReg) {
        return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Hockey Data...</p> </Container> );
    }

    // --- Modified Error Check ---
    // Include the new faceoff error state
    const anyError = errorGames || errorFaceoffChart || errorLogReg;
    if (anyError) {
        return ( <Container className="mt-5"> <Alert variant="danger"> <Alert.Heading>Error Loading Data</Alert.Heading> {errorGames && <p>Games Data Error: {errorGames}</p>} {errorFaceoffChart && <p>Faceoff Chart Error: {errorFaceoffChart}</p>} {errorLogReg && <p>Regression Analysis Error: {errorLogReg}</p>} </Alert> </Container> );
    }

  // --- Combined Render ---
  return (
    <Container>
      {/* --- Games Table Section (Unchanged structure) --- */}
      {/*
      {games && games.length > 0 ? ( <Row> <Col> <h2>Games Data</h2> <Table striped bordered hover responsive> <thead> <tr> {Object.keys(games[0]).map((key) => ( <th key={key}>{key.replace('game_', '').replace(/([A-Z])/g, ' $1').trim()}</th> ))} </tr> </thead> <tbody> {games.map((game, index) => ( <tr key={index}> {Object.values(game).map((value, cellIndex) => ( <td key={cellIndex}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> </Col> </Row> ) : ( <Alert variant="warning" className="mt-3">Games data is unavailable.</Alert> )}
      */}

      {/* --- MODIFIED Faceoff Chart Section --- */}
      <Row className="mt-4">
        <Col>
          <h2>Faceoff Win Percentage Over Time</h2>
           {/* Conditionally render Plotly chart */}
           {loadingFaceoffChart ? ( // Check specific loading state
               <div className="text-center"><Spinner animation="border" size="sm"/> Loading chart...</div>
           ) : faceoffChartData ? ( // Check if chart data object exists
             <Plot
                data={faceoffChartData.data}
                layout={faceoffChartData.layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '450px' }} // Adjust height as needed
                config={{ responsive: true }}
            />
          ) : ( // Show unavailable only if not loading and no specific error occurred
             !errorFaceoffChart && <Alert variant="warning">Faceoff chart data is unavailable.</Alert>
          )}
        </Col>
      </Row>
      {/* --- END MODIFIED Faceoff Chart Section --- */}


      {/* --- Logistic Regression Section (Unchanged structure) --- */}
      <Row className="mt-5"> <Col> <h2>Game Outcome Prediction Analysis (Logistic Regression)</h2> {logRegAccuracy !== null && ( <Alert variant="secondary"> Mean Cross-Validation Accuracy: {typeof logRegAccuracy === 'number' ? logRegAccuracy.toFixed(4) : logRegAccuracy} </Alert> )} <h4 className="mt-4">Top Feature Importances</h4> {logRegCoefChartData ? ( <Plot data={logRegCoefChartData.data} layout={logRegCoefChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '450px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Coefficient chart data unavailable.</Alert> )} <h4 className="mt-4">Feature Distributions by Outcome</h4> {logRegViolinChartData ? ( <Plot data={logRegViolinChartData.data} layout={logRegViolinChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '500px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Violin chart data unavailable.</Alert> )} </Col> </Row>

    </Container>
  );
}

export default Games;
// --- END OF FILE Games.js ---
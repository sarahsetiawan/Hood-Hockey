// --- START OF FILE Games.js ---

import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import Plot from 'react-plotly.js';

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Games() {
  // --- State ---
  // REMOVED games state and related loading/error

  // LogReg State
  const [logRegAccuracy, setLogRegAccuracy] = useState(null);
  const [logRegCoefChartData, setLogRegCoefChartData] = useState(null);
  const [logRegViolinChartData, setLogRegViolinChartData] = useState(null);
  const [loadingLogReg, setLoadingLogReg] = useState(true);
  const [errorLogReg, setErrorLogReg] = useState(null);

  // Trend Chart State (Combined Faceoff & CORSI)
  const [faceoffChartData, setFaceoffChartData] = useState(null);
  const [corsiChartData, setCorsiChartData] = useState(null); // ADDED Corsi Chart state
  const [loadingTrendCharts, setLoadingTrendCharts] = useState(true); // Combined loading state
  const [errorTrendCharts, setErrorTrendCharts] = useState(null); // Combined error state


  useEffect(() => {
    // --- Fetch Trend Charts Data (Faceoff & CORSI) ---
    // Renamed function for clarity
    const fetchTrendChartsData = async () => {
      setLoadingTrendCharts(true);
      setErrorTrendCharts(null);
      setFaceoffChartData(null);
      setCorsiChartData(null); // Reset CORSI chart state
      try {
        // Endpoint points to the view returning both charts
        const response = await fetch(`${API_BASE_URL}/faceoff-wins-graph/`); // Or rename endpoint if appropriate
        if (!response.ok) {
          let errorMsg = `Trend Charts fetch failed: ${response.status}`;
           try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        console.log("Trend Chart Data Received:", data); // Log response

        // Parse Faceoff Chart
        if (data && data.faceoff_chart_json) {
           try { setFaceoffChartData(JSON.parse(data.faceoff_chart_json)); }
           catch (e) { console.error("Error parsing faceoff chart JSON:", e); throw new Error("Failed to parse faceoff chart data.");}
        } else { console.warn("Faceoff chart JSON missing."); setFaceoffChartData(null); }

        // Parse CORSI Chart
        if (data && data.corsi_chart_json) { // Check for the NEW key
            try { setCorsiChartData(JSON.parse(data.corsi_chart_json)); } // Set the NEW state
            catch (e) { console.error("Error parsing CORSI chart JSON:", e); throw new Error("Failed to parse CORSI chart data."); }
        } else { console.warn("CORSI chart JSON missing."); setCorsiChartData(null); } // Set NEW state to null if missing

      } catch (error) {
        console.error("Error fetching/parsing trend charts:", error);
        setErrorTrendCharts(error.message); // Set combined trend chart error
        setFaceoffChartData(null); // Ensure reset on error
        setCorsiChartData(null); // Ensure reset on error
      } finally {
        setLoadingTrendCharts(false); // Set combined loading state
      }
    };
    // --- END Fetch Trend Charts ---

    // --- Fetch LogReg Data (Unchanged) ---
    const fetchLogRegData = async () => { setLoadingLogReg(true); setErrorLogReg(null); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); try { const response = await fetch(`${API_BASE_URL}/LogReg/`); if (!response.ok) { let errorMsg = `LogReg fetch failed: ${response.status}`; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){} throw new Error(errorMsg); } const data = await response.json(); console.log("LogReg Data Received:", data); setLogRegAccuracy(data.mean_cv_accuracy ?? 'N/A'); if (data.coefficients_chart_json) { try { setLogRegCoefChartData(JSON.parse(data.coefficients_chart_json)); } catch (e) { console.error("Error parsing coefficient chart JSON:", e); setErrorLogReg("Failed to parse coefficient chart data."); setLogRegCoefChartData(null); } } else { console.warn("Coefficient chart JSON missing."); setLogRegCoefChartData(null); } if (data.violin_chart_json) { try { setLogRegViolinChartData(JSON.parse(data.violin_chart_json)); } catch (e) { console.error("Error parsing violin chart JSON:", e); setErrorLogReg(prev => prev ? `${prev} & violin` : "Failed to parse violin chart data."); setLogRegViolinChartData(null); } } else { console.warn("Violin chart JSON missing."); setLogRegViolinChartData(null); } } catch (error) { console.error("Error fetching LogReg data:", error); setErrorLogReg(error.message); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); } finally { setLoadingLogReg(false); } };

    // Call fetch functions
    fetchTrendChartsData(); // Call updated fetch function
    fetchLogRegData();

  }, []);

    // --- Modified Loading Check ---
    if (loadingTrendCharts || loadingLogReg) { // Use combined trend loading state
        return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Hockey Data...</p> </Container> );
    }

    // --- Modified Error Check ---
    const anyError = errorTrendCharts || errorLogReg; // Use combined trend error state
    if (anyError) {
        return ( <Container className="mt-5"> <Alert variant="danger"> <Alert.Heading>Error Loading Data</Alert.Heading> {errorTrendCharts && <p>Trend Chart Error: {errorTrendCharts}</p>} {errorLogReg && <p>Regression Analysis Error: {errorLogReg}</p>} </Alert> </Container> );
    }

  // --- Combined Render ---
  return (
    <Container>
      {/* --- REMOVED Games Table Section --- */}

      {/* --- Trend Charts Section (Modified) --- */}
      <h2 className="mt-4">Team Performance Trends</h2>
      {loadingTrendCharts ? (
            <div className="text-center"><Spinner animation="border" size="sm"/> Loading charts...</div>
      ) : (
        <Row className="mt-3">
            {/* Faceoff Chart Column */}
            <Col md={6} className="mb-3"> {/* Add margin bottom */}
                {faceoffChartData ? (
                    <Plot
                        data={faceoffChartData.data}
                        layout={faceoffChartData.layout} // Layout comes from backend JSON
                        useResizeHandler={true}
                        style={{ width: '100%', height: '400px' }} // Slightly smaller height?
                        config={{ responsive: true }}
                    />
                ) : (
                    !errorTrendCharts && <Alert variant="warning" size="sm">Faceoff chart data unavailable.</Alert>
                )}
            </Col>

            {/* CORSI Chart Column */}
            <Col md={6} className="mb-3"> {/* Add Col for Corsi chart */}
                {corsiChartData ? ( // Use corsiChartData state
                    <Plot
                        data={corsiChartData.data} // Use corsiChartData
                        layout={corsiChartData.layout} // Use corsiChartData
                        useResizeHandler={true}
                        style={{ width: '100%', height: '400px' }}
                        config={{ responsive: true }}
                    />
                ) : (
                    !errorTrendCharts && <Alert variant="warning" size="sm">CORSI chart data unavailable.</Alert>
                )}
            </Col>
        </Row>
      )}
      {/* Show combined error below charts if it occurred */}
      {errorTrendCharts && <Alert variant="danger" className="mt-2">Error loading trend charts: {errorTrendCharts}</Alert>}
      {/* --- END Trend Charts Section --- */}


      {/* --- Logistic Regression Section (Unchanged structure) --- */}
      <Row className="mt-5"> <Col> <h2>Game Outcome Prediction Analysis (Logistic Regression)</h2> {logRegAccuracy !== null && ( <Alert variant="secondary"> Mean Cross-Validation Accuracy: {typeof logRegAccuracy === 'number' ? logRegAccuracy.toFixed(4) : logRegAccuracy} </Alert> )} <h4 className="mt-4">Top Feature Importances</h4> {logRegCoefChartData ? ( <Plot data={logRegCoefChartData.data} layout={logRegCoefChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '450px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Coefficient chart data unavailable.</Alert> )} <h4 className="mt-4">Feature Distributions by Outcome</h4> {logRegViolinChartData ? ( <Plot data={logRegViolinChartData.data} layout={logRegViolinChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '500px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Violin chart data unavailable.</Alert> )} </Col> </Row>

    </Container>
  );
}

export default Games;
// --- END OF FILE Games.js ---
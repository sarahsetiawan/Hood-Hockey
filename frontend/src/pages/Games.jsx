// --- START OF FILE Games.js ---

import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import Plot from 'react-plotly.js';

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Games() {
  // --- LogReg State ---
  const [logRegAccuracy, setLogRegAccuracy] = useState(null);
  const [logRegCoefChartData, setLogRegCoefChartData] = useState(null);
  const [logRegViolinChartData, setLogRegViolinChartData] = useState(null);
  const [loadingLogReg, setLoadingLogReg] = useState(true);
  const [errorLogReg, setErrorLogReg] = useState(null);

  // --- Trend Chart State ---
  const [faceoffChartData, setFaceoffChartData] = useState(null);
  const [corsiChartData, setCorsiChartData] = useState(null);
  const [xgChartData, setXgChartData] = useState(null); // ADDED xG Chart state
  const [loadingTrendCharts, setLoadingTrendCharts] = useState(true);
  const [errorTrendCharts, setErrorTrendCharts] = useState(null);


  useEffect(() => {
    // --- Fetch Trend Charts Data (Faceoff, CORSI, xG) ---
    const fetchTrendChartsData = async () => {
      setLoadingTrendCharts(true);
      setErrorTrendCharts(null);
      setFaceoffChartData(null);
      setCorsiChartData(null);
      setXgChartData(null); // Reset xG chart state
      try {
        // Endpoint should return all three chart JSONs now
        const response = await fetch(`${API_BASE_URL}/faceoff-wins-graph/`); // Or appropriate URL
        if (!response.ok) { let errorMsg = `Trend Charts fetch failed: ${response.status}`; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){} throw new Error(errorMsg); }
        const data = await response.json();
        console.log("Trend Chart Data Received:", data);

        // Parse Faceoff Chart
        if (data?.faceoff_chart_json) { try { setFaceoffChartData(JSON.parse(data.faceoff_chart_json)); } catch (e) { console.error("Error parsing faceoff chart JSON:", e); throw new Error("Failed to parse faceoff chart data.");} }
        else { console.warn("Faceoff chart JSON missing."); setFaceoffChartData(null); }

        // Parse CORSI Chart
        if (data?.corsi_chart_json) { try { setCorsiChartData(JSON.parse(data.corsi_chart_json)); } catch (e) { console.error("Error parsing CORSI chart JSON:", e); throw new Error("Failed to parse CORSI chart data."); } }
        else { console.warn("CORSI chart JSON missing."); setCorsiChartData(null); }

        // --- ADDED: Parse xG Chart ---
        if (data?.xg_chart_json) { // Check for the NEW key
            try { setXgChartData(JSON.parse(data.xg_chart_json)); } // Set the NEW state
            catch (e) { console.error("Error parsing xG chart JSON:", e); throw new Error("Failed to parse xG chart data."); }
        } else { console.warn("xG chart JSON missing."); setXgChartData(null); } // Set NEW state to null if missing
        // --- END ADDED xG Parse ---

      } catch (error) {
        console.error("Error fetching/parsing trend charts:", error);
        setErrorTrendCharts(error.message);
        setFaceoffChartData(null); setCorsiChartData(null);
        setXgChartData(null); // Ensure reset on error
      } finally {
        setLoadingTrendCharts(false);
      }
    };
    // --- END Fetch Trend Charts ---

    // --- Fetch LogReg Data (Unchanged) ---
    const fetchLogRegData = async () => { setLoadingLogReg(true); setErrorLogReg(null); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); try { const response = await fetch(`${API_BASE_URL}/LogReg/`); if (!response.ok) { let errorMsg = `LogReg fetch failed: ${response.status}`; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){} throw new Error(errorMsg); } const data = await response.json(); console.log("LogReg Data Received:", data); setLogRegAccuracy(data.mean_cv_accuracy ?? 'N/A'); if (data.coefficients_chart_json) { try { setLogRegCoefChartData(JSON.parse(data.coefficients_chart_json)); } catch (e) { console.error("Error parsing coefficient chart JSON:", e); setErrorLogReg("Failed to parse coefficient chart data."); setLogRegCoefChartData(null); } } else { console.warn("Coefficient chart JSON missing."); setLogRegCoefChartData(null); } if (data.violin_chart_json) { try { setLogRegViolinChartData(JSON.parse(data.violin_chart_json)); } catch (e) { console.error("Error parsing violin chart JSON:", e); setErrorLogReg(prev => prev ? `${prev} & violin` : "Failed to parse violin chart data."); setLogRegViolinChartData(null); } } else { console.warn("Violin chart JSON missing."); setLogRegViolinChartData(null); } } catch (error) { console.error("Error fetching LogReg data:", error); setErrorLogReg(error.message); setLogRegAccuracy(null); setLogRegCoefChartData(null); setLogRegViolinChartData(null); } finally { setLoadingLogReg(false); } };

    // Call fetch functions
    fetchTrendChartsData();
    fetchLogRegData();

  }, []);

    // --- Loading Check ---
    if (loadingTrendCharts || loadingLogReg) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Hockey Data...</p> </Container> ); }
    // --- Error Check ---
    const anyError = errorTrendCharts || errorLogReg; if (anyError) { return ( <Container className="mt-5"> <Alert variant="danger"> <Alert.Heading>Error Loading Data</Alert.Heading> {errorTrendCharts && <p>Trend Chart Error: {errorTrendCharts}</p>} {errorLogReg && <p>Regression Analysis Error: {errorLogReg}</p>} </Alert> </Container> ); }

  // --- Combined Render ---
  return (
    <Container>
      {/* REMOVED Games Table Section */}

      {/* --- Trend Charts Section (Modified) --- */}
      <h2 className="mt-4">Team Performance Trends</h2>
      {loadingTrendCharts ? (
            <div className="text-center"><Spinner animation="border" size="sm"/> Loading charts...</div>
      ) : errorTrendCharts ? ( // Show specific error for this section if it occurred
            <Alert variant="danger" className="mt-2">Error loading trend charts: {errorTrendCharts}</Alert>
      ) : (
        <> {/* Use fragment to group rows */}
            {/* Row for Faceoff and CORSI */}
            <Row className="mt-3">
                {/* Faceoff Chart Column */}
                <Col md={6} className="mb-3">
                    {faceoffChartData ? (
                        <Plot data={faceoffChartData.data} layout={faceoffChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : (
                         <Alert variant="warning" size="sm">Faceoff chart data unavailable.</Alert>
                    )}
                </Col>

                {/* CORSI Chart Column */}
                <Col md={6} className="mb-3">
                    {corsiChartData ? (
                        <Plot data={corsiChartData.data} layout={corsiChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : (
                        <Alert variant="warning" size="sm">CORSI chart data unavailable.</Alert>
                    )}
                </Col>
            </Row>

            {/* ADDED Row for xG Chart */}
            <Row className="mt-3">
                 {/* xG Chart Column */}
                <Col md={12} lg={6} className="mb-3 mx-auto"> {/* Center if desired on large screens */}
                    {xgChartData ? ( // Use xgChartData state
                        <Plot
                            data={xgChartData.data} // Use xgChartData
                            layout={xgChartData.layout} // Use xgChartData
                            useResizeHandler={true}
                            style={{ width: '100%', height: '400px' }}
                            config={{ responsive: true }}
                        />
                    ) : (
                         <Alert variant="warning" size="sm">Net xG chart data unavailable.</Alert>
                    )}
                </Col>
            </Row>
            {/* END ADDED Row */}
        </>
      )}
      {/* --- END Trend Charts Section --- */}


      {/* --- Logistic Regression Section (Unchanged structure) --- */}
      <Row className="mt-5"> <Col> <h2>Game Outcome Prediction Analysis (Logistic Regression)</h2> {logRegAccuracy !== null && ( <Alert variant="secondary"> Mean Cross-Validation Accuracy: {typeof logRegAccuracy === 'number' ? logRegAccuracy.toFixed(4) : logRegAccuracy} </Alert> )} <h4 className="mt-4">Top Feature Importances</h4> {logRegCoefChartData ? ( <Plot data={logRegCoefChartData.data} layout={logRegCoefChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '450px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Coefficient chart data unavailable.</Alert> )} <h4 className="mt-4">Feature Distributions by Outcome</h4> {logRegViolinChartData ? ( <Plot data={logRegViolinChartData.data} layout={logRegViolinChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '500px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Violin chart data unavailable.</Alert> )} </Col> </Row>

    </Container>
  );
}

export default Games;
// --- END OF FILE Games.js ---
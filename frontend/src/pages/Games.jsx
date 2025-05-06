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
  const [xgChartData, setXgChartData] = useState(null);
  const [puckBattleChartData, setPuckBattleChartData] = useState(null); // State for the new chart
  const [loadingTrendCharts, setLoadingTrendCharts] = useState(true);
  const [errorTrendCharts, setErrorTrendCharts] = useState(null);


  useEffect(() => {
    // --- Fetch Trend Charts Data (ALL FOUR) ---
    const fetchTrendChartsData = async () => {
      setLoadingTrendCharts(true);
      setErrorTrendCharts(null);
      setFaceoffChartData(null);
      setCorsiChartData(null);
      setXgChartData(null);
      setPuckBattleChartData(null); // Reset new state
      try {
        // Endpoint should return all four chart JSONs now
        const response = await fetch(`${API_BASE_URL}/faceoff-wins-graph/`); // Or appropriate URL
        if (!response.ok) { let errorMsg = `Trend Charts fetch failed: ${response.status}`; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e){} throw new Error(errorMsg); }
        const data = await response.json();
        console.log("Trend Chart Data Received:", data);

        // Parse Faceoff Chart
        if (data?.faceoff_chart_json) { try { setFaceoffChartData(JSON.parse(data.faceoff_chart_json)); } catch (e) { console.error("Error parsing faceoff chart JSON:", e); /* Consider setting specific error */ throw new Error("Parse Faceoff failed");} }
        else { console.warn("Faceoff chart JSON missing."); setFaceoffChartData(null); }

        // Parse CORSI Chart
        if (data?.corsi_chart_json) { try { setCorsiChartData(JSON.parse(data.corsi_chart_json)); } catch (e) { console.error("Error parsing CORSI chart JSON:", e); throw new Error("Parse CORSI failed");} }
        else { console.warn("CORSI chart JSON missing."); setCorsiChartData(null); }

        // Parse xG Chart
        if (data?.xg_chart_json) { try { setXgChartData(JSON.parse(data.xg_chart_json)); } catch (e) { console.error("Error parsing xG chart JSON:", e); throw new Error("Parse xG failed");} }
        else { console.warn("xG chart JSON missing."); setXgChartData(null); }

        // Parse Puck Battles Chart
        if (data?.puck_battles_chart_json) { // Check for the correct key from backend
            try { setPuckBattleChartData(JSON.parse(data.puck_battles_chart_json)); } // Set the correct state
            catch (e) { console.error("Error parsing Puck Battle chart JSON:", e); throw new Error("Parse Puck Battle failed");}
        } else { console.warn("Puck Battle chart JSON missing."); setPuckBattleChartData(null); } // Set correct state to null

      } catch (error) {
        console.error("Error fetching/parsing trend charts:", error);
        setErrorTrendCharts(error.message); // Set combined error
        // Ensure all are reset if *any* part fails
        setFaceoffChartData(null); setCorsiChartData(null);
        setXgChartData(null); setPuckBattleChartData(null); // Reset new state on error
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

    // --- Loading / Error Checks (Unchanged) ---
    if (loadingTrendCharts || loadingLogReg) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Hockey Data...</p> </Container> ); }
    const anyError = errorTrendCharts || errorLogReg; if (anyError) { return ( <Container className="mt-5"> <Alert variant="danger"> <Alert.Heading>Error Loading Data</Alert.Heading> {errorTrendCharts && <p>Trend Chart Error: {errorTrendCharts}</p>} {errorLogReg && <p>Regression Analysis Error: {errorLogReg}</p>} </Alert> </Container> ); }

  // --- Combined Render ---
  return (
    <Container>
      {/* --- Trend Charts Section (Modified Layout) --- */}
      <h2 className="mt-4">Team Performance Trends</h2>
      {loadingTrendCharts ? (
            <div className="text-center"><Spinner animation="border" size="sm"/> Loading charts...</div>
      ) : errorTrendCharts ? (
            <Alert variant="danger" className="mt-2">Error loading trend charts: {errorTrendCharts}</Alert>
      ) : (
        <> {/* Fragment for multiple rows */}
            {/* Row 1: Faceoff and CORSI */}
            <Row className="mt-3">
                <Col md={6} className="mb-3">
                    {faceoffChartData ? (
                        <Plot data={faceoffChartData.data} layout={faceoffChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : ( <Alert variant="warning" size="sm">Faceoff chart data unavailable.</Alert> )}
                </Col>
                <Col md={6} className="mb-3">
                    {corsiChartData ? (
                        <Plot data={corsiChartData.data} layout={corsiChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : ( <Alert variant="warning" size="sm">CORSI chart data unavailable.</Alert> )}
                </Col>
            </Row>

            {/* Row 2: xG and Puck Battles */}
            <Row className="mt-3">
                 {/* xG Chart Column */}
                <Col md={6} className="mb-3">
                    {xgChartData ? (
                        <Plot data={xgChartData.data} layout={xgChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : ( <Alert variant="warning" size="sm">Net xG chart data unavailable.</Alert> )}
                </Col>
                {/* Puck Battle Chart Column */}
                <Col md={6} className="mb-3"> {/* Add new column */}
                    {puckBattleChartData ? ( // Use puckBattleChartData state
                        <Plot
                            data={puckBattleChartData.data} // Use puckBattleChartData
                            layout={puckBattleChartData.layout} // Use puckBattleChartData
                            useResizeHandler={true}
                            style={{ width: '100%', height: '400px' }}
                            config={{ responsive: true }}
                        />
                    ) : ( <Alert variant="warning" size="sm">Puck Battle chart data unavailable.</Alert> )}
                 </Col>
            </Row>
        </>
      )}
      {/* --- END Trend Charts Section --- */}


      {/* --- Logistic Regression Section (Unchanged) --- */}
      <Row className="mt-5"> <Col> <h2>Game Outcome Prediction Analysis (Logistic Regression)</h2> {logRegAccuracy !== null && ( <Alert variant="secondary"> Mean Cross-Validation Accuracy: {typeof logRegAccuracy === 'number' ? logRegAccuracy.toFixed(4) : logRegAccuracy} </Alert> )} <h4 className="mt-4">Top Feature Importances</h4> {logRegCoefChartData ? ( <Plot data={logRegCoefChartData.data} layout={logRegCoefChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '450px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Coefficient chart data unavailable.</Alert> )} <h4 className="mt-4">Feature Distributions by Outcome</h4> {logRegViolinChartData ? ( <Plot data={logRegViolinChartData.data} layout={logRegViolinChartData.layout} useResizeHandler={true} style={{ width: '100%', minHeight: '500px' }} config={{ responsive: true }}/> ) : ( !loadingLogReg && !errorLogReg && <Alert variant="info" size="sm">Violin chart data unavailable.</Alert> )} </Col> </Row>

    </Container>
  );
}

export default Games;
// --- END OF FILE Games.js ---
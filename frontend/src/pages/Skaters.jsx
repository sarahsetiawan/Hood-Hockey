// --- START OF FILE Skaters.js ---

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Table, Form, Button, Card, ListGroup, InputGroup, Image } from 'react-bootstrap'; // Removed Image import if not used elsewhere
import Plot from 'react-plotly.js'; // Ensure Plot is imported

// --- Define Available Metrics --- (Existing - Unchanged)
const ALL_AVAILABLE_METRICS = [
    "Goals", "Assists", "Points", "First assist", "Second assist",
    "Shots", "Shots on goal", "Faceoffs won", "Hits", "Blocked shots",
];
// --- Default Configuration --- (Existing - Unchanged)
const DEFAULT_OFFENSIVE_METRICS = ["Goals", "First assist", "Second assist"];
const DEFAULT_OFFENSIVE_WEIGHTS = {"Goals": 2.0, "First assist": 1.75, "Second assist": 1.5};
const DEFAULT_DEFENSIVE_METRICS = ["Hits", "Blocked shots"];
const DEFAULT_DEFENSIVE_WEIGHTS = {"Hits": 1.5, "Blocked shots": 2.0};

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Skaters() {
  // --- Existing State (GAR, PER, CF%) ---
  const [topForwards, setTopForwards] = useState([]);
  const [topDefenders, setTopDefenders] = useState([]);
  const [forwardChartData, setForwardChartData] = useState(null);
  const [defenderChartData, setDefenderChartData] = useState(null);
  const [loading, setLoading] = useState(true); // Global initial loading
  const [error, setError] = useState(null); // Global error state
  const [selectedMetric, setSelectedMetric] = useState('Points');
  const [topPerForwards, setTopPerForwards] = useState([]);
  const [topPerDefenders, setTopPerDefenders] = useState([]);
  const [forwardPerChartData, setForwardPerChartData] = useState(null);
  const [defenderPerChartData, setDefenderPerChartData] = useState(null);
  const [availableMetrics] = useState(ALL_AVAILABLE_METRICS);
  const [selectedOffensiveMetrics, setSelectedOffensiveMetrics] = useState(new Set(DEFAULT_OFFENSIVE_METRICS));
  const [offensiveWeights, setOffensiveWeights] = useState({...DEFAULT_OFFENSIVE_WEIGHTS});
  const [selectedDefensiveMetrics, setSelectedDefensiveMetrics] = useState(new Set(DEFAULT_DEFENSIVE_METRICS));
  const [defensiveWeights, setDefensiveWeights] = useState({...DEFAULT_DEFENSIVE_WEIGHTS});
  const [perFormula, setPerFormula] = useState({ offensive: '', defensive: '', per: '' });
  const [isFetchingPer, setIsFetchingPer] = useState(false);
  const [cfPercentageChartData, setCfPercentageChartData] = useState(null);
  const [isFetchingCfPercentage, setIsFetchingCfPercentage] = useState(false);
  // --- End Existing State ---

  // --- ADDED State for Scatter Plots ---
  const [forwardScatterData, setForwardScatterData] = useState(null); // Parsed Plotly object
  const [defenderScatterData, setDefenderScatterData] = useState(null); // Parsed Plotly object
  const [loadingScatter, setLoadingScatter] = useState(true); // Specific loading state
  // --- END ADDED State ---


  // Determine current AR column name (Existing)
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  // --- Fetch Function (Modified to include Scatter JSON processing) ---
  const fetchData = useCallback(async (isPerUpdate = false) => {
     // Set loading states
     if (!isPerUpdate) {
        setLoading(true);
        setIsFetchingCfPercentage(true);
        setLoadingScatter(true); // Set scatter loading true
     } else {
        setIsFetchingPer(true);
     }
     setError(null); // Clear global error

     // Reset scatter state before fetch
     setForwardScatterData(null);
     setDefenderScatterData(null);


    // PER param construction (Existing)
    let perQueryString = '';
    if (isPerUpdate || !isFetchingPer) {
         const offMetrics = Array.from(selectedOffensiveMetrics);
         const offWeights = offMetrics.map(m => offensiveWeights[m] === '' || offensiveWeights[m] === undefined || offensiveWeights[m] === null ? 1.0 : parseFloat(offensiveWeights[m]));
         const defMetrics = Array.from(selectedDefensiveMetrics);
         const defWeights = defMetrics.map(m => defensiveWeights[m] === '' || defensiveWeights[m] === undefined || defensiveWeights[m] === null ? 1.0 : parseFloat(defensiveWeights[m]));
         if (offMetrics.length === 0 || defMetrics.length === 0 || offWeights.some(isNaN) || defWeights.some(isNaN)) {
              setError("PER Config Error: Select at least one offensive/defensive metric and ensure valid weights.");
              setIsFetchingPer(false); if (!isPerUpdate) { setLoading(false); setIsFetchingCfPercentage(false); setLoadingScatter(false); } // Reset all loading if config error on initial load
              return;
         }
         const encodedOffMetrics = offMetrics.map(encodeURIComponent).join(',');
         const encodedDefMetrics = defMetrics.map(encodeURIComponent).join(',');
         perQueryString = `?offensive_metrics=${encodedOffMetrics}&offensive_weights=${offWeights.join(',')}&defensive_metrics=${encodedDefMetrics}&defensive_weights=${defWeights.join(',')}`;
    }

     try {
         const fetchPromises = [];

         // Fetches for initial load OR GAR change (!isPerUpdate)
         if (!isPerUpdate) {
             // --- MODIFIED: Fetch Scatter Plot Data ---
             fetchPromises.push(
                fetch(`${API_BASE_URL}/fitness-corr/`) // Assuming this is the correct URL
                    .then(res => { // Handle different status codes
                        if (res.status === 204) return null; // Handle No Content
                        if (!res.ok) return res.text().then(text => {throw new Error(`Scatter fetch failed: ${res.status} - ${text || 'Server error'}`)});
                        return res.json(); // Parse JSON only if OK
                    })
                    .then(data => {
                        if (data === null) { // Handle explicit null from 204 or backend
                           console.warn("Scatter plot data was null or No Content.");
                           setForwardScatterData(null);
                           setDefenderScatterData(null);
                           return;
                        }
                        // Safely parse forward scatter
                        if (data.forward_scatter_json) {
                             try { setForwardScatterData(JSON.parse(data.forward_scatter_json)); }
                             catch (e) { console.error("Error parsing forward scatter JSON:", e); /* Optionally set specific scatter error state */ }
                        } else { console.warn("Forward scatter JSON missing from response."); setForwardScatterData(null); }
                         // Safely parse defender scatter
                        if (data.defender_scatter_json) {
                             try { setDefenderScatterData(JSON.parse(data.defender_scatter_json)); }
                             catch (e) { console.error("Error parsing defender scatter JSON:", e); /* Optionally set specific scatter error state */ }
                        } else { console.warn("Defender scatter JSON missing from response."); setDefenderScatterData(null); }
                    })
                    .catch(err => { // Catch network errors or errors thrown from .then()
                        console.error("Scatter plot fetch/parse error:", err);
                        setError(prev => prev ? `${prev}\nScatter Error: ${err.message}` : `Scatter Error: ${err.message}`);
                        setForwardScatterData(null); setDefenderScatterData(null); // Ensure reset
                    })
                    .finally(() => setLoadingScatter(false))
            );
            // --- END MODIFIED Scatter Plot Fetch ---

             // Existing: GAR Data
             fetchPromises.push(
                fetch(`${API_BASE_URL}/gar/?metric=${selectedMetric}`)
                    .then(res => { if (!res.ok) throw new Error(`GAR fetch failed: ${res.status}`); return res.json(); })
                    .then(garData => { /* ... set GAR state ... */ if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) { throw new Error("Invalid GAR data structure."); } setTopForwards(garData.top_forwards); setTopDefenders(garData.top_defenders); setForwardChartData(garData.chart_data_forwards); setDefenderChartData(garData.chart_data_defenders); })
                    // No separate finally needed here, Promise.all waits
            );

             // Existing: CF% Fetch
             fetchPromises.push(
                fetch(`${API_BASE_URL}/CFPercentage/`)
                    .then(res => { if (res.status === 204) return null; if (!res.ok) return res.text().then(text => {throw new Error(`CF% fetch failed: ${res.status} - ${text || 'Server error'}`)}); return res.json(); })
                    .then(cfData => { if (cfData?.chart_json) { try { setCfPercentageChartData(JSON.parse(cfData.chart_json)); } catch (e) { console.error("CF% Parse Error", e); throw new Error("Failed to parse CF% chart JSON."); } } else { console.warn("CF% chart_json missing."); setCfPercentageChartData(null); } })
                    .finally(() => setIsFetchingCfPercentage(false))
            );
         }

         // Existing: PER Fetch
          fetchPromises.push(
             fetch(`${API_BASE_URL}/per/${perQueryString}`) // Check URL! Should it be /per-rankings/?...
                 .then(res => { if (res.status === 204) return null; if (!res.ok) { return res.json().then(errData => { throw new Error(`PER fetch failed: ${res.status} - ${errData.error || 'Unknown error'}`); }).catch(() => { throw new Error(`PER fetch failed: ${res.status}`); }); } return res.json(); })
                 .then(perData => { if (!perData || !Array.isArray(perData.top_forwards) || !Array.isArray(perData.top_defenders) || !perData.formula) { console.warn("Invalid PER data structure"); /* Set state to empty/null */ setTopPerForwards([]); setTopPerDefenders([]); setForwardPerChartData(null); setDefenderPerChartData(null); setPerFormula({ offensive: '', defensive: '', per: '' });} else { setTopPerForwards(perData.top_forwards); setTopPerDefenders(perData.top_defenders); setPerFormula(perData.formula); try { setForwardPerChartData(perData.forward_chart_json ? JSON.parse(perData.forward_chart_json) : null); } catch(e){ console.error("Fwd PER Parse Error", e); setForwardPerChartData(null); } try { setDefenderPerChartData(perData.defender_chart_json ? JSON.parse(perData.defender_chart_json) : null); } catch(e){ console.error("Def PER Parse Error", e); setDefenderPerChartData(null); } }})
                 .finally(() => setIsFetchingPer(false))
         );

         // Existing: Promise.all
         await Promise.all(fetchPromises);

     } catch (error) { // Catch errors from Promise.all or sync code
         console.error("Overall Fetch error caught by Promise.all or sync code:", error);
         if (!error) { // Set global error only if not already set by specific catches
            setError(error.message || "An unknown error occurred during data fetch.");
         }
         // Ensure all states are reset on major error
         if (!isPerUpdate) { setTopForwards([]); setTopDefenders([]); setForwardChartData(null); setDefenderChartData(null); setCfPercentageChartData(null); setForwardScatterData(null); setDefenderScatterData(null); }
         setTopPerForwards([]); setTopPerDefenders([]); setForwardPerChartData(null); setDefenderPerChartData(null); setPerFormula({ offensive: '', defensive: '', per: '' });


     } finally { // Runs after try or catch for Promise.all
         setLoading(false); // Turn off global loader once all fetches tried
         // Ensure specific loaders are off (might be redundant if finally blocks used above, but safe)
         setIsFetchingPer(false);
         setIsFetchingCfPercentage(false);
         setLoadingScatter(false);
     }
  }, [selectedMetric, selectedOffensiveMetrics, offensiveWeights, selectedDefensiveMetrics, defensiveWeights]);


  // Initial data load useEffect (Unchanged)
  useEffect(() => {
      fetchData(false);
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric]);


  // Handlers (Unchanged)
  const handleMetricChange = (event) => { setSelectedMetric(event.target.value); };
  const handleCheckboxChange = (metric, type, isChecked) => { /* ... */ const setter = type === 'offensive' ? setSelectedOffensiveMetrics : setSelectedDefensiveMetrics; const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights; const defaultWeight = 1.0; setter(prev => { const newSet = new Set(prev); if (isChecked) { newSet.add(metric); weightSetter(prevW => ({ ...prevW, [metric]: prevW[metric] ?? defaultWeight })); } else { newSet.delete(metric); } return newSet; }); };
  const handleWeightChange = (metric, type, value) => { /* ... */ const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights; weightSetter(prevW => ({ ...prevW, [metric]: value })); };
  const handleUpdatePerClick = () => { fetchData(true); };

  // GAR Chart Helper (Unchanged)
  const createChartConfig = (chartData, positionTitle) => { /* ... */ if (!chartData) return null; const { players, metric_values, ar_values, threshold_metric, metric, ar_column } = chartData; const blue_heights = metric_values.map(value => Math.min(value, threshold_metric < 0 ? 0 : threshold_metric)); const red_heights = metric_values.map(value => Math.max(0, value - threshold_metric)); const customData = metric_values.map((metricVal, index) => ({ metricValue: metricVal, arValue: ar_values[index] })); const plotData = [ { x: players, y: blue_heights, type: 'bar', name: `Below/At Repl. (${metric} ≤ ${threshold_metric?.toFixed(2)})`, marker: { color: 'blue' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` }, { x: players, y: red_heights, type: 'bar', base: blue_heights, name: `Above Repl. (${metric} > ${threshold_metric?.toFixed(2)})`, marker: { color: 'red' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` } ]; const plotLayout = { title: `${metric} for ${positionTitle} (Split by Replacement Level)`, xaxis: { title: 'Player', tickangle: -45 }, yaxis: { title: `${metric}` }, barmode: 'relative', legend: { title: { text: 'vs Replacement' } }, shapes: [{ type: 'line', xref: 'paper', x0: 0, y0: threshold_metric, x1: 1, y1: threshold_metric, line: { color: 'grey', width: 2, dash: 'dash', }}], annotations: [{ xref: 'paper', x: 0.98, y: threshold_metric, text: `Repl. Level (${threshold_metric?.toFixed(2)})`, showarrow: false, yshift: 5, font: {color: 'grey'} }], margin: { b: 100 } }; return { data: plotData, layout: plotLayout }; };
  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards');
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders');
  // --- End Helpers ---


  // --- JSX Rendering ---
  return (
    <Container>
       <h1>Skaters</h1>

        {/* --- Scatterplot Section (Using Plotly) --- */}
        <h2 className="mt-3">Player Fitness Correlations</h2>
        {loadingScatter ? (
             <div className="text-center my-3"><Spinner animation="border" size="sm" /> Loading correlation plots...</div>
        ) : (
            <Row className="mt-3">
                <Col md={6}>
                    <h4>Forwards</h4>
                    {forwardScatterData ? (
                        <Plot data={forwardScatterData.data} layout={forwardScatterData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                    ) : (
                        !loading && !error && <Alert variant="warning" size="sm">Forward correlation plot data unavailable.</Alert>
                    )}
                </Col>
                 <Col md={6}>
                     <h4>Defenders</h4>
                     {defenderScatterData ? (
                         <Plot data={defenderScatterData.data} layout={defenderScatterData.layout} useResizeHandler={true} style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
                     ) : (
                          !loading && !error && <Alert variant="warning" size="sm">Defender correlation plot data unavailable.</Alert>
                     )}
                 </Col>
            </Row>
        )}
        {/* Show global error only if scatter isn't loading and error exists */}
        {!loadingScatter && error && (
             <Alert variant="danger" className="mt-2">Error loading correlation data or other page data: {error}</Alert>
        )}
        {/* --- END Scatterplot Section --- */}


       {/* --- GAR Section --- */}
       <h2 className="mt-5">Player Value Above Replacement</h2>
        <Form className="my-3"> <Form.Group as={Row} controlId="metricSelect"> <Form.Label column sm={3} md={2}> Select Metric: </Form.Label> <Col sm={6} md={4}> <Form.Select value={selectedMetric} onChange={handleMetricChange} disabled={loading || isFetchingPer}> <option value="Points">Points</option> <option value="Goals">Goals</option> <option value="Assists">Assists</option> </Form.Select> </Col> {(loading && !isFetchingPer) && <Col sm={1} className="d-flex align-items-center"><Spinner animation="border" size="sm" /></Col>} </Form.Group> </Form>
       {/* Combined Loading / Error Display for subsequent sections */}
       {loading && <div className="text-center mt-5"><Spinner animation="border" style={{ width: '3rem', height: '3rem' }}/><h3>Loading Remaining Data...</h3></div>}
       {isFetchingPer && !loading && <div className="text-center mt-3"><Spinner animation="border" size="sm"/> Updating PER...</div>}
       {/* Error shown above is now global */}
       {/* Render subsequent sections only if global loading is done AND no error occurred */}
        {!loading && !error && (
            <>
                {/* GAR Charts */}
                <Row className="mt-4">
                    <Col md={12} lg={6}> {forwardChartConfig ? ( <Plot data={forwardChartConfig.data} layout={forwardChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> ) : ( <Alert variant="info">Forward GAR chart data unavailable for {currentMetric}.</Alert> )} </Col>
                    <Col md={12} lg={6}> {defenderChartConfig ? ( <Plot data={defenderChartConfig.data} layout={defenderChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> ) : ( <Alert variant="info">Defender GAR chart data not available for {currentMetric}.</Alert> )} </Col>
                 </Row>
                 {/* GAR Tables */}
                 <Row className="mt-4">
                    <Col md={6}> <h3>Top 5 Forwards ({currentMetric} Above Replacement)</h3> {topForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topForwards.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No forward GAR table data available.</Alert> )} </Col>
                    <Col md={6}> <h3>Top 5 Defenders ({currentMetric} Above Replacement)</h3> {topDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topDefenders.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No defender GAR table data available.</Alert> )} </Col>
                </Row>

                {/* --- Dynamic PER Section --- */}
               <h2 className="mt-5">Player Efficiency Ratings (PER)</h2>
               <Card className="my-4"> {/* ... PER config UI ... */} <Card.Header>Configure PER Calculation</Card.Header> <Card.Body> <Row> <Col md={6}> <h5>Offensive Metrics & Weights</h5> <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}> {availableMetrics.map(metric => ( <ListGroup.Item key={`off-${metric}`}> <InputGroup> <InputGroup.Checkbox aria-label={`Select offensive metric ${metric}`} checked={selectedOffensiveMetrics.has(metric)} onChange={(e) => handleCheckboxChange(metric, 'offensive', e.target.checked)} disabled={isFetchingPer || loading} /> <InputGroup.Text className="text-truncate" style={{maxWidth: '150px'}} title={metric}>{metric}</InputGroup.Text> <Form.Control type="number" step="0.01" aria-label={`Weight for offensive metric ${metric}`} value={offensiveWeights[metric] ?? ''} onChange={(e) => handleWeightChange(metric, 'offensive', e.target.value)} disabled={!selectedOffensiveMetrics.has(metric) || isFetchingPer || loading} placeholder="Weight" /> </InputGroup> </ListGroup.Item> ))} </ListGroup> </Col> <Col md={6}> <h5>Defensive Metrics & Weights</h5> <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}> {availableMetrics.map(metric => ( <ListGroup.Item key={`def-${metric}`}> <InputGroup> <InputGroup.Checkbox aria-label={`Select defensive metric ${metric}`} checked={selectedDefensiveMetrics.has(metric)} onChange={(e) => handleCheckboxChange(metric, 'defensive', e.target.checked)} disabled={isFetchingPer || loading} /> <InputGroup.Text className="text-truncate" style={{maxWidth: '150px'}} title={metric}>{metric}</InputGroup.Text> <Form.Control type="number" step="0.01" aria-label={`Weight for defensive metric ${metric}`} value={defensiveWeights[metric] ?? ''} onChange={(e) => handleWeightChange(metric, 'defensive', e.target.value)} disabled={!selectedDefensiveMetrics.has(metric) || isFetchingPer || loading} placeholder="Weight" /> </InputGroup> </ListGroup.Item> ))} </ListGroup> </Col> </Row> <Button variant="primary" className="mt-3" onClick={handleUpdatePerClick} disabled={isFetchingPer || loading} > {isFetchingPer ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...</> : 'Update PER Rankings & Charts'} </Button> </Card.Body> </Card>
                {perFormula.offensive && ( <Card className="mb-4 bg-light"> <Card.Body> <Card.Title>Current PER Formula</Card.Title> <pre style={{fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}> {perFormula.offensive}<br/> {perFormula.defensive}<br/> {perFormula.per} </pre> </Card.Body> </Card> )}
                {/* PER Charts and Tables - Render only if not fetching PER */}
                {!isFetchingPer && (
                     <>
                         {/* PER Charts */}
                         <Row className="mt-4">
                             <Col md={12} lg={6}> {forwardPerChartData ? ( <Plot data={forwardPerChartData.data} layout={forwardPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> ) : ( <Alert variant="info">Forward PER chart data not available for current configuration.</Alert> )} </Col>
                             <Col md={12} lg={6}> {defenderPerChartData ? ( <Plot data={defenderPerChartData.data} layout={defenderPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> ) : ( <Alert variant="info">Defender PER chart data not available for current configuration.</Alert> )} </Col>
                         </Row>
                         {/* PER Tables */}
                         <Row className="mt-4">
                             <Col md={6}> <h3>Forwards Ranked by PER</h3> {topPerForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerForwards.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-fwd-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No forward PER ranking data available for current configuration.</Alert> )} </Col>
                             <Col md={6}> <h3>Defenders Ranked by PER</h3> {topPerDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerDefenders.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-def-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No defender PER ranking data available for current configuration.</Alert> )} </Col>
                         </Row>
                     </>
                 )}

                {/* --- CF% Section --- */}
                <h2 className="mt-5">Estimated Player CORSI+ Percentages</h2>
                 {isFetchingCfPercentage ? (
                    <div className="text-center mt-3"><Spinner animation="border" /> Loading CF% Chart...</div>
                 ) : cfPercentageChartData ? (
                    <Row className="mt-4">
                        <Col md={12}>
                             <Plot data={cfPercentageChartData.data} layout={cfPercentageChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '500px' }} config={{ responsive: true }} />
                        </Col>
                    </Row>
                 ) : !isFetchingCfPercentage ? ( // Check specific loading state here
                     <Alert variant="info" className="mt-3">CF% chart data is currently unavailable.</Alert>
                 ) : null }
                {/* --- Linear Regression Results --- */}
                <h2 className="mt-5">Goals Predictions - Linear Regression Results</h2>
                 <Image
                         src="/newplot1.png" // Path relative to the public folder
                         alt="Team Shot Chart"
                         fluid // Makes the image responsive
                     />
                 <Image
                         src="/newplot2.png" // Path relative to the public folder
                         alt="Team Shot Chart"
                         fluid // Makes the image responsive
                     />
            </>
        )}

    </Container>
  );
}

export default Skaters;
// --- END OF FILE Skaters.js ---
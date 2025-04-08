// --- START OF FILE Skaters.js ---

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form, Button, Card, ListGroup, InputGroup } from 'react-bootstrap';
import Plot from 'react-plotly.js';

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

// --- Base API URL (Assuming this might exist or is helpful) ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function Skaters() {
  // --- Existing State --- (Keep all existing state)
  const [imageData, setImageData] = useState(null);
  const [topForwards, setTopForwards] = useState([]); // GAR table
  const [topDefenders, setTopDefenders] = useState([]); // GAR table
  const [forwardChartData, setForwardChartData] = useState(null); // GAR forward chart
  const [defenderChartData, setDefenderChartData] = useState(null); // GAR defender chart
  const [loading, setLoading] = useState(true); // Global initial loading
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points'); // For GAR
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
  const [isFetchingPer, setIsFetchingPer] = useState(false); // PER update loading
  // --- End Existing State ---

  // --- ADDED State for CF% Chart ---
  const [cfPercentageChartData, setCfPercentageChartData] = useState(null); // Parsed chart data
  const [isFetchingCfPercentage, setIsFetchingCfPercentage] = useState(false); // CF% fetch loading
  // --- END ADDED State ---


  // Determine current AR column name based on selected metric (Existing - Unchanged)
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  // --- Fetch Function (Add CF% fetch call) ---
  const fetchData = useCallback(async (isPerUpdate = false) => {
     // --- Existing loading state logic ---
     if (!isPerUpdate) {
        setLoading(true); // Global loading for initial fetch
        // --- ADD: Set CF% loading on initial fetch ---
        setIsFetchingCfPercentage(true);
     } else {
        setIsFetchingPer(true); // Only PER loading for updates
     }
     setError(null); // Clear previous errors
     // --- End Existing loading state logic ---


    // --- Existing PER param construction ---
    let perQueryString = '';
    if (isPerUpdate || !isFetchingPer) {
         const offMetrics = Array.from(selectedOffensiveMetrics);
         const offWeights = offMetrics.map(m => offensiveWeights[m] === '' || offensiveWeights[m] === undefined || offensiveWeights[m] === null ? 1.0 : parseFloat(offensiveWeights[m]));
         const defMetrics = Array.from(selectedDefensiveMetrics);
         const defWeights = defMetrics.map(m => defensiveWeights[m] === '' || defensiveWeights[m] === undefined || defensiveWeights[m] === null ? 1.0 : parseFloat(defensiveWeights[m]));
         if (offMetrics.length === 0 || defMetrics.length === 0 || offWeights.some(isNaN) || defWeights.some(isNaN)) {
              setError("PER Config Error: Select at least one offensive/defensive metric and ensure valid weights.");
              setIsFetchingPer(false); if (!isPerUpdate) { setLoading(false); setIsFetchingCfPercentage(false); } // Add CF% loading reset here too
              return;
         }
         const encodedOffMetrics = offMetrics.map(encodeURIComponent).join(',');
         const encodedDefMetrics = defMetrics.map(encodeURIComponent).join(',');
         perQueryString = `?offensive_metrics=${encodedOffMetrics}&offensive_weights=${offWeights.join(',')}&defensive_metrics=${encodedDefMetrics}&defensive_weights=${defWeights.join(',')}`;
    }
    // --- End Existing PER param construction ---

     try {
         // --- Existing Promise Array ---
         const fetchPromises = [];

         // --- Existing Fetches for initial load OR GAR change (!isPerUpdate) ---
         if (!isPerUpdate) {
             // Existing: Scatterplot (Optional)
             fetchPromises.push(
                fetch(`${API_BASE_URL}/fitness-corr/`)
                    .then(res => res.ok ? res.json() : Promise.resolve(null))
                    .then(data => data ? setImageData(data.image) : console.warn("Scatterplot fetch failed."))
                    .catch(err => console.warn("Scatterplot fetch exception:", err))
            );
             // Existing: GAR Data
             fetchPromises.push(
                fetch(`${API_BASE_URL}/gar/?metric=${selectedMetric}`)
                    .then(res => { if (!res.ok) throw new Error(`GAR fetch failed: ${res.status}`); return res.json(); })
                    .then(garData => { /* ... set GAR state (Existing) ... */
                         if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) { throw new Error("Invalid data structure received from GAR API."); }
                         setTopForwards(garData.top_forwards); setTopDefenders(garData.top_defenders); setForwardChartData(garData.chart_data_forwards); setDefenderChartData(garData.chart_data_defenders);
                    })
            );

            // --- ADDED CF% Fetch (Push onto existing array) ---
             fetchPromises.push(
                fetch(`${API_BASE_URL}/CFPercentage/`) 
                    .then(res => {
                         if (!res.ok) {
                            // Try to parse error if possible, otherwise use status
                             return res.text().then(text => { throw new Error(`CF% fetch failed: ${res.status} - ${text || 'Server error'}`); });
                         }
                         return res.json();
                     })
                    .then(cfData => {
                        if (cfData && cfData.chart_json) {
                            try {
                                setCfPercentageChartData(JSON.parse(cfData.chart_json));
                            } catch (parseError) {
                                console.error("Error parsing CF% chart JSON:", parseError);
                                throw new Error("Failed to parse CF% chart data from backend."); // Let Promise.all catch this
                            }
                        } else {
                            console.warn("CF% data received, but chart_json missing or null.");
                            setCfPercentageChartData(null); // Ensure state is null if no chart
                        }
                    })
                    // Add specific catch for this promise if needed, or let main catch handle it
                    // .catch(cfError => {
                    //    console.error("CF% Fetch specific error:", cfError);
                    //    // Maybe set a specific CF% error state here if you add one
                    //    setCfPercentageChartData(null); // Ensure reset on specific error
                    // })
                    .finally(() => setIsFetchingCfPercentage(false)) // Set CF% loading false
            );
            // --- END ADDED CF% Fetch ---
         }

         // --- Existing PER Fetch ---
          fetchPromises.push(
             fetch(`${API_BASE_URL}/per/${perQueryString}`) // Changed URL to match example
                 .then(res => { /* ... handle PER response (Existing) ... */
                      if (!res.ok) { return res.json().then(errData => { throw new Error(`PER fetch failed: ${res.status} - ${errData.error || 'Unknown error'}`); }).catch(() => { throw new Error(`PER fetch failed: ${res.status}`); }); } return res.json();
                 })
                 .then(perData => { /* ... set PER state (Existing) ... */
                      if (!perData || !Array.isArray(perData.top_forwards) || !Array.isArray(perData.top_defenders) || !perData.formula) { throw new Error("Invalid data structure received from PER API."); }
                      setTopPerForwards(perData.top_forwards); setTopPerDefenders(perData.top_defenders); setPerFormula(perData.formula);
                      try { setForwardPerChartData(perData.forward_chart_json ? JSON.parse(perData.forward_chart_json) : null); } catch(e){ console.error("Fwd PER Parse Error", e); setForwardPerChartData(null); }
                      try { setDefenderPerChartData(perData.defender_chart_json ? JSON.parse(perData.defender_chart_json) : null); } catch(e){ console.error("Def PER Parse Error", e); setDefenderPerChartData(null); }
                 })
                 .finally(() => setIsFetchingPer(false)) // Set PER loading false
         );

         // --- Existing Promise.all ---
         await Promise.all(fetchPromises);

     } catch (error) { // --- Existing Catch Block ---
         console.error("Fetch error:", error);
         setError(error.message); // Set main error state
         // Existing: Clear GAR state on initial load error
         if (!isPerUpdate) { setTopForwards([]); setTopDefenders([]); setForwardChartData(null); setDefenderChartData(null); setImageData(null); }
         // Existing: Clear PER state on error
         setTopPerForwards([]); setTopPerDefenders([]); setForwardPerChartData(null); setDefenderPerChartData(null); setPerFormula({ offensive: '', defensive: '', per: '' });
         // --- ADD: Clear CF% state on error ---
         setCfPercentageChartData(null);

     } finally { // --- Existing Finally Block ---
         // Ensure all loading states are false
         setLoading(false);
         setIsFetchingPer(false);
         // --- ADD: Ensure CF% loading is off ---
         setIsFetchingCfPercentage(false);
     }
  }, [selectedMetric, selectedOffensiveMetrics, offensiveWeights, selectedDefensiveMetrics, defensiveWeights]); // Keep existing dependencies


  // --- Initial data load useEffect (Existing - Unchanged) ---
  useEffect(() => {
     fetchData(false);
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric]);


  // --- Handlers (Existing - Unchanged) ---
  const handleMetricChange = (event) => { setSelectedMetric(event.target.value); };
  const handleCheckboxChange = (metric, type, isChecked) => { /* ... PER checkbox logic ... */ const setter = type === 'offensive' ? setSelectedOffensiveMetrics : setSelectedDefensiveMetrics; const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights; const defaultWeight = 1.0; setter(prev => { const newSet = new Set(prev); if (isChecked) { newSet.add(metric); weightSetter(prevW => ({ ...prevW, [metric]: prevW[metric] ?? defaultWeight })); } else { newSet.delete(metric); } return newSet; }); };
  const handleWeightChange = (metric, type, value) => { /* ... PER weight logic ... */ const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights; weightSetter(prevW => ({ ...prevW, [metric]: value })); };
  const handleUpdatePerClick = () => { fetchData(true); };
   // --- End Handlers ---


  // Helper function createChartConfig for GAR Charts (Existing - Unchanged)
  const createChartConfig = (chartData, positionTitle) => { /* ... GAR chart config ... */ if (!chartData) return null; const { players, metric_values, ar_values, threshold_metric, metric, ar_column } = chartData; const blue_heights = metric_values.map(value => Math.min(value, threshold_metric < 0 ? 0 : threshold_metric)); const red_heights = metric_values.map(value => Math.max(0, value - threshold_metric)); const customData = metric_values.map((metricVal, index) => ({ metricValue: metricVal, arValue: ar_values[index] })); const plotData = [ { x: players, y: blue_heights, type: 'bar', name: `Below/At Repl. (${metric} ≤ ${threshold_metric?.toFixed(2)})`, marker: { color: 'blue' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` }, { x: players, y: red_heights, type: 'bar', base: blue_heights, name: `Above Repl. (${metric} > ${threshold_metric?.toFixed(2)})`, marker: { color: 'red' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` } ]; const plotLayout = { title: `${metric} for ${positionTitle} (Split by Replacement Level)`, xaxis: { title: 'Player', tickangle: -45 }, yaxis: { title: `${metric}` }, barmode: 'relative', legend: { title: { text: 'vs Replacement' } }, shapes: [{ type: 'line', xref: 'paper', x0: 0, y0: threshold_metric, x1: 1, y1: threshold_metric, line: { color: 'grey', width: 2, dash: 'dash', }}], annotations: [{ xref: 'paper', x: 0.98, y: threshold_metric, text: `Repl. Level (${threshold_metric?.toFixed(2)})`, showarrow: false, yshift: 5, font: {color: 'grey'} }], margin: { b: 100 } }; return { data: plotData, layout: plotLayout }; };
  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards');
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders');
  // --- End Helpers ---


  // --- JSX Rendering ---
  return (
    <Container>
       {/* --- Existing Header, Scatterplot, GAR Section --- */}
       <h1>Skaters</h1>
       <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
        {loading && !imageData && !error ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> : imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> : !loading && !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null }
       <h2 className="mt-5">Player Value Above Replacement</h2>
        <Form className="my-3"> <Form.Group as={Row} controlId="metricSelect"> <Form.Label column sm={3} md={2}> Select GAR Metric: </Form.Label> <Col sm={6} md={4}> <Form.Select value={selectedMetric} onChange={handleMetricChange} disabled={loading || isFetchingPer}> <option value="Points">Points</option> <option value="Goals">Goals</option> <option value="Assists">Assists</option> </Form.Select> </Col> {(loading && !isFetchingPer) && <Col sm={1} className="d-flex align-items-center"><Spinner animation="border" size="sm" /></Col>} </Form.Group> </Form>
       {loading && <div className="text-center mt-5"><Spinner animation="border" style={{ width: '3rem', height: '3rem' }}/><h3>Loading All Data...</h3></div>}
       {isFetchingPer && !loading && <div className="text-center mt-3"><Spinner animation="border" size="sm"/> Updating PER...</div>}
       {error && !loading && <Alert variant="danger" className="mt-3">Error: {error}</Alert>}
        {!loading && !error && ( <> {/* GAR Charts */} <Row className="mt-4"> <Col md={12} lg={6}> {forwardChartConfig ? ( <Plot data={forwardChartConfig.data} layout={forwardChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> ) : ( <Alert variant="info">Forward GAR chart data not available for {currentMetric}.</Alert> )} </Col> <Col md={12} lg={6}> {defenderChartConfig ? ( <Plot data={defenderChartConfig.data} layout={defenderChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> ) : ( <Alert variant="info">Defender GAR chart data not available for {currentMetric}.</Alert> )} </Col> </Row> {/* GAR Tables */} <Row className="mt-4"> <Col md={6}> <h3>Top 5 Forwards ({currentMetric} Above Replacement)</h3> {topForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topForwards.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No forward GAR table data available.</Alert> )} </Col> <Col md={6}> <h3>Top 5 Defenders ({currentMetric} Above Replacement)</h3> {topDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topDefenders.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No defender GAR table data available.</Alert> )} </Col> </Row> </> )}

       {/* --- Dynamic PER Section (Existing - Unchanged) --- */}
       <h2 className="mt-5">Player Efficiency Rating (PER) - Dynamic Configuration</h2>
       <Card className="my-4"> <Card.Header>Configure PER Calculation</Card.Header> <Card.Body> <Row> <Col md={6}> <h5>Offensive Metrics & Weights</h5> <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}> {availableMetrics.map(metric => ( <ListGroup.Item key={`off-${metric}`}> <InputGroup> <InputGroup.Checkbox aria-label={`Select offensive metric ${metric}`} checked={selectedOffensiveMetrics.has(metric)} onChange={(e) => handleCheckboxChange(metric, 'offensive', e.target.checked)} disabled={isFetchingPer || loading} /> <InputGroup.Text className="text-truncate" style={{maxWidth: '150px'}} title={metric}>{metric}</InputGroup.Text> <Form.Control type="number" step="0.01" aria-label={`Weight for offensive metric ${metric}`} value={offensiveWeights[metric] ?? ''} onChange={(e) => handleWeightChange(metric, 'offensive', e.target.value)} disabled={!selectedOffensiveMetrics.has(metric) || isFetchingPer || loading} placeholder="Weight" /> </InputGroup> </ListGroup.Item> ))} </ListGroup> </Col> <Col md={6}> <h5>Defensive Metrics & Weights</h5> <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}> {availableMetrics.map(metric => ( <ListGroup.Item key={`def-${metric}`}> <InputGroup> <InputGroup.Checkbox aria-label={`Select defensive metric ${metric}`} checked={selectedDefensiveMetrics.has(metric)} onChange={(e) => handleCheckboxChange(metric, 'defensive', e.target.checked)} disabled={isFetchingPer || loading} /> <InputGroup.Text className="text-truncate" style={{maxWidth: '150px'}} title={metric}>{metric}</InputGroup.Text> <Form.Control type="number" step="0.01" aria-label={`Weight for defensive metric ${metric}`} value={defensiveWeights[metric] ?? ''} onChange={(e) => handleWeightChange(metric, 'defensive', e.target.value)} disabled={!selectedDefensiveMetrics.has(metric) || isFetchingPer || loading} placeholder="Weight" /> </InputGroup> </ListGroup.Item> ))} </ListGroup> </Col> </Row> <Button variant="primary" className="mt-3" onClick={handleUpdatePerClick} disabled={isFetchingPer || loading} > {isFetchingPer ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...</> : 'Update PER Rankings & Charts'} </Button> </Card.Body> </Card>
        {!loading && perFormula.offensive && ( <Card className="mb-4 bg-light"> <Card.Body> <Card.Title>Current PER Formula</Card.Title> <pre style={{fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}> {perFormula.offensive}<br/> {perFormula.defensive}<br/> {perFormula.per} </pre> </Card.Body> </Card> )}
        {!loading && !isFetchingPer && !error && ( <> {/* PER Charts */} <Row className="mt-4"> <Col md={12} lg={6}> {forwardPerChartData ? ( <Plot data={forwardPerChartData.data} layout={forwardPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> ) : ( <Alert variant="info">Forward PER chart data not available for current configuration.</Alert> )} </Col> <Col md={12} lg={6}> {defenderPerChartData ? ( <Plot data={defenderPerChartData.data} layout={defenderPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> ) : ( <Alert variant="info">Defender PER chart data not available for current configuration.</Alert> )} </Col> </Row> {/* PER Tables */} <Row className="mt-4"> <Col md={6}> <h3>Top 10 Forwards (PER)</h3> {topPerForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerForwards.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-fwd-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No forward PER ranking data available for current configuration.</Alert> )} </Col> <Col md={6}> <h3>Top 10 Defenders (PER)</h3> {topPerDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerDefenders.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-def-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> ) : ( <Alert variant="info">No defender PER ranking data available for current configuration.</Alert> )} </Col> </Row> </> )}


       {/* --- ADDED CF% Section --- */}
        <h2 className="mt-5">Estimated Player CORSI+ Percentages</h2>
         {isFetchingCfPercentage ? ( // Show spinner while fetching CF%
            <div className="text-center mt-3"><Spinner animation="border" /> Loading CF% Chart...</div>
         ) : cfPercentageChartData ? ( // Render chart if data exists and not loading
            <Row className="mt-4">
                <Col md={12}> {/* Use full width for the single chart */}
                     <Plot
                        data={cfPercentageChartData.data}
                        layout={cfPercentageChartData.layout}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '500px' }} // Adjust height as needed
                        config={{ responsive: true }}
                    />
                </Col>
            </Row>
         // Show error ONLY if CF% loading is done, an error exists, AND chart data is still null
         ) : !loading && !isFetchingCfPercentage && error ? (
             <Alert variant="danger" className="mt-3">Could not load CF% data. Error: {error}</Alert>
         // Show 'unavailable' only if not loading, no error, and data is null
         ) : !loading && !isFetchingCfPercentage && !error ? (
             <Alert variant="info" className="mt-3">CF% chart data is currently unavailable.</Alert>
         ) : null /* Don't show anything during initial global load (covered by global spinner) */ }
         {/* --- END ADDED CF% Section --- */}

    </Container>
  );
}

export default Skaters;
// --- END OF FILE Skaters.js ---
// --- START OF FILE SkatersPage.txt ---

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Container, Row, Col, Image, Spinner, Alert, Table, Form, Button, Card, ListGroup, InputGroup } from 'react-bootstrap'; // Added Button, Card, ListGroup, InputGroup
import Plot from 'react-plotly.js';

// --- Define Available Metrics (Should match backend AVAILABLE_METRICS keys) ---
const ALL_AVAILABLE_METRICS = [
    // Offensive candidates
    "Goals", "First assist", "Second assist", "Shots", "Faceoffs won",
    // Defensive candidates
    "Hits", "Blocked shots", "Takeaways", "Faceoffs lost"
    // NOTE: "Time on ice (Minutes)" is implicitly used in the backend formula
    // NOTE: Player, Position, Shirt number are used for identification, not selection here.
];

// --- Default Configuration (Should match backend defaults) ---
const DEFAULT_OFFENSIVE_METRICS = ["Goals", "First assist", "Second assist"];
const DEFAULT_OFFENSIVE_WEIGHTS = {"Goals": 2.0, "First assist": 1.75, "Second assist": 1.5}; // Use object for easier updates
const DEFAULT_DEFENSIVE_METRICS = ["Hits", "Blocked shots"];
const DEFAULT_DEFENSIVE_WEIGHTS = {"Hits": 1.5, "Blocked shots": 2.0}; // Use object

function Skaters() {
  // --- Existing State ---
  const [imageData, setImageData] = useState(null);
  const [topForwards, setTopForwards] = useState([]); // GAR table
  const [topDefenders, setTopDefenders] = useState([]); // GAR table
  const [forwardChartData, setForwardChartData] = useState(null); // GAR forward chart
  const [defenderChartData, setDefenderChartData] = useState(null); // GAR defender chart
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points'); // For GAR

  // --- PER State ---
  const [topPerForwards, setTopPerForwards] = useState([]);
  const [topPerDefenders, setTopPerDefenders] = useState([]);
  const [forwardPerChartData, setForwardPerChartData] = useState(null);
  const [defenderPerChartData, setDefenderPerChartData] = useState(null);

  // --- NEW State for Dynamic PER Configuration ---
  const [availableMetrics] = useState(ALL_AVAILABLE_METRICS); // Could be fetched if needed
  const [selectedOffensiveMetrics, setSelectedOffensiveMetrics] = useState(new Set(DEFAULT_OFFENSIVE_METRICS));
  const [offensiveWeights, setOffensiveWeights] = useState({...DEFAULT_OFFENSIVE_WEIGHTS}); // Clone default weights
  const [selectedDefensiveMetrics, setSelectedDefensiveMetrics] = useState(new Set(DEFAULT_DEFENSIVE_METRICS));
  const [defensiveWeights, setDefensiveWeights] = useState({...DEFAULT_DEFENSIVE_WEIGHTS}); // Clone default weights
  const [perFormula, setPerFormula] = useState({ offensive: '', defensive: '', per: '' });
  const [isFetchingPer, setIsFetchingPer] = useState(false); // Specific loading state for PER updates
  // --- END NEW State ---


  // Determine current AR column name based on selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  // --- Fetch Function (using useCallback to memoize) ---
  const fetchData = useCallback(async (isPerUpdate = false) => {
    if (!isPerUpdate) { // Full page load or GAR metric change
        setLoading(true);
    } else { // Only PER update requested
        setIsFetchingPer(true); // Set PER-specific loading
    }
    setError(null); // Clear previous errors

    // Construct PER query parameters IF this is a PER update OR initial load
    let perQueryString = '';
    if (isPerUpdate || !isFetchingPer) { // Add params on PER update or initial load
        const offMetrics = Array.from(selectedOffensiveMetrics);
        const offWeights = offMetrics.map(m => offensiveWeights[m] ?? 1.0); // Default weight 1 if missing
        const defMetrics = Array.from(selectedDefensiveMetrics);
        const defWeights = defMetrics.map(m => defensiveWeights[m] ?? 1.0);

        // Basic validation before sending
        if (offMetrics.length === 0 || defMetrics.length === 0) {
             setError("Please select at least one offensive and one defensive metric for PER.");
             setIsFetchingPer(false);
             // Don't clear existing PER data if config is invalid mid-session
             // Only set global loading false if it was a full load attempt
             if (!isPerUpdate) setLoading(false);
             return;
        }

        // Encode metrics that might contain spaces (like 'First assist')
        const encodedOffMetrics = offMetrics.map(encodeURIComponent).join(',');
        const encodedDefMetrics = defMetrics.map(encodeURIComponent).join(',');

        perQueryString = `?offensive_metrics=${encodedOffMetrics}&offensive_weights=${offWeights.join(',')}&defensive_metrics=${encodedDefMetrics}&defensive_weights=${defWeights.join(',')}`;
    }


    try {
        // --- Fetch operations ---
        const fetchPromises = [];

        // Always fetch GAR data if it's not just a PER update
        if (!isPerUpdate) {
            // Scatterplot (Optional - don't block)
             fetchPromises.push(
                fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/')
                    .then(res => res.ok ? res.json() : Promise.resolve(null)) // Resolve null if not ok
                    .then(data => data ? setImageData(data.image) : console.warn("Scatterplot fetch failed or no image."))
                    .catch(err => console.warn("Scatterplot fetch exception:", err))
            );
            // GAR Data
            fetchPromises.push(
                fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`)
                    .then(res => { if (!res.ok) throw new Error(`GAR fetch failed: ${res.status}`); return res.json(); })
                    .then(garData => {
                        if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) {
                           throw new Error("Invalid data structure received from GAR API.");
                         }
                         setTopForwards(garData.top_forwards);
                         setTopDefenders(garData.top_defenders);
                         setForwardChartData(garData.chart_data_forwards);
                         setDefenderChartData(garData.chart_data_defenders);
                    })
            );
        }

        // Always fetch PER data (with dynamic params)
         fetchPromises.push(
            fetch(`http://127.0.0.1:8000/hood_hockey_app/per/${perQueryString}`)
                .then(res => {
                     if (!res.ok) {
                         // Try to get error message from backend response body
                         return res.json().then(errData => {
                             throw new Error(`PER fetch failed: ${res.status} - ${errData.error || 'Unknown error'}`);
                         }).catch(() => {
                              // If parsing backend error fails, throw generic status error
                             throw new Error(`PER fetch failed: ${res.status}`);
                         });
                     }
                     return res.json();
                 })
                .then(perData => {
                    if (!perData || !Array.isArray(perData.top_forwards) || !Array.isArray(perData.top_defenders) || !perData.formula) {
                        throw new Error("Invalid data structure received from PER API.");
                    }
                    setTopPerForwards(perData.top_forwards);
                    setTopPerDefenders(perData.top_defenders);
                    setPerFormula(perData.formula); // Set formula state

                    // Parse chart data carefully
                    setForwardPerChartData(perData.forward_chart_json ? JSON.parse(perData.forward_chart_json) : null);
                    setDefenderPerChartData(perData.defender_chart_json ? JSON.parse(perData.defender_chart_json) : null);
                })
        );

        // Wait for all fetches to complete
        await Promise.all(fetchPromises);

    } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        // Clear potentially stale data on error
        if (!isPerUpdate) { // Clear GAR on full load error
            setTopForwards([]); setTopDefenders([]); setForwardChartData(null); setDefenderChartData(null); setImageData(null);
        }
        // Always clear PER on error
        setTopPerForwards([]); setTopPerDefenders([]); setForwardPerChartData(null); setDefenderPerChartData(null); setPerFormula({ offensive: '', defensive: '', per: '' });

    } finally {
        setLoading(false); // Turn off global loading
        setIsFetchingPer(false); // Turn off PER-specific loading
    }
  }, [selectedMetric, selectedOffensiveMetrics, offensiveWeights, selectedDefensiveMetrics, defensiveWeights]); // Dependencies for useCallback


  // Initial data load and load on GAR metric change
  useEffect(() => {
    fetchData(false); // false indicates it's not just a PER update
  }, [selectedMetric, fetchData]); // Include fetchData in dependency array


  const handleMetricChange = (event) => { // Existing GAR handler
    setSelectedMetric(event.target.value);
     // fetchData will be called by the useEffect hook watching selectedMetric
  };

  // --- NEW Handlers for Dynamic PER ---
  const handleCheckboxChange = (metric, type, isChecked) => {
      const setter = type === 'offensive' ? setSelectedOffensiveMetrics : setSelectedDefensiveMetrics;
      const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights;
      const defaultWeight = 1.0; // Default weight when adding a new metric

      setter(prev => {
          const newSet = new Set(prev);
          if (isChecked) {
              newSet.add(metric);
              // Add default weight if not already present
              weightSetter(prevW => ({ ...prevW, [metric]: prevW[metric] ?? defaultWeight }));
          } else {
              newSet.delete(metric);
              // Optionally remove weight, or keep it in case it's re-added
              // weightSetter(prevW => { const newW = {...prevW}; delete newW[metric]; return newW; });
          }
          return newSet;
      });
  };

  const handleWeightChange = (metric, type, value) => {
      const weightSetter = type === 'offensive' ? setOffensiveWeights : setDefensiveWeights;
      const numericValue = parseFloat(value);
      // Only update if it's a valid number
      if (!isNaN(numericValue)) {
           weightSetter(prevW => ({ ...prevW, [metric]: numericValue }));
      } else if (value === '') {
           // Allow clearing the input, maybe default to 1 or handle during fetch construction
            weightSetter(prevW => ({ ...prevW, [metric]: '' })); // Store as empty string temporarily
      }
  };

  const handleUpdatePerClick = () => {
       fetchData(true); // true indicates this IS just a PER update
  };
  // --- END NEW Handlers ---


  // Helper function createChartConfig for GAR Charts (Existing - unchanged)
  const createChartConfig = (chartData, positionTitle) => {
      // ... (existing GAR chart config logic remains exactly the same) ...
      if (!chartData) return null;
      const { players, metric_values, ar_values, threshold_metric, metric, ar_column } = chartData;
      const blue_heights = metric_values.map(value => Math.min(value, threshold_metric < 0 ? 0 : threshold_metric));
      const red_heights = metric_values.map(value => Math.max(0, value - threshold_metric));
      const customData = metric_values.map((metricVal, index) => ({ metricValue: metricVal, arValue: ar_values[index] }));
      const plotData = [ { x: players, y: blue_heights, type: 'bar', name: `Below/At Repl. (${metric} ≤ ${threshold_metric?.toFixed(2)})`, marker: { color: 'blue' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` }, { x: players, y: red_heights, type: 'bar', base: blue_heights, name: `Above Repl. (${metric} > ${threshold_metric?.toFixed(2)})`, marker: { color: 'red' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` } ];
      const plotLayout = { title: `${metric} for ${positionTitle} (Split by Replacement Level)`, xaxis: { title: 'Player', tickangle: -45 }, yaxis: { title: `${metric}` }, barmode: 'relative', legend: { title: { text: 'vs Replacement' } }, shapes: [{ type: 'line', xref: 'paper', x0: 0, y0: threshold_metric, x1: 1, y1: threshold_metric, line: { color: 'grey', width: 2, dash: 'dash', }}], annotations: [{ xref: 'paper', x: 0.98, y: threshold_metric, text: `Repl. Level (${threshold_metric?.toFixed(2)})`, showarrow: false, yshift: 5, font: {color: 'grey'} }], margin: { b: 100 } };
      return { data: plotData, layout: plotLayout };
  };

  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards');
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders');


  // --- JSX Rendering ---
  return (
    <Container>
       <h1>Skaters</h1>
        {/* --- Scatterplot Section --- */}
       <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
        {loading && !imageData && !error ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> :
         imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> :
         !loading && !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null }

       {/* --- GAR Section --- */}
        <h2 className="mt-5">Player Value Above Replacement</h2>
        <Form className="my-3">
             <Form.Group as={Row} controlId="metricSelect">
                <Form.Label column sm={3} md={2}> Select GAR Metric: </Form.Label>
                <Col sm={6} md={4}>
                    <Form.Select value={selectedMetric} onChange={handleMetricChange} disabled={loading || isFetchingPer}>
                    <option value="Points">Points</option>
                    <option value="Goals">Goals</option>
                    <option value="Assists">Assists</option>
                    </Form.Select>
                </Col>
                {(loading && !isFetchingPer) && <Col sm={1} className="d-flex align-items-center"><Spinner animation="border" size="sm" /></Col>}
             </Form.Group>
        </Form>

        {/* --- Combined Loading / Error Display --- */}
        {/* Show global loading spinner only if not PER loading */}
        {loading && !isFetchingPer && <div className="text-center mt-5"><Spinner animation="border" style={{ width: '3rem', height: '3rem' }}/><h3>Loading All Data...</h3></div>}
        {/* Show specific PER loading indicator */}
        {isFetchingPer && <div className="text-center mt-3"><Spinner animation="border" size="sm"/> Updating PER...</div>}
        {/* Show error if present */}
        {error && !loading && <Alert variant="danger" className="mt-3">Error: {error}</Alert>}


        {/* --- Render Content When Not Loading (Global) --- */}
        {!loading && !error && (
            <>
                {/* --- GAR Charts --- */}
                <Row className="mt-4">
                    <Col md={12} lg={6}>
                        {forwardChartConfig ? ( <Plot data={forwardChartConfig.data} layout={forwardChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> )
                        : ( <Alert variant="info">Forward GAR chart data not available for {currentMetric}.</Alert> )}
                    </Col>
                    <Col md={12} lg={6}>
                        {defenderChartConfig ? ( <Plot data={defenderChartConfig.data} layout={defenderChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> )
                        : ( <Alert variant="info">Defender GAR chart data not available for {currentMetric}.</Alert> )}
                    </Col>
                </Row>

                {/* --- GAR Data Tables --- */}
                 <Row className="mt-4">
                     <Col md={6}>
                         <h3>Top 5 Forwards ({currentMetric} Above Replacement)</h3>
                         {topForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topForwards.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> )
                         : ( <Alert variant="info">No forward GAR table data available.</Alert> )}
                     </Col>
                     <Col md={6}>
                         <h3>Top 5 Defenders ({currentMetric} Above Replacement)</h3>
                         {topDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead><tbody>{topDefenders.map((player, index) => (<tr key={player['Shirt number'] || index}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player[currentMetric]}</td><td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td></tr>))}</tbody></Table> )
                         : ( <Alert variant="info">No defender GAR table data available.</Alert> )}
                     </Col>
                </Row>
            </>
        )}
        {/* End GAR Section (always render structure unless global loading/error) */}


        {/* --- Dynamic PER Section --- */}
        <h2 className="mt-5">Player Efficiency Rating (PER) - Dynamic Configuration</h2>

        {/* --- Configuration Card --- */}
        <Card className="my-4">
            <Card.Header>Configure PER Calculation</Card.Header>
            <Card.Body>
                <Row>
                    {/* Offensive Metrics */}
                    <Col md={6}>
                        <h5>Offensive Metrics & Weights</h5>
                        <ListGroup variant="flush">
                            {availableMetrics.map(metric => (
                                <ListGroup.Item key={`off-${metric}`}>
                                    <InputGroup>
                                        <InputGroup.Checkbox
                                            aria-label={`Select offensive metric ${metric}`}
                                            checked={selectedOffensiveMetrics.has(metric)}
                                            onChange={(e) => handleCheckboxChange(metric, 'offensive', e.target.checked)}
                                            disabled={isFetchingPer}
                                        />
                                         <InputGroup.Text>{metric}</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            aria-label={`Weight for offensive metric ${metric}`}
                                            value={offensiveWeights[metric] ?? ''} // Handle potential undefined
                                            onChange={(e) => handleWeightChange(metric, 'offensive', e.target.value)}
                                            disabled={!selectedOffensiveMetrics.has(metric) || isFetchingPer}
                                            placeholder="Weight (e.g., 1.0)"
                                        />
                                    </InputGroup>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>

                    {/* Defensive Metrics */}
                    <Col md={6}>
                        <h5>Defensive Metrics & Weights</h5>
                         <ListGroup variant="flush">
                            {availableMetrics.map(metric => (
                                <ListGroup.Item key={`def-${metric}`}>
                                    <InputGroup>
                                        <InputGroup.Checkbox
                                            aria-label={`Select defensive metric ${metric}`}
                                            checked={selectedDefensiveMetrics.has(metric)}
                                            onChange={(e) => handleCheckboxChange(metric, 'defensive', e.target.checked)}
                                            disabled={isFetchingPer}
                                        />
                                         <InputGroup.Text>{metric}</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            aria-label={`Weight for defensive metric ${metric}`}
                                            value={defensiveWeights[metric] ?? ''} // Handle potential undefined
                                            onChange={(e) => handleWeightChange(metric, 'defensive', e.target.value)}
                                            disabled={!selectedDefensiveMetrics.has(metric) || isFetchingPer}
                                             placeholder="Weight (e.g., 1.0)"
                                        />
                                    </InputGroup>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>
                <Button
                    variant="primary"
                    className="mt-3"
                    onClick={handleUpdatePerClick}
                    disabled={isFetchingPer || loading} // Disable if any loading is happening
                 >
                    {isFetchingPer ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...</> : 'Update PER Rankings & Charts'}
                </Button>
            </Card.Body>
        </Card>

         {/* --- Formula Display --- */}
         {perFormula.offensive && ( // Only show if formula data is available
             <Card className="mb-4 bg-light">
                 <Card.Body>
                    <Card.Title>Current PER Formula</Card.Title>
                    <pre style={{fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                        {perFormula.offensive}<br/>
                        {perFormula.defensive}<br/>
                        {perFormula.per}
                    </pre>
                 </Card.Body>
             </Card>
         )}

        {/* --- Render PER Content (Charts & Tables) --- */}
        {/* Show PER specific loading OR actual content */}
        {isFetchingPer ? (
             <div className="text-center mt-3"><Spinner animation="border" /> Loading PER Data...</div>
        ) : error && !loading ? ( // Show PER-related error if it happened during PER update
             <Alert variant="warning" className="mt-3">Could not load PER data based on current configuration. Error: {error}</Alert>
        ) : ( // Show PER content if not loading PER and no error OR initial load was successful
             <>
                 {/* PER Charts */}
                <Row className="mt-4">
                    <Col md={12} lg={6}>
                        {forwardPerChartData ? ( <Plot data={forwardPerChartData.data} layout={forwardPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> )
                        : ( <Alert variant="info">Forward PER chart data not available for current configuration.</Alert> )}
                    </Col>
                    <Col md={12} lg={6}>
                        {defenderPerChartData ? ( <Plot data={defenderPerChartData.data} layout={defenderPerChartData.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> )
                        : ( <Alert variant="info">Defender PER chart data not available for current configuration.</Alert> )}
                    </Col>
                </Row>

                 {/* PER Tables */}
                <Row className="mt-4">
                     <Col md={6}>
                         <h3>Top 10 Forwards (PER)</h3>
                         {topPerForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerForwards.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-fwd-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> )
                         : ( <Alert variant="info">No forward PER ranking data available for current configuration.</Alert> )}
                     </Col>
                     <Col md={6}>
                         <h3>Top 10 Defenders (PER)</h3>
                          {topPerDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerDefenders.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-def-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> )
                         : ( <Alert variant="info">No defender PER ranking data available for current configuration.</Alert> )}
                     </Col>
                 </Row>
             </>
         )}
         {/* --- END PER Section --- */}

    </Container>
  );
}

export default Skaters;
// --- END OF FILE SkatersPage.txt ---
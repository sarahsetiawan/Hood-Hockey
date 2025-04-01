// --- START OF FILE SkatersPage.txt ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js';
// Import numpy-like functionality if needed for complex array math,
// otherwise use standard JS array methods. For min/max, Math.min/max works per element.
// import * as np from 'numjs'; // Example if using numjs: npm install numjs

function Skaters() {
  // --- Existing State ---
  const [imageData, setImageData] = useState(null);
  const [topForwards, setTopForwards] = useState([]); // For GAR table
  const [topDefenders, setTopDefenders] = useState([]); // For GAR table
  const [forwardChartData, setForwardChartData] = useState(null); // For GAR forward chart
  const [defenderChartData, setDefenderChartData] = useState(null); // For GAR defender chart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points');

  // --- NEW State for PER Rankings ---
  const [topPerForwards, setTopPerForwards] = useState([]); // For PER table
  const [topPerDefenders, setTopPerDefenders] = useState([]); // For PER table
  // --- NEW State for PER Charts ---
  const [forwardPerChartData, setForwardPerChartData] = useState(null); // Parsed PER chart data
  const [defenderPerChartData, setDefenderPerChartData] = useState(null); // Parsed PER chart data
  // --- END NEW STATE ---


  // Determine current AR column name based on selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  useEffect(() => {
     const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Reset existing states
      setForwardChartData(null);
      setDefenderChartData(null);
      setTopForwards([]);
      setTopDefenders([]);
      setImageData(null);

      // Reset PER states
      setTopPerForwards([]);
      setTopPerDefenders([]);
      setForwardPerChartData(null); // Reset PER chart state
      setDefenderPerChartData(null); // Reset PER chart state


      try {
        // --- Fetch scatterplot image (Optional) ---
        try {
            const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
            if (imageResponse.ok) {
               const imgData = await imageResponse.json();
               setImageData(imgData.image);
            } else { console.warn(`Scatterplot image fetch failed: ${imageResponse.status}`); }
        } catch (imgError) { console.warn("Scatterplot fetch exception:", imgError); }


        // --- Fetch GAR data ---
        const garResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`);
        if (!garResponse.ok) throw new Error(`GAR data fetch error! status: ${garResponse.status}`);
        const garData = await garResponse.json();
        if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) {
             throw new Error("Invalid data structure received from GAR API.");
        }
        setTopForwards(garData.top_forwards);
        setTopDefenders(garData.top_defenders);
        setForwardChartData(garData.chart_data_forwards);
        setDefenderChartData(garData.chart_data_defenders);


        // --- Fetch PER Data (including charts) ---
        const perResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/per/`);
        if (!perResponse.ok) throw new Error(`PER data fetch error! status: ${perResponse.status}`);
        const perData = await perResponse.json();

        // Validate PER response - check for table data arrays specifically
        if (!perData || !Array.isArray(perData.top_forwards) || !Array.isArray(perData.top_defenders)) {
            console.error("Received PER data structure invalid (tables missing/wrong type):", perData);
            throw new Error("Invalid data structure received from PER API (missing tables).");
        }

        setTopPerForwards(perData.top_forwards);
        setTopPerDefenders(perData.top_defenders);

        // --- PARSE and SET PER Chart data ---
        // Check if chart JSON exists before parsing
        if (perData.forward_chart_json) {
             try {
                 setForwardPerChartData(JSON.parse(perData.forward_chart_json));
             } catch (parseError) {
                 console.error("Error parsing Forward PER chart JSON:", parseError);
                 setForwardPerChartData(null); // Set to null on parse error
             }
        } else {
             setForwardPerChartData(null); // Set to null if key doesn't exist
        }

        if (perData.defender_chart_json) {
             try {
                 setDefenderPerChartData(JSON.parse(perData.defender_chart_json));
             } catch (parseError) {
                 console.error("Error parsing Defender PER chart JSON:", parseError);
                 setDefenderPerChartData(null); // Set to null on parse error
             }
        } else {
              setDefenderPerChartData(null); // Set to null if key doesn't exist
        }
        // --- END PARSE ---


      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        // Clear all states on error
        setTopForwards([]);
        setTopDefenders([]);
        setForwardChartData(null);
        setDefenderChartData(null);
        setImageData(null);
        setTopPerForwards([]);
        setTopPerDefenders([]);
        setForwardPerChartData(null); // Clear PER chart state
        setDefenderPerChartData(null); // Clear PER chart state

      } finally {
         setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric]);

  const handleMetricChange = (event) => { // Existing - unchanged
    setSelectedMetric(event.target.value);
  };

  // Helper function createChartConfig for GAR Charts (Existing - unchanged)
  const createChartConfig = (chartData, positionTitle) => {
      // ... (existing GAR chart config logic remains exactly the same) ...
      if (!chartData) return null;
      const { players, metric_values, ar_values, threshold_metric, metric, ar_column } = chartData;
      const blue_heights = metric_values.map(value => Math.min(value, threshold_metric < 0 ? 0 : threshold_metric));
      const red_heights = metric_values.map(value => Math.max(0, value - threshold_metric));
      const customData = metric_values.map((metricVal, index) => ({ metricValue: metricVal, arValue: ar_values[index] }));
      const plotData = [
          { x: players, y: blue_heights, type: 'bar', name: `Below/At Repl. (${metric} ≤ ${threshold_metric?.toFixed(2)})`, marker: { color: 'blue' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` },
          { x: players, y: red_heights, type: 'bar', base: blue_heights, name: `Above Repl. (${metric} > ${threshold_metric?.toFixed(2)})`, marker: { color: 'red' }, customdata: customData, hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>` }
      ];
      const plotLayout = { title: `${metric} for ${positionTitle} (Split by Replacement Level)`, xaxis: { title: 'Player', tickangle: -45 }, yaxis: { title: `${metric}` }, barmode: 'relative', legend: { title: { text: 'vs Replacement' } }, shapes: [{ type: 'line', xref: 'paper', x0: 0, y0: threshold_metric, x1: 1, y1: threshold_metric, line: { color: 'grey', width: 2, dash: 'dash', }}], annotations: [{ xref: 'paper', x: 0.98, y: threshold_metric, text: `Repl. Level (${threshold_metric?.toFixed(2)})`, showarrow: false, yshift: 5, font: {color: 'grey'} }], margin: { b: 100 } };
      return { data: plotData, layout: plotLayout };
  };

  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards'); // Existing GAR config
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders'); // Existing GAR config


  // --- JSX Rendering ---
  return (
    <Container>
       <h1>Skaters</h1>

        {/* --- Existing Scatterplot Section --- */}
        <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
        {/* ... (scatterplot rendering logic unchanged) ... */}
        {loading && !imageData && !error ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> :
         imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> :
         !loading && !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null }


        {/* --- Existing GAR Section --- */}
        <h2 className="mt-5">Player Value Above Replacement</h2>
        {/* --- Existing Metric Selection Dropdown --- */}
        <Form className="my-3">
            {/* ... (dropdown logic unchanged) ... */}
             <Form.Group as={Row} controlId="metricSelect">
                <Form.Label column sm={2}> Select Metric: </Form.Label>
                <Col sm={4}>
                    <Form.Select value={selectedMetric} onChange={handleMetricChange} disabled={loading}>
                    <option value="Points">Points</option>
                    <option value="Goals">Goals</option>
                    <option value="Assists">Assists</option>
                    </Form.Select>
                </Col>
                {loading && <Col sm={1} className="d-flex align-items-center"><Spinner animation="border" size="sm" /></Col>}
                </Form.Group>
        </Form>

        {/* --- Loading / Error Check --- */}
        {loading ? (
            <div className="text-center mt-3"><Spinner animation="border" /> Loading data...</div>
        ) : error ? (
            <Alert variant="danger">Error loading data: {error}</Alert>
        ) : (
            <> {/* Fragment Wrapper */}

            {/* --- Existing GAR Charts --- */}
            <Row className="mt-4">
                {/* ... (GAR chart rendering logic unchanged) ... */}
                 <Col md={12} lg={6}>
                    {forwardChartConfig ? ( <Plot data={forwardChartConfig.data} layout={forwardChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }}/> )
                     : ( <Alert variant="info">Forward GAR chart data not available for {currentMetric}.</Alert> )}
                 </Col>
                 <Col md={12} lg={6}>
                    {defenderChartConfig ? ( <Plot data={defenderChartConfig.data} layout={defenderChartConfig.layout} useResizeHandler={true} style={{ width: '100%', height: '450px' }} config={{ responsive: true }} /> )
                    : ( <Alert variant="info">Defender GAR chart data not available for {currentMetric}.</Alert> )}
                 </Col>
            </Row>

            {/* --- Existing GAR Data Tables --- */}
            <Row className="mt-4">
                 {/* ... (GAR table rendering logic unchanged using 'topForwards', 'topDefenders') ... */}
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


            {/* --- PER Section --- */}
            <h2 className="mt-5">Player Efficiency Rating (PER)</h2>

            {/* --- ADDED PER Charts --- */}
            <Row className="mt-4">
                 <Col md={12} lg={6}>
                    {/* Use NEW PER chart state */}
                    {forwardPerChartData ? (
                        <Plot
                            data={forwardPerChartData.data}    /* Use data from parsed JSON */
                            layout={forwardPerChartData.layout}  /* Use layout from parsed JSON */
                            useResizeHandler={true}
                            style={{ width: '100%', height: '450px' }}
                            config={{ responsive: true }}
                        />
                    ) : (
                        <Alert variant="info">Forward PER chart data not available.</Alert>
                    )}
                 </Col>
                 <Col md={12} lg={6}>
                     {/* Use NEW PER chart state */}
                    {defenderPerChartData ? (
                         <Plot
                            data={defenderPerChartData.data}    /* Use data from parsed JSON */
                            layout={defenderPerChartData.layout}  /* Use layout from parsed JSON */
                            useResizeHandler={true}
                            style={{ width: '100%', height: '450px' }}
                            config={{ responsive: true }}
                        />
                    ) : (
                        <Alert variant="info">Defender PER chart data not available.</Alert>
                    )}
                 </Col>
            </Row>
            {/* --- END PER Charts --- */}


            {/* --- Existing PER Tables --- */}
            <Row className="mt-4">
                 {/* ... (PER table rendering logic unchanged using 'topPerForwards', 'topPerDefenders') ... */}
                 <Col md={6}>
                    <h3>Top 10 Forwards (PER)</h3>
                    {topPerForwards.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerForwards.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-fwd-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> )
                    : ( <Alert variant="info">No forward PER ranking data available.</Alert> )}
                 </Col>
                 <Col md={6}>
                    <h3>Top 10 Defenders (PER)</h3>
                     {topPerDefenders.length > 0 ? ( <Table striped bordered hover responsive size="sm"><thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead><tbody>{topPerDefenders.slice(0, 10).map((player, index) => (<tr key={player['Shirt number'] || `per-def-${index}`}><td>{player['Shirt number']}</td><td>{player['Player']}</td><td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td></tr>))}</tbody></Table> )
                    : ( <Alert variant="info">No defender PER ranking data available.</Alert> )}
                 </Col>
            </Row>
            {/* --- END PER Tables --- */}


            </> // End Fragment Wrapper
        )} {/* End Loading/Error Check */}
    </Container>
  );
}

export default Skaters;
// --- END OF FILE SkatersPage.txt ---
// --- START OF FILE SkatersPage.txt ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js';
// Import numpy-like functionality if needed for complex array math,
// otherwise use standard JS array methods. For min/max, Math.min/max works per element.
// import * as np from 'numjs'; // Example if using numjs: npm install numjs

function Skaters() {
  // --- Existing State (DO NOT CHANGE THESE) ---
  const [imageData, setImageData] = useState(null); // For scatterplot
  const [topForwards, setTopForwards] = useState([]); // For GAR table
  const [topDefenders, setTopDefenders] = useState([]); // For GAR table
  const [forwardChartData, setForwardChartData] = useState(null); // For forward chart data FROM BACKEND
  const [defenderChartData, setDefenderChartData] = useState(null); // For defender chart data FROM BACKEND
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points');
  // --- End Existing State ---

  // --- NEW STATE for PER Rankings (Additions Only) ---
  const [topPerForwards, setTopPerForwards] = useState([]); // For PER table
  const [topPerDefenders, setTopPerDefenders] = useState([]); // For PER table
  // --- END NEW STATE ---


  // Determine current AR column name based on selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  useEffect(() => {
    // --- Existing fetchData function structure ---
     const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Reset existing states (unchanged)
      setForwardChartData(null);
      setDefenderChartData(null);
      setTopForwards([]); // Reset original GAR state
      setTopDefenders([]); // Reset original GAR state
      setImageData(null); // Reset image data too on fetch

      // --- ADD Reset for PER state ---
      setTopPerForwards([]);
      setTopPerDefenders([]);
      // --- END ADD Reset ---

      try {
        // --- Fetch scatterplot image (Existing logic - minor optimization to not stop on failure) ---
        try {
            const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
            if (imageResponse.ok) {
               const imgData = await imageResponse.json();
               setImageData(imgData.image);
            } else {
                console.warn(`Scatterplot image fetch failed: ${imageResponse.status}`);
                // Do not throw error, allow other fetches to proceed
            }
        } catch (imgError) {
             console.warn("Scatterplot fetch exception:", imgError);
             // Do not throw error, allow other fetches to proceed
        }


        // --- Fetch GAR data (Existing logic - unchanged) ---
        const garResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`);
        if (!garResponse.ok) throw new Error(`GAR data fetch error! status: ${garResponse.status}`);
        const garData = await garResponse.json();

        if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) {
             console.error("Received GAR data structure invalid:", garData);
             throw new Error("Invalid data structure received from GAR API.");
        }

        // --- Set existing GAR states (Unchanged) ---
        setTopForwards(garData.top_forwards); // Set original GAR state
        setTopDefenders(garData.top_defenders); // Set original GAR state
        setForwardChartData(garData.chart_data_forwards);
        setDefenderChartData(garData.chart_data_defenders);
        // --- End setting existing GAR states ---


        // --- ADD Fetch PER Data ---
        // Assuming the endpoint for your PERView is '/hood_hockey_app/per-rankings/'
        const perResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/per/`);
        if (!perResponse.ok) throw new Error(`PER data fetch error! status: ${perResponse.status}`);
        const perData = await perResponse.json();

        if (!perData || !perData.top_forwards || !perData.top_defenders) {
            console.error("Received PER data structure invalid:", perData);
            throw new Error("Invalid data structure received from PER API.");
        }

        setTopPerForwards(perData.top_forwards); // Update NEW PER state
        setTopPerDefenders(perData.top_defenders); // Update NEW PER state
        // --- END ADD PER Fetch ---


      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        // Clear existing states on error (unchanged)
        setTopForwards([]);
        setTopDefenders([]);
        setForwardChartData(null);
        setDefenderChartData(null);
        setImageData(null);
        // --- ADD Clear PER state on error ---
        setTopPerForwards([]);
        setTopPerDefenders([]);
        // --- END ADD Clear PER state ---
      } finally {
         setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric]); // Dependency remains the same

  const handleMetricChange = (event) => { // Existing function - unchanged
    setSelectedMetric(event.target.value);
  };

  // Helper function to create Plotly data and layout for SPLIT bars at THRESHOLD (Existing - unchanged)
  const createChartConfig = (chartData, positionTitle) => {
      if (!chartData) return null;

      // Destructure raw data received from backend
      const {
          players,
          metric_values, // Original base metric values
          ar_values,     // Original AR values
          threshold_metric, // The actual replacement level threshold
          metric,
          ar_column
      } = chartData;

      // --- Calculate Bar Segments in Frontend ---
      const blue_heights = metric_values.map(value => Math.min(value, threshold_metric < 0 ? 0 : threshold_metric)); // Cap at threshold, ensure base is >= 0 if threshold is neg
      const red_heights = metric_values.map(value => Math.max(0, value - threshold_metric));

      // Prepare customdata for hover text (combine base metric and AR)
      const customData = metric_values.map((metricVal, index) => ({
            metricValue: metricVal,
            arValue: ar_values[index]
      }));

      const plotData = [
          // Blue Bars (Value Below or At Threshold)
          {
              x: players,
              y: blue_heights,
              type: 'bar',
              name: `Below/At Repl. (${metric} ≤ ${threshold_metric?.toFixed(2)})`,
              marker: { color: 'blue' },
              customdata: customData, // Use combined custom data
              hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>`
          },
          // Red Bars (Value Above Threshold) - Stacked on top of blue
          {
              x: players,
              y: red_heights,
              type: 'bar',
              base: blue_heights, // Start red bars where blue bars end
              name: `Above Repl. (${metric} > ${threshold_metric?.toFixed(2)})`,
              marker: { color: 'red' },
              customdata: customData, // Use combined custom data
              hovertemplate: `<b>%{x}</b><br>${metric}: %{customdata.metricValue:.2f}<br>${ar_column}: %{customdata.arValue:.2f}<extra></extra>`
          }
      ];

      const plotLayout = {
          title: `${metric} for ${positionTitle} (Split by Replacement Level)`,
          xaxis: { title: 'Player', tickangle: -45 },
          yaxis: { title: `${metric}` }, // Y-axis represents the base metric
          barmode: 'relative', // Use 'relative' for stacking segments
          legend: { title: { text: 'vs Replacement' } },
          shapes: [ // Line for the actual replacement level threshold
             {
                type: 'line',
                xref: 'paper',
                x0: 0,
                y0: threshold_metric, // Use the actual threshold value
                x1: 1,
                y1: threshold_metric,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash',
                }
             }
          ],
          annotations: [ // Label the replacement level line
             {
                xref: 'paper',
                x: 0.98, // Position near right
                y: threshold_metric,
                text: `Repl. Level (${threshold_metric?.toFixed(2)})`,
                showarrow: false,
                yshift: 5,
                font: {color: 'grey'}
             }
          ],
          margin: { b: 100 } // Bottom margin for labels
      };

      return { data: plotData, layout: plotLayout };
  };

  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards'); // Existing - unchanged
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders'); // Existing - unchanged


  // --- JSX Rendering ---
  return (
    <Container>
      {/* --- Existing Title --- */}
       <h1>Skaters</h1>

        {/* --- Existing Scatterplot Section (Optimized loading/warning) --- */}
        <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
        {loading && !imageData && !error ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> : // Show spinner only if loading and no image yet and no error
         imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> :
         !loading && !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null } {/* Show warning only if not loading and no error */}

        {/* --- Existing GAR Section Title --- */}
        <h2 className="mt-5">Player Value Above Replacement</h2>

        {/* --- Existing Metric Selection Dropdown --- */}
        <Form className="my-3">
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

        {/* --- Existing Display Loading/Error for Tables/Charts --- */}
        {loading ? (
            <div className="text-center mt-3"><Spinner animation="border" /> Loading data...</div>
        ) : error ? (
            <Alert variant="danger">Error loading data: {error}</Alert>
        ) : (
            // --- Wrapper Fragment already exists implicitly if needed, or add explicitly if not ---
            // Use a fragment if you didn't have one before wrapping the content after loading/error check
            <>
            {/* --- Existing Interactive GAR Charts --- */}
            <Row className="mt-4">
                 <Col md={12} lg={6}>
                    {forwardChartConfig ? (
                        <Plot
                            data={forwardChartConfig.data}
                            layout={forwardChartConfig.layout}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '450px' }}
                            config={{ responsive: true }}
                        />
                    ) : (
                        <Alert variant="info">Forward chart data not available for {currentMetric}.</Alert>
                    )}
                 </Col>
                 <Col md={12} lg={6}>
                    {defenderChartConfig ? (
                        <Plot
                            data={defenderChartConfig.data}
                            layout={defenderChartConfig.layout}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '450px' }}
                            config={{ responsive: true }}
                        />
                    ) : (
                        <Alert variant="info">Defender chart data not available for {currentMetric}.</Alert>
                    )}
                 </Col>
            </Row>

            {/* --- Existing GAR Data Tables --- */}
            <Row className="mt-4">
                 <Col md={6}>
                    {/* Using original state variables: topForwards, topDefenders */}
                    <h3>Top 5 Forwards ({currentMetric} Above Replacement)</h3>
                    {topForwards.length > 0 ? (
                        <Table striped bordered hover responsive size="sm">
                            <thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead>
                            <tbody>
                                {topForwards.map((player, index) => (
                                <tr key={player['Shirt number'] || index}>
                                    <td>{player['Shirt number']}</td>
                                    <td>{player['Player']}</td>
                                    <td>{player[currentMetric]}</td>
                                    <td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : ( <Alert variant="info">No forward table data available.</Alert> )}
                    </Col>
                    <Col md={6}>
                    <h3>Top 5 Defenders ({currentMetric} Above Replacement)</h3>
                    {topDefenders.length > 0 ? (
                        <Table striped bordered hover responsive size="sm">
                            <thead><tr><th>#</th><th>Player</th><th>{currentMetric}</th><th>{currentARColumn}</th></tr></thead>
                            <tbody>
                                {topDefenders.map((player, index) => (
                                <tr key={player['Shirt number'] || index}>
                                    <td>{player['Shirt number']}</td>
                                    <td>{player['Player']}</td>
                                    <td>{player[currentMetric]}</td>
                                    <td>{player[currentARColumn] !== undefined && player[currentARColumn] !== null ? player[currentARColumn].toFixed(2) : 'N/A'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : ( <Alert variant="info">No defender table data available.</Alert> )}
                    </Col>
            </Row>


            {/* --- START: ADDED PER Rankings Section --- */}
            <h2 className="mt-5">Player Efficiency Rating (PER) Rankings</h2>
            <Row className="mt-4">
                <Col md={6}>
                    <h3>Top 10 Forwards (PER)</h3>
                    {/* Use NEW PER state variables */}
                    {topPerForwards.length > 0 ? (
                        <Table striped bordered hover responsive size="sm">
                            <thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead>
                            <tbody>
                                {/* Display top 10 PER Forwards */}
                                {topPerForwards.slice(0, 10).map((player, index) => (
                                <tr key={player['Shirt number'] || `per-fwd-${index}`}> {/* Ensure unique key */}
                                    <td>{player['Shirt number']}</td>
                                    <td>{player['Player']}</td>
                                    {/* Format PER, check for existence */}
                                    <td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : ( <Alert variant="info">No forward PER ranking data available.</Alert> )}
                </Col>
                <Col md={6}>
                    <h3>Top 10 Defenders (PER)</h3>
                     {/* Use NEW PER state variables */}
                     {topPerDefenders.length > 0 ? (
                        <Table striped bordered hover responsive size="sm">
                            <thead><tr><th>#</th><th>Player</th><th>PER</th></tr></thead>
                            <tbody>
                                {/* Display top 10 PER Defenders */}
                                {topPerDefenders.slice(0, 10).map((player, index) => (
                                <tr key={player['Shirt number'] || `per-def-${index}`}> {/* Ensure unique key */}
                                    <td>{player['Shirt number']}</td>
                                    <td>{player['Player']}</td>
                                     {/* Format PER, check for existence */}
                                    <td>{player.PER !== undefined && player.PER !== null ? player.PER.toFixed(3) : 'N/A'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : ( <Alert variant="info">No defender PER ranking data available.</Alert> )}
                </Col>
            </Row>
            {/* --- END: ADDED PER Rankings Section --- */}


            </> // End fragment (ensure it exists if needed)
        )} {/* End Loading/Error Check */}
    </Container>
  );
}

export default Skaters;
// --- END OF FILE SkatersPage.txt ---
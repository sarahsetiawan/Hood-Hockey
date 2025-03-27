import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js';
// Import numpy-like functionality if needed for complex array math,
// otherwise use standard JS array methods. For min/max, Math.min/max works per element.
// import * as np from 'numjs'; // Example if using numjs: npm install numjs

function Skaters() {
  const [imageData, setImageData] = useState(null); // For scatterplot
  const [topForwards, setTopForwards] = useState([]); // For table
  const [topDefenders, setTopDefenders] = useState([]); // For table
  const [forwardChartData, setForwardChartData] = useState(null); // For forward chart data FROM BACKEND
  const [defenderChartData, setDefenderChartData] = useState(null); // For defender chart data FROM BACKEND
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points');

  // Determine current AR column name based on selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  useEffect(() => {
    // ... (fetchData logic remains the same - fetches raw chart data now) ...
     const fetchData = async () => {
      setLoading(true);
      setError(null);
      setForwardChartData(null);
      setDefenderChartData(null);
      try {
        // Fetch scatterplot image (optional)
        const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (imageResponse.ok) {
           const imgData = await imageResponse.json();
           setImageData(imgData.image);
        } else {
            console.warn(`Scatterplot image fetch failed: ${imageResponse.status}`);
            setImageData(null);
        }

        // Fetch GAR data
        const garResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`);
        if (!garResponse.ok) throw new Error(`GAR data fetch error! status: ${garResponse.status}`);
        const garData = await garResponse.json();

        if (!garData || !garData.top_forwards || !garData.top_defenders || !garData.chart_data_forwards || !garData.chart_data_defenders) {
             // Check for chart data existence as well
             console.error("Received data:", garData); // Log data if structure is wrong
             throw new Error("Invalid data structure received from GAR API.");
        }

        setTopForwards(garData.top_forwards);
        setTopDefenders(garData.top_defenders);
        setForwardChartData(garData.chart_data_forwards);
        setDefenderChartData(garData.chart_data_defenders);

      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setTopForwards([]);
        setTopDefenders([]);
        setForwardChartData(null);
        setDefenderChartData(null);
      } finally {
         setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric]);

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Helper function to create Plotly data and layout for SPLIT bars at THRESHOLD
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

  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards');
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders');


  // --- JSX Rendering (mostly unchanged) ---
  return (
    <Container>
      {/* ... (Scatterplot rendering, Dropdown, Loading/Error checks remain the same) ... */}
       <h1>Skaters</h1>
        <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
        {loading && !imageData ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> :
         imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> :
         !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null }


        <h2 className="mt-5">Player Value Above Replacement</h2>

        {/* Metric Selection Dropdown */}
        <Form className="my-3">
            {/* ... Dropdown code ... */}
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

        {/* Display Loading/Error for Tables/Charts */}
        {loading ? (
            <div className="text-center mt-3"><Spinner animation="border" /> Loading data...</div>
        ) : error ? (
            <Alert variant="danger">Error loading data: {error}</Alert>
        ) : (
            <>
            {/* Interactive Charts */}
            <Row className="mt-4">
                {/* ... Chart rendering code ... */}
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

            {/* Data Tables */}
            <Row className="mt-4">
                {/* ... Table rendering code ... */}
                 <Col md={6}>
                    <h3>Top 5 Forwards ({currentMetric})</h3>
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
                    <h3>Top 5 Defenders ({currentMetric})</h3>
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
            </>
        )}
    </Container>
  );
}

export default Skaters;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js';

function Skaters() {
  const [imageData, setImageData] = useState(null); // For scatterplot
  const [topForwards, setTopForwards] = useState([]); // For table
  const [topDefenders, setTopDefenders] = useState([]); // For table
  const [forwardChartData, setForwardChartData] = useState(null); // For forward chart
  const [defenderChartData, setDefenderChartData] = useState(null); // For defender chart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points');

  // Determine current AR column name based on selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`;

  useEffect(() => {
    // ... (fetchData logic remains the same) ...
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

        if (!garData || !garData.top_forwards || !garData.top_defenders) {
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

  // Helper function to create Plotly data and layout for AR bars split at ZERO
  const createChartConfig = (chartData, positionTitle) => {
      if (!chartData) return null;

      // Destructure data received from backend
      const {
          players,
          ar_values,             // Original AR values for hover
          below_replacement_ar, // Negative AR segment heights (<= 0)
          above_replacement_ar, // Positive AR segment heights (> 0)
          threshold_ar,         // This is 0
          metric,
          ar_column
          // replacement_level_metric // Not directly used for this chart's line
      } = chartData;

      const plotData = [
          // Blue Bars (Negative AR or Zero)
          {
              x: players,
              y: below_replacement_ar, // Use the negative AR segment height
              type: 'bar',
              name: 'Below/At Replacement (AR ≤ 0)',
              marker: { color: 'blue' },
              customdata: ar_values, // Show full AR value on hover
              hovertemplate: `<b>%{x}</b><br>${ar_column}: %{customdata:.2f}<extra></extra>`
          },
          // Red Bars (Positive AR) - Stacked on blue (which ends at y=0 or below)
          {
              x: players,
              y: above_replacement_ar, // Use the positive AR segment height
              type: 'bar',
              base: below_replacement_ar, // Start red bar where blue bar ends (at y=0 or below)
              // Alternatively, if blue_heights are always <=0 and red_heights always >=0:
              // base: 0, // Can also set base to 0 if blue is always <= 0
              name: 'Above Replacement (AR > 0)',
              marker: { color: 'red' },
              customdata: ar_values, // Show full AR value on hover
              hovertemplate: `<b>%{x}</b><br>${ar_column}: %{customdata:.2f}<extra></extra>`
          }
      ];

      const plotLayout = {
          title: `${ar_column} for ${positionTitle} `,
          xaxis: { title: 'Player', tickangle: -45 },
          yaxis: { title: `${metric} Above Replacement (${ar_column})` }, // Y-axis represents AR value
          barmode: 'relative', // 'relative' works well for stacking positive/negative
          legend: { title: { text: 'AR vs 0' } },
          shapes: [ // Line at AR = 0
             {
                type: 'line',
                xref: 'paper',
                x0: 0,
                y0: threshold_ar, // Use the threshold_ar which is 0
                x1: 1,
                y1: threshold_ar, // Line at y=0
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash',
                }
             }
          ],
          annotations: [ // Label the AR = 0 line
             {
                xref: 'paper',
                x: 0.98,
                y: threshold_ar, // Use the threshold_ar which is 0
                text: `Replacement Level`, // Label the zero line
                showarrow: false,
                yshift: 5,
                font: {color: 'grey'}
             }
          ],
          margin: { b: 100 }
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
                            style={{ width: '100%', height: '400px' }}
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
                            style={{ width: '100%', height: '400px' }}
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
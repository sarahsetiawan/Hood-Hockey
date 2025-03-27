import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js'; // Import Plotly component

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
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Clear previous chart data on new fetch
      setForwardChartData(null);
      setDefenderChartData(null);
      try {
        // Fetch scatterplot image (optional, could be fetched once)
        const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (imageResponse.ok) { // Handle image fetch failure gracefully
           const imgData = await imageResponse.json();
           setImageData(imgData.image);
        } else {
            console.warn(`Scatterplot image fetch failed: ${imageResponse.status}`);
            setImageData(null); // Ensure image state is cleared on failure
        }


        // Fetch GAR data (table and chart data)
        const garResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`);
        if (!garResponse.ok) throw new Error(`GAR data fetch error! status: ${garResponse.status}`);
        const garData = await garResponse.json();

        if (!garData || !garData.top_forwards || !garData.top_defenders) {
             throw new Error("Invalid data structure received from GAR API.");
        }

        setTopForwards(garData.top_forwards);
        setTopDefenders(garData.top_defenders);
        setForwardChartData(garData.chart_data_forwards); // Store forward chart data
        setDefenderChartData(garData.chart_data_defenders); // Store defender chart data

      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        // Clear data on error
        setTopForwards([]);
        setTopDefenders([]);
        setForwardChartData(null);
        setDefenderChartData(null);
      } finally {
         setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric]); // Re-fetch when selectedMetric changes

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Helper function to create Plotly data and layout
  const createChartConfig = (chartData, positionTitle) => {
      if (!chartData) return null;

      const { players, ar_values, below_threshold, above_threshold, threshold, metric, ar_column, replacement_level } = chartData;

      const plotData = [
          {
              x: players,
              y: below_threshold,
              type: 'bar',
              name: 'Below Replacement',
              marker: { color: 'blue' },
              customdata: ar_values, // Store full AR value for hover
              hovertemplate: '<b>%{x}</b><br>AR: %{customdata:.2f}<extra></extra>' // Custom hover text
          },
          {
              x: players,
              y: above_threshold,
              type: 'bar',
              base: threshold, // Base is 0 for color split
              name: 'Above Replacement',
              marker: { color: 'red' },
              customdata: ar_values,
              hovertemplate: '<b>%{x}</b><br>AR: %{customdata:.2f}<extra></extra>'
          }
      ];

      const plotLayout = {
          title: `${ar_column} for ${positionTitle} (Split at 0)`,
          xaxis: { title: 'Player', tickangle: -45 },
          yaxis: { title: `${metric} Above Replacement (${ar_column})` },
          barmode: 'relative',
          legend: { title: { text: 'AR vs 0' } },
          shapes: [ // Add the actual replacement level line
             {
                type: 'line',
                xref: 'paper', // Use paper for x0, x1 to span full width
                x0: 0,
                y0: replacement_level,
                x1: 1,
                y1: replacement_level,
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
                x: 0.98, // Position label near right edge
                y: replacement_level,
                text: `Repl. Level (${replacement_level?.toFixed(2)})`,
                showarrow: false,
                yshift: 5,
                font: {color: 'grey'}
             }
          ],
          margin: { b: 100 } // Add bottom margin for rotated labels
      };

      return { data: plotData, layout: plotLayout };
  };

  const forwardChartConfig = createChartConfig(forwardChartData, 'Forwards');
  const defenderChartConfig = createChartConfig(defenderChartData, 'Defenders');


  return (
    <Container>
      <Row>
        <Col>
          <h1>Skaters</h1>
          <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
          {loading && !imageData ? <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div> :
           imageData ? <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid /> :
           !error ? <Alert variant="warning">Scatterplot image data not available.</Alert> : null } {/* Hide image alert if main error */}


          <h2 className="mt-5">Player Value Above Replacement</h2>

          {/* Metric Selection Dropdown */}
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

          {/* Display Loading/Error for Tables/Charts */}
          {loading ? (
             <div className="text-center mt-3"><Spinner animation="border" /> Loading data...</div>
          ) : error ? (
             <Alert variant="danger">Error loading data: {error}</Alert>
          ) : (
             <>
              {/* Interactive Charts */}
              <Row className="mt-4">
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
        </Col>
      </Row>
    </Container>
  );
}

export default Skaters;
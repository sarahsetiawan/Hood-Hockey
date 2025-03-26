import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Table, Form } from 'react-bootstrap'; // Import Form

function Skaters() {
  const [imageData, setImageData] = useState(null);
  const [topForwards, setTopForwards] = useState([]);
  const [topDefenders, setTopDefenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Points'); // State for dropdown selection

  // Dynamically determine the column names based on the selected metric
  const currentMetric = selectedMetric;
  const currentARColumn = `${selectedMetric}AR`; // PointsAR, GoalsAR, AssistsAR

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading true at the start of fetch
      setError(null);   // Clear previous errors
      try {
        // Fetch scatterplot image 
        const imageResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (!imageResponse.ok) throw new Error(`Image fetch error! status: ${imageResponse.status}`);
        const imgData = await imageResponse.json();
        setImageData(imgData.image);

        // --- Fetch GAR data based on selectedMetric ---
        const garResponse = await fetch(`http://127.0.0.1:8000/hood_hockey_app/gar/?metric=${selectedMetric}`); // Use selectedMetric in URL
        if (!garResponse.ok) throw new Error(`GAR fetch error! status: ${garResponse.status}`);
        const garData = await garResponse.json();

        // Basic validation of response structure
        if (!garData || !garData.top_forwards || !garData.top_defenders) {
             throw new Error("Invalid GAR data structure received from API.");
        }

        setTopForwards(garData.top_forwards);
        setTopDefenders(garData.top_defenders);

      } catch (error) {
        console.error("Fetch error:", error); // Log the error for debugging
        setError(error.message);
      } finally {
         setLoading(false); // Set loading false after fetch attempt (success or fail)
      }
    };

    fetchData();
  }, [selectedMetric]); // Add selectedMetric to dependency array - Re-fetch when it changes!

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Display loading only for the data part if image is already loaded
  // Or handle image loading separately if preferred
  if (loading && !imageData) { // Initial full page load
     return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Loading...</p>
      </Container>
    );
  }

  // Display error prominently
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error fetching data: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1>Skaters</h1>
          <h2 className="mt-3">Scatterplot of Max Speed vs Goals</h2>
          {imageData ? (
            <Image src={`data:image/png;base64,${imageData}`} alt="Scatterplot" fluid />
          ) : loading ? ( // Show spinner specifically for image if it's still loading
             <div className="text-center"><Spinner animation="border" size="sm" /> Loading Image...</div>
          ) : (
            <Alert variant="warning">Scatterplot image data not available.</Alert> // Changed variant
          )}

          <h2 className="mt-5">Top Players by {currentMetric} Above Replacement</h2>

          {/* Metric Selection Dropdown */}
          <Form className="my-3">
            <Form.Group as={Row} controlId="metricSelect">
              <Form.Label column sm={2}>
                Select Metric:
              </Form.Label>
              <Col sm={4}>
                <Form.Select value={selectedMetric} onChange={handleMetricChange}>
                  <option value="Points">Points</option>
                  <option value="Goals">Goals</option>
                  <option value="Assists">Assists</option>
                </Form.Select>
              </Col>
               {/* Show spinner next to dropdown when tables are reloading */}
               {loading && (
                  <Col sm={1} className="d-flex align-items-center">
                     <Spinner animation="border" size="sm" />
                  </Col>
               )}
            </Form.Group>
          </Form>


          {/* Display Tables - Show loading state specifically for tables */}
          {loading ? (
             <div className="text-center mt-3"><Spinner animation="border" /> Loading tables...</div>
          ) : error ? (
              <Alert variant="danger">Error loading table data: {error}</Alert> // Show specific table error
          ) : (
            <Row>
              <Col md={6}>
                <h3>Forwards</h3>
                {topForwards.length > 0 ? (
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>{currentMetric}</th>
                        <th>{currentARColumn}</th>
                      </tr>
                    </thead>
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
                ) : (
                  <Alert variant="info">No forward data available for {currentMetric}.</Alert>
                )}
              </Col>

              <Col md={6}>
                <h3>Defenders</h3>
                {topDefenders.length > 0 ? (
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>{currentMetric}</th>
                        <th>{currentARColumn}</th>
                      </tr>
                    </thead>
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
                ) : (
                  <Alert variant="info">No defender data available for {currentMetric}.</Alert>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Skaters;
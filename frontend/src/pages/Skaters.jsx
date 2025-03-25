import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert } from 'react-bootstrap';

function Skaters() {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/fitness-corr/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setImageData(data.image);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status" />
                <p>Loading...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Error: {error}</Alert>
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
          ) : (
              <Alert variant="info">No image data found.</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Skaters;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

function LinesQuery() {
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true);  // Add loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("useEffect running");
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const response = await axios.get('http://127.0.0.1:8000/hood_hockey_app/lines-rankings/');
                console.log("API response:", response.data);
                setCorsiData(response.data.corsi);
                setGoalsData(response.data.goals);
            } catch (err) {
                console.error("API error:", err);
                setError(err.message);
            } finally {
                setLoading(false); // Set loading to false after fetch (success or failure)
            }
        };

        fetchData();
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
            <h1> Lineups </h1>
            {/* CORSI Table */}
            {corsiData.length > 0 && (
                <Row className="mt-3">
                    <Col>
                    <h2>CORSI Rankings</h2>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                {Object.keys(corsiData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {corsiData.map((line, index) => (
                                <tr key={index}>
                                    {Object.values(line).map((value, i) => (
                                        <td key={i}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    </Col>
                </Row>
            )}

            {/* Goals Table */}
            {goalsData.length > 0 && (
                <Row className="mt-3">
                    <Col>
                    <h2>Goals Rankings</h2>
                   <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                {Object.keys(goalsData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {goalsData.map((line, index) => (
                                <tr key={index}>
                                    {Object.values(line).map((value, i) => (
                                        <td key={i}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default LinesQuery;
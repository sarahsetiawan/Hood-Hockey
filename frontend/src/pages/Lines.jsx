import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Keep using axios as it was already used
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app'; // Adjust if needed

function LinesQuery() {
    // --- Existing State ---
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- End Existing State ---

    // --- ADDED State for Synergy Scores ---
    const [forwardSynergyData, setForwardSynergyData] = useState([]);
    const [defenderSynergyData, setDefenderSynergyData] = useState([]);
    // --- END ADDED State ---

    // How many top/bottom pairs to display in the synergy tables
    const DISPLAY_COUNT = 10;

    useEffect(() => {
        console.log("useEffect running - fetching Lines Rankings and Synergy Scores");
        const fetchData = async () => {
            setLoading(true); // Set loading true for the combined fetch
            setError(null);   // Clear previous errors
            setForwardSynergyData([]);
            setDefenderSynergyData([]);
            // Reset existing data too before fetch
            setCorsiData([]);
            setGoalsData([]);
            try {
                const [linesResponse, synergyResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/lines-rankings/`), 
                    axios.get(`${API_BASE_URL}/syn-scores/`) 
                ]);

                // Process Lines Rankings Response
                console.log("Lines API response:", linesResponse.data);
                if (linesResponse.data && linesResponse.data.corsi && linesResponse.data.goals) {
                    setCorsiData(linesResponse.data.corsi);
                    setGoalsData(linesResponse.data.goals);
                } else {
                    console.warn("Lines rankings data structure unexpected:", linesResponse.data);
                    setCorsiData([]); setGoalsData([]); // Set empty on unexpected structure
                }

                // Process Synergy Scores Response
                console.log("Synergy API response:", synergyResponse.data);
                const synergyData = synergyResponse.data;
                if (synergyData && Array.isArray(synergyData.forwards) && Array.isArray(synergyData.defenders)) {
                    setForwardSynergyData(synergyData.forwards);
                    setDefenderSynergyData(synergyData.defenders);
                } else {
                    console.warn("Synergy scores data structure unexpected:", synergyData);
                    setForwardSynergyData([]); setDefenderSynergyData([]); // Set empty on unexpected structure
                }

            } catch (err) {
                console.error("API error:", err);
                let errorMsg = err.message;
                if (err.response && err.response.data && err.response.data.error) {
                    errorMsg = err.response.data.error;
                }
                setError(errorMsg);
                setCorsiData([]); setGoalsData([]); setForwardSynergyData([]); setDefenderSynergyData([]); // Clear all on error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper function to render a synergy table (Unchanged)
    const renderSynergyTable = (title, data, count) => {
        const topData = data.slice(0, count);
        return ( <Col md={6} className="mb-4"> <h4>{title}</h4> {topData.length > 0 ? ( <Table striped bordered hover responsive size="sm"> <thead> <tr> <th>Rank</th> <th>Player Pair</th> <th>Synergy Score (G/60)</th> </tr> </thead> <tbody> {topData.map((item, index) => { let pairDisplay = 'N/A'; if (Array.isArray(item.Pair) && item.Pair.length === 2) { pairDisplay = item.Pair.join(' - '); } else { pairDisplay = JSON.stringify(item.Pair); } const score = item['Rate Synergy Score (G60)']; const scoreDisplay = (score !== null && score !== undefined) ? score.toFixed(2) : 'N/A'; return ( <tr key={`${pairDisplay}-${index}`}> <td>{index + 1}</td> <td>{pairDisplay}</td> <td>{scoreDisplay}</td> </tr> ); })} </tbody> </Table> ) : ( <Alert variant="info" size="sm">No synergy data available.</Alert> )} </Col> );
    };


    // Loading Render (Unchanged)
    if (loading) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Lineup and Synergy Data...</p> </Container> ); }
    // Error Render (Unchanged)
    if (error) { return ( <Container className="mt-5"> <Alert variant="danger">Error loading data: {error}</Alert> </Container> ); }

    // --- Combined Render ---
    return (
        <Container>
            <h1>Lineups</h1>

            {/* --- CORSI Table Section (FIXED) --- */}
            <Row className="mt-3">
                <Col>
                    <h2>CORSI Rankings</h2>
                    {/* Check if data exists AND has at least one row */}
                    {corsiData && corsiData.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    {/* Get keys from the FIRST row object */}
                                    {Object.keys(corsiData[0]).map((key) => (
                                        <th key={`corsi-th-${key}`}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {corsiData.map((line, index) => (
                                    // Use a more robust key if possible (e.g., line.Line if unique)
                                    <tr key={`corsi-tr-${index}`}>
                                        {/* Iterate over the values of the current row object */}
                                        {Object.values(line).map((value, i) => (
                                            <td key={`corsi-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> // Handle null/undefined
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        // Show unavailable message only if not loading and no error
                        !loading && !error && <Alert variant="warning">CORSI ranking data is unavailable.</Alert>
                    )}
                </Col>
            </Row>
            {/* --- END CORSI Table Section --- */}


            {/* --- Goals Table Section (FIXED) --- */}
            <Row className="mt-3">
                <Col>
                    <h2>Goals Rankings</h2>
                     {/* Check if data exists AND has at least one row */}
                    {goalsData && goalsData.length > 0 ? (
                        <Table striped bordered hover responsive>
                             <thead>
                                <tr>
                                    {/* Get keys from the FIRST row object */}
                                    {Object.keys(goalsData[0]).map((key) => (
                                        <th key={`goals-th-${key}`}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {goalsData.map((line, index) => (
                                     // Use a more robust key if possible (e.g., line.Line if unique)
                                    <tr key={`goals-tr-${index}`}>
                                        {/* Iterate over the values of the current row object */}
                                        {Object.values(line).map((value, i) => (
                                            <td key={`goals-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> // Handle null/undefined
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                         // Show unavailable message only if not loading and no error
                        !loading && !error && <Alert variant="warning">Goals ranking data is unavailable.</Alert>
                    )}
                </Col>
            </Row>
            {/* --- END Goals Table Section --- */}


            {/* --- Synergy Scores Section (Unchanged from previous correct version) --- */}
            {/* Render this section only if loading is complete and no error occurred */}
            {!loading && !error && (
                <>
                    <h2 className="mt-5">Player Pair Synergy Scores</h2>
                    <p className="text-muted">
                        Based on Goals/60 Rate: (G/60 Together) - Average(G/60 Apart).
                    </p>
                    <Row className="mt-3">
                        {renderSynergyTable(`Top ${DISPLAY_COUNT} Forward Pairs`, forwardSynergyData, DISPLAY_COUNT)}
                        {renderSynergyTable(`Top ${DISPLAY_COUNT} Defender Pairs`, defenderSynergyData, DISPLAY_COUNT)}
                    </Row>
                </>
            )}
             {/* --- END Synergy Scores Section --- */}

        </Container>
    );
}

export default LinesQuery;
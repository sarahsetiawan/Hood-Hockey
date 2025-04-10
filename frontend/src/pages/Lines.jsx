import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app'; 

function LinesQuery() {
    // --- State ---
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forwardSynergyData, setForwardSynergyData] = useState([]);
    const [defenderSynergyData, setDefenderSynergyData] = useState([]);
    // --- End State ---

    useEffect(() => {
        // --- Fetch Logic (Unchanged from previous correct version) ---
        console.log("useEffect running - fetching Lines Rankings and Synergy Scores");
        const fetchData = async () => {
            setLoading(true); setError(null);
            setForwardSynergyData([]); setDefenderSynergyData([]);
            setCorsiData([]); setGoalsData([]);
            try {
                const [linesResponse, synergyResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/lines-rankings/`),
                    axios.get(`${API_BASE_URL}/syn-scores/`)
                ]);

                // Process Lines Rankings
                console.log("Lines API response:", linesResponse.data);
                if (linesResponse.data && linesResponse.data.corsi && linesResponse.data.goals) {
                    setCorsiData(linesResponse.data.corsi); setGoalsData(linesResponse.data.goals);
                } else { console.warn("Lines rankings data structure unexpected:", linesResponse.data); setCorsiData([]); setGoalsData([]); }

                // Process Synergy Scores
                console.log("Synergy API response:", synergyResponse.data);
                const synergyData = synergyResponse.data;
                if (synergyData && Array.isArray(synergyData.forwards) && Array.isArray(synergyData.defenders)) {
                    setForwardSynergyData(synergyData.forwards); setDefenderSynergyData(synergyData.defenders);
                } else { console.warn("Synergy scores data structure unexpected:", synergyData); setForwardSynergyData([]); setDefenderSynergyData([]); }

            } catch (err) {
                console.error("API error:", err); let errorMsg = err.message; if (err.response?.data?.error) { errorMsg = err.response.data.error; } setError(errorMsg);
                setCorsiData([]); setGoalsData([]); setForwardSynergyData([]); setDefenderSynergyData([]);
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);
    // --- End Fetch Logic ---


    // --- MODIFIED Helper function to render a FULL synergy table with scroll ---
    const renderSynergyTable = (title, data) => { // Removed 'count' parameter

        // Use the full data array directly
        const tableData = data;

        return (
        <Col md={6} className="mb-4">
            <h4>{title}</h4>
            {/* Check if the full data array has items */}
            {tableData && tableData.length > 0 ? (
                // Add a wrapper div for scrolling
                <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                     <Table striped bordered hover responsive size="sm" className="mb-0"> {/* mb-0 removes bottom margin inside scroll div */}
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}> {/* Sticky header */}
                        <tr>
                            <th>Rank</th>
                            <th>Player Pair</th>
                            <th>Synergy Score (G/60)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Map over the full tableData array */}
                        {tableData.map((item, index) => {
                            let pairDisplay = 'N/A';
                            if (Array.isArray(item.Pair) && item.Pair.length === 2) {
                                pairDisplay = item.Pair.join(' - ');
                            } else {
                                pairDisplay = JSON.stringify(item.Pair);
                            }
                            const score = item['Rate Synergy Score (G60)'];
                            const scoreDisplay = (score !== null && score !== undefined) ? score.toFixed(2) : 'N/A';

                            // Backend sorts descending, so rank is index + 1
                            const rank = index + 1;

                            return (
                            <tr key={`${pairDisplay}-${rank}`}> {/* Use rank in key */}
                                <td>{rank}</td>
                                <td>{pairDisplay}</td>
                                <td>{scoreDisplay}</td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                 </div>
            ) : (
                // Adjusted Alert message
                <Alert variant="info" size="sm">No synergy data available to display.</Alert>
            )}
        </Col>
        );
    };
    // --- END MODIFIED Helper ---


    // --- Loading / Error Render (Unchanged) ---
    if (loading) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Lineup and Synergy Data...</p> </Container> ); }
    if (error) { return ( <Container className="mt-5"> <Alert variant="danger">Error loading data: {error}</Alert> </Container> ); }

    // --- Combined Render ---
    return (
        <Container>
            {/* --- Existing Lines Section (Unchanged structure, fixed rendering) --- */}
            <h1>Lineups</h1>
            {/* CORSI Table Section */}
             <Row className="mt-3"> <Col> <h2>CORSI Rankings</h2> {corsiData && corsiData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(corsiData[0]).map((key) => ( <th key={`corsi-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {corsiData.map((line, index) => ( <tr key={`corsi-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`corsi-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">CORSI ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* Goals Table Section */}
             <Row className="mt-3"> <Col> <h2>Goals Rankings</h2> {goalsData && goalsData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(goalsData[0]).map((key) => ( <th key={`goals-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {goalsData.map((line, index) => ( <tr key={`goals-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`goals-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">Goals ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* --- END Existing Lines Section --- */}


            {/* --- Synergy Scores Section (MODIFIED CALLS) --- */}
            {!loading && !error && ( // Render only when data fetch is complete and successful
                <>
                    <h2 className="mt-5">Player Pair Synergy Scores</h2>
                    <p className="text-muted">
                        Based on Goals/60 Rate: (G/60 Together) - Average(G/60 Apart). Higher score indicates better performance together.
                    </p>
                    <Row className="mt-3">
                        {/* Call helper with full data, updated title */}
                        {renderSynergyTable(`Forward Pairs (All)`, forwardSynergyData)}
                        {renderSynergyTable(`Defender Pairs (All)`, defenderSynergyData)}
                    </Row>
                </>
            )}
             {/* --- END Synergy Scores Section --- */}

        </Container>
    );
}

export default LinesQuery;

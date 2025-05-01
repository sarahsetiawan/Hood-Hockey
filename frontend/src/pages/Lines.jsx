// --- START OF FILE LinesQuery.js ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function LinesQuery() {
    // --- Existing State ---
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forwardSynergyData, setForwardSynergyData] = useState([]);
    const [defenderSynergyData, setDefenderSynergyData] = useState([]);
    // --- End Existing State ---

    // --- State for PER Data (Keep state definition) ---
    const [perForwardsData, setPerForwardsData] = useState([]);
    const [perDefendersData, setPerDefendersData] = useState([]);
    // --- END State for PER Data ---


    useEffect(() => {
        // --- Fetch Logic ---
        console.log("useEffect running - fetching Lines, Synergy, and PER Data");
        const fetchData = async () => {
            setLoading(true); setError(null);
            // Reset existing state
            setForwardSynergyData([]); setDefenderSynergyData([]);
            setCorsiData([]); setGoalsData([]);
            // Reset PER data state
            setPerForwardsData([]); setPerDefendersData([]);
            try {
                // Fetch all endpoints concurrently
                // IMPORTANT: Ensure the PER endpoint path here is correct!
                const [linesResponse, synergyResponse, perResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/lines-rankings/`),
                    axios.get(`${API_BASE_URL}/syn-scores/`),
                    axios.get(`${API_BASE_URL}/linesPER/`) // Fetch PER data endpoint
                ]);

                // --- Process Lines Rankings (Existing) ---
                console.log("Lines API response:", linesResponse.data);
                if (linesResponse.data && linesResponse.data.corsi && linesResponse.data.goals) {
                    setCorsiData(linesResponse.data.corsi); setGoalsData(linesResponse.data.goals);
                } else { console.warn("Lines rankings data structure unexpected:", linesResponse.data); setCorsiData([]); setGoalsData([]); }

                // --- Process Synergy Scores (Existing) ---
                console.log("Synergy API response:", synergyResponse.data);
                const synergyData = synergyResponse.data;
                if (synergyData && Array.isArray(synergyData.forwards) && Array.isArray(synergyData.defenders)) {
                    setForwardSynergyData(synergyData.forwards); setDefenderSynergyData(synergyData.defenders);
                } else { console.warn("Synergy scores data structure unexpected:", synergyData); setForwardSynergyData([]); setDefenderSynergyData([]); }

                // --- Process PER Data (Keep processing logic) ---
                console.log("Optimal Lines PER API response:", perResponse.data);
                const perData = perResponse.data;
                if (perData && Array.isArray(perData.forwards) && Array.isArray(perData.defenders)) {
                     const sortFn = (a, b) => (b.PER ?? -Infinity) - (a.PER ?? -Infinity);
                    setPerForwardsData([...perData.forwards].sort(sortFn));
                    setPerDefendersData([...perData.defenders].sort(sortFn));
                } else {
                    console.warn("PER data structure unexpected:", perData);
                    setPerForwardsData([]); setPerDefendersData([]);
                }
                // --- END PER Processing ---

            } catch (err) { // --- Existing Catch Block ---
                console.error("API error:", err); let errorMsg = err.message; if (err.response?.data?.error) { errorMsg = err.response.data.error; } setError(errorMsg);
                // Clear all state on error
                setCorsiData([]); setGoalsData([]); setForwardSynergyData([]); setDefenderSynergyData([]);
                setPerForwardsData([]); setPerDefendersData([]);
            } finally { // --- Existing Finally Block ---
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Keep existing dependency array
    // --- End Fetch Logic ---


    // --- Synergy Table Helper (Existing - Unchanged) ---
    const renderSynergyTable = (title, data) => { const tableData = data; return ( <Col md={6} className="mb-4"> <h4>{title}</h4> {tableData && tableData.length > 0 ? ( <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6' }}> <Table striped bordered hover responsive size="sm" className="mb-0"> <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}> <tr> <th>Rank</th> <th>Player Pair</th> <th>Synergy Score (G/60)</th> </tr> </thead> <tbody> {tableData.map((item, index) => { let pairDisplay = 'N/A'; if (Array.isArray(item.Pair) && item.Pair.length === 2) { pairDisplay = item.Pair.join(' - '); } else { pairDisplay = JSON.stringify(item.Pair); } const score = item['Rate Synergy Score (G60)']; const scoreDisplay = (score !== null && score !== undefined) ? score.toFixed(2) : 'N/A'; const rank = index + 1; return ( <tr key={`${pairDisplay}-${rank}`}> <td>{rank}</td> <td>{pairDisplay}</td> <td>{scoreDisplay}</td> </tr> ); })} </tbody> </Table> </div> ) : ( <Alert variant="info" size="sm">No synergy data available to display.</Alert> )} </Col> ); };
    // --- END Synergy Table Helper ---

    // --- Helper function to render PER table (Keep definition) ---
    const renderPerTable = (title, data) => {
        const tableData = data;
        const columnsToShow = ['Player', 'PER', 'Shirt number'];
        if (!tableData || tableData.length === 0) { return ( <Col md={6} className="mb-4"> <h4>{title}</h4> <Alert variant="info" size="sm">No PER data available to display.</Alert> </Col> ); }
        const availableKeys = Object.keys(tableData[0]);
        const displayKeys = columnsToShow.filter(key => availableKeys.includes(key));
        return ( <Col md={6} className="mb-4"> <h4>{title}</h4> <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6' }}> <Table striped bordered hover responsive size="sm" className="mb-0"> <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}> <tr> {displayKeys.map(key => <th key={`per-th-${title}-${key}`}>{key}</th>)} </tr> </thead> <tbody> {tableData.map((player, index) => ( <tr key={`per-tr-${title}-${player.Player || index}`}> {displayKeys.map(key => { const value = player[key]; const displayValue = key === 'PER' && typeof value === 'number' ? value.toFixed(3) : (value !== null && value !== undefined ? String(value) : ''); return <td key={`per-td-${title}-${player.Player || index}-${key}`}>{displayValue}</td>; })} </tr> ))} </tbody> </Table> </div> </Col> );
    };
    // --- END PER Helper ---


    // --- Loading / Error Render (Existing - Unchanged) ---
    if (loading) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Lineup, Synergy, and PER Data...</p> </Container> ); }
    if (error) { return ( <Container className="mt-5"> <Alert variant="danger">Error loading data: {error}</Alert> </Container> ); }

    // --- Combined Render ---
    return (
        <Container>
            {/* --- Existing Lines Section (Unchanged structure) --- */}
            <h1>Lineups</h1>
            {/* CORSI Table Section */}
             <Row className="mt-3"> <Col> <h2>CORSI Rankings</h2> {corsiData && corsiData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(corsiData[0]).map((key) => ( <th key={`corsi-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {corsiData.map((line, index) => ( <tr key={`corsi-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`corsi-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">CORSI ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* Goals Table Section */}
             <Row className="mt-3"> <Col> <h2>Goals Rankings</h2> {goalsData && goalsData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(goalsData[0]).map((key) => ( <th key={`goals-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {goalsData.map((line, index) => ( <tr key={`goals-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`goals-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">Goals ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* --- END Existing Lines Section --- */}


            {/* --- Synergy Scores Section (Existing - Unchanged) --- */}
            {!loading && !error && (
                <>
                    <h2 className="mt-5">Player Pair Synergy Scores</h2>
                    <p className="text-muted"> Based on Goals/60 Rate: (G/60 Together) - Average(G/60 Apart). </p>
                    <Row className="mt-3">
                        {renderSynergyTable(`Forward Pairs (All)`, forwardSynergyData)}
                        {renderSynergyTable(`Defender Pairs (All)`, defenderSynergyData)}
                    </Row>
                </>
            )}
             {/* --- END Synergy Scores Section --- */}


             {/* --- Player PER Section --- */}
             {/* Render this section only if loading is complete and no error occurred */}
             {!loading && !error && (
                <>
                    <h2 className="mt-5">Player PER Data</h2>
                     <Row className="mt-3">
                        {/* Call new helper to render PER tables */}
                        {renderPerTable(`Forwards (Sorted by PER)`, perForwardsData)}
                        {renderPerTable(`Defenders (Sorted by PER)`, perDefendersData)}
                    </Row>
                </>
            )}
             {/* --- END Player PER Section --- */}


        </Container>
    );
}

export default LinesQuery;
// --- END OF FILE LinesQuery.js ---

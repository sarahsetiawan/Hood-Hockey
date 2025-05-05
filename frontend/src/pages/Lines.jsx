// --- START OF FILE LinesQuery.js ---

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Keep axios as it was used
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function LinesQuery() {
    // --- State ---
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // REMOVED Synergy State
    // const [forwardSynergyData, setForwardSynergyData] = useState([]);
    // const [defenderSynergyData, setDefenderSynergyData] = useState([]);
    const [perForwardsData, setPerForwardsData] = useState([]); // Keep PER State
    const [perDefendersData, setPerDefendersData] = useState([]); // Keep PER State
    // --- End State ---


    useEffect(() => {
        // --- Fetch Logic ---
        console.log("useEffect running - fetching Lines and PER Data"); // Updated log
        const fetchData = async () => {
            setLoading(true); setError(null);
            // Reset states
            setCorsiData([]); setGoalsData([]);
            setPerForwardsData([]); setPerDefendersData([]);
            // REMOVED Synergy state resets
            try {
                // Fetch Lines and PER endpoints concurrently
                const [linesResponse, perResponse] = await Promise.all([ // Correctly destructure 2 results
                    axios.get(`${API_BASE_URL}/lines-rankings/`),
                    // REMOVED Synergy fetch call
                    axios.get(`${API_BASE_URL}/linesPER/`) // Fetch PER data endpoint
                ]);

                // --- Process Lines Rankings (Existing) ---
                console.log("Lines API response:", linesResponse.data);
                if (linesResponse.data && linesResponse.data.corsi && linesResponse.data.goals) {
                    setCorsiData(linesResponse.data.corsi); setGoalsData(linesResponse.data.goals);
                } else { console.warn("Lines rankings data structure unexpected:", linesResponse.data); setCorsiData([]); setGoalsData([]); }

                // REMOVED Synergy Scores Processing Block

                // --- Process PER Data (Existing) ---
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

            } catch (err) { // --- Catch Block ---
                console.error("API error:", err); let errorMsg = err.message; if (err.response?.data?.error) { errorMsg = err.response.data.error; } setError(errorMsg);
                // Clear remaining state on error
                setCorsiData([]); setGoalsData([]);
                // REMOVED Synergy state resets
                setPerForwardsData([]); setPerDefendersData([]);
            } finally { // --- Finally Block ---
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Keep empty dependency array
    // --- End Fetch Logic ---


    // --- REMOVED Synergy Table Helper ---
    // const renderSynergyTable = (...) => { ... };

    // --- Helper function to render PER table (Keep definition) ---
    const renderPerTable = (title, data) => {
        const tableData = data;
        const columnsToShow = ['Player', 'PER', 'Shirt number'];
        if (!tableData || tableData.length === 0) { return ( <Col md={6} className="mb-4"> <h4>{title}</h4> <Alert variant="info" size="sm">No PER data available to display.</Alert> </Col> ); }
        // Ensure tableData[0] exists before accessing keys
        const availableKeys = tableData[0] ? Object.keys(tableData[0]) : [];
        const displayKeys = columnsToShow.filter(key => availableKeys.includes(key));
        // Handle case where no displayable keys are found
        if (displayKeys.length === 0) { return ( <Col md={6} className="mb-4"> <h4>{title}</h4> <Alert variant="warning" size="sm">Required columns not found in PER data.</Alert> </Col> ); }

        return ( <Col md={6} className="mb-4"> <h4>{title}</h4> <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6' }}> <Table striped bordered hover responsive size="sm" className="mb-0"> <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}> <tr> {displayKeys.map(key => <th key={`per-th-${title}-${key}`}>{key}</th>)} </tr> </thead> <tbody> {tableData.map((player, index) => ( <tr key={`per-tr-${title}-${player.Player || index}`}> {displayKeys.map(key => { const value = player[key]; const displayValue = key === 'PER' && typeof value === 'number' ? value.toFixed(3) : (value !== null && value !== undefined ? String(value) : ''); return <td key={`per-td-${title}-${player.Player || index}-${key}`}>{displayValue}</td>; })} </tr> ))} </tbody> </Table> </div> </Col> );
    };
    // --- END PER Helper ---


    // --- Loading / Error Render ---
    if (loading) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Lineup and PER Data...</p> </Container> ); } // Updated text
    if (error) { return ( <Container className="mt-5"> <Alert variant="danger">Error loading data: {error}</Alert> </Container> ); }

    // --- Combined Render ---
    return (
        <Container>
            {/* --- Existing Lines Section --- */}
            <h1>Lineups</h1>
            {/* CORSI Table Section */}
             <Row className="mt-3"> <Col> <h2>CORSI Rankings</h2> {corsiData && corsiData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(corsiData[0]).map((key) => ( <th key={`corsi-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {corsiData.map((line, index) => ( <tr key={`corsi-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`corsi-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">CORSI ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* Goals Table Section */}
             <Row className="mt-3"> <Col> <h2>Goals Rankings</h2> {goalsData && goalsData.length > 0 ? ( <Table striped bordered hover responsive> <thead> <tr> {Object.keys(goalsData[0]).map((key) => ( <th key={`goals-th-${key}`}>{key}</th> ))} </tr> </thead> <tbody> {goalsData.map((line, index) => ( <tr key={`goals-tr-${index}`}> {Object.values(line).map((value, i) => ( <td key={`goals-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td> ))} </tr> ))} </tbody> </Table> ) : ( !loading && !error && <Alert variant="warning">Goals ranking data is unavailable.</Alert> )} </Col> </Row>
            {/* --- END Existing Lines Section --- */}


            {/* --- REMOVED Synergy Scores Section --- */}


             {/* --- Player PER Section --- */}
             {/* Render this section only if loading is complete and no error occurred */}
             {!loading && !error && (
                <>
                    <h2 className="mt-5">Player PER Data</h2>
                     <Row className="mt-3">
                        {/* Call helper to render PER tables */}
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

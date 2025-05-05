// --- START OF FILE LinesQuery.js ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Spinner, Alert, Button, Form } from 'react-bootstrap'; // Added 'Form'

// --- Base API URL ---
const API_BASE_URL = 'http://127.0.0.1:8000/hood_hockey_app';

function LinesQuery() {
    // --- State variables ---
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [loading, setLoading] = useState(true); // Initial page load
    const [error, setError] = useState(null); // Initial page load error
    const [perForwardsData, setPerForwardsData] = useState([]);
    const [perDefendersData, setPerDefendersData] = useState([]);
    const [optimalLineups, setOptimalLineups] = useState([]);
    const [isGeneratingLines, setIsGeneratingLines] = useState(false);
    const [generationError, setGenerationError] = useState(null);

    // --- New State for Situation Selection ---
    const [selectedSituation, setSelectedSituation] = useState('even_strength'); // Default situation
    const [calculatedSituation, setCalculatedSituation] = useState(null); // To display the situation calculated by the backend
    // --- End State ---

    // Define available situations for the dropdown
    const gameSituations = [
        { value: 'even_strength', label: 'Even Strength (3F/2D)' },
        { value: 'power_play', label: 'Power Play (4F/1D)' },
        { value: 'penalty_kill', label: 'Penalty Kill (2F/2D)' },
    ];


    // --- useEffect and Helper functions ---
    useEffect(() => {
        const fetchInitialData = async () => {
             setLoading(true); setError(null);
             setCorsiData([]); setGoalsData([]);
             setPerForwardsData([]); setPerDefendersData([]);
             setOptimalLineups([]); setGenerationError(null);
             setCalculatedSituation(null); // Reset calculated situation on initial load
             try {
                 const [linesResponse, perResponse] = await Promise.all([
                     axios.get(`${API_BASE_URL}/lines-rankings/`),
                     axios.get(`${API_BASE_URL}/linesPER/`) // GET for base PER
                 ]);
                 // Process Lines
                 if (linesResponse.data?.corsi && linesResponse.data?.goals) { setCorsiData(linesResponse.data.corsi); setGoalsData(linesResponse.data.goals); }
                 else { console.warn("Lines structure unexpected."); setCorsiData([]); setGoalsData([]); }
                 // Process PER
                 const perData = perResponse.data;
                 if (perData?.forwards && perData?.defenders) { const sortFn = (a, b) => (b.PER ?? -Infinity) - (a.PER ?? -Infinity); setPerForwardsData([...perData.forwards].sort(sortFn)); setPerDefendersData([...perData.defenders].sort(sortFn)); }
                 else { console.warn("Base PER structure unexpected."); setPerForwardsData([]); setPerDefendersData([]); }
             } catch (err) { console.error("Initial API error:", err); let errorMsg = err.message; if (err.response?.data?.error) { errorMsg = err.response.data.error; } setError(errorMsg); setCorsiData([]); setGoalsData([]); setPerForwardsData([]); setPerDefendersData([]); }
             finally { setLoading(false); }
        };
        fetchInitialData();
    }, []);

    // Note: renderPerTable helper is commented out in the provided code, so we won't include its body here.
    // const renderPerTable = (title, data) => { /* ... existing code ... */ };

    const handleGenerateCombinations = async () => {
        setIsGeneratingLines(true); setGenerationError(null); setOptimalLineups([]);
        setCalculatedSituation(null); // Clear previous calculated situation

        try {
            // Send the selected situation in the POST request body
            const response = await axios.post(`${API_BASE_URL}/linesPER/`, {
                game_situation: selectedSituation,
                // Optionally add top_n here if you want to allow users to change it
                // top_n: 100
            });

            if (response.data && Array.isArray(response.data.top_lineups)) {
                 setOptimalLineups(response.data.top_lineups);
                 setCalculatedSituation(response.data.situation_calculated || null); // Store the calculated situation from the API
                 if (response.data.top_lineups.length === 0) { setGenerationError("No valid lineups could be generated for this situation."); }
            } else { setGenerationError("Received unexpected data structure from lineup generation."); }

        } catch (err) {
            console.error("Generate Lineups API error:", err);
            let errorMsg = err.message;
            if (err.response?.data?.error) {
                 errorMsg = err.response.data.error;
            } else if (err.response) {
                 errorMsg = `Server Error (${err.response.status}): ${err.response.statusText}`;
            }
            setGenerationError(errorMsg);
            setOptimalLineups([]);
            setCalculatedSituation(null); // Ensure calculated situation is null on error
        }
        finally {
            setIsGeneratingLines(false);
        }
    };
    // --- End useEffect and Helpers ---


    // --- Loading / Error Render for INITIAL LOAD ---
    if (loading) { return ( <Container className="text-center mt-5"> <Spinner animation="border" role="status" /> <p>Loading Initial Data...</p> </Container> ); }
    if (error) { return ( <Container className="mt-5"> <Alert variant="danger">Error loading initial data: {error}</Alert> </Container> ); }

    // --- Main Render Logic ---
    // Only render content if initial load is complete AND had no errors
    return (
        <Container>
            <h1>Lineups</h1>

            {/* CORSI Table Section - Renders if initial load OK and corsiData has items */}
            <Row className="mt-3">
                <Col>
                    <h2>CORSI Rankings</h2>
                    {corsiData && corsiData.length > 0 ? (
                        <Table striped bordered hover responsive>
                           <thead><tr>{Object.keys(corsiData[0]).map((key) => (<th key={`corsi-th-${key}`}>{key}</th>))}</tr></thead>
                           <tbody>{corsiData.map((line, index) => (<tr key={`corsi-tr-${index}`}>{Object.values(line).map((value, i) => (<td key={`corsi-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td>))}</tr>))}</tbody>
                        </Table>
                    ) : (
                        // Only show unavailable if corsiData is empty AFTER loading finishes without error
                         <Alert variant="warning">CORSI ranking data is unavailable.</Alert>
                    )}
                </Col>
            </Row>

            {/* Goals Table Section - Renders if initial load OK and goalsData has items */}
            <Row className="mt-3">
                <Col>
                    <h2>Goals Rankings</h2>
                    {goalsData && goalsData.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead><tr>{Object.keys(goalsData[0]).map((key) => (<th key={`goals-th-${key}`}>{key}</th>))}</tr></thead>
                            <tbody>{goalsData.map((line, index) => (<tr key={`goals-tr-${index}`}>{Object.values(line).map((value, i) => (<td key={`goals-td-${index}-${i}`}>{value !== null && value !== undefined ? String(value) : ''}</td>))}</tr>))}</tbody>
                        </Table>
                     ) : (
                        // Only show unavailable if goalsData is empty AFTER loading finishes without error
                         <Alert variant="warning">Goals ranking data is unavailable.</Alert>
                     )}
                </Col>
            </Row>

             {/* Player PER Section (Commented Out) */}
             {/*
            <h2 className="mt-5">Player PER Data</h2>
             <Row className="mt-3">
                {renderPerTable(`Forwards (Sorted by PER)`, perForwardsData)}
                {renderPerTable(`Defenders (Sorted by PER)`, perDefendersData)}
            </Row>
             */}

            {/* --- Optimal Lineup Section --- */}
            <h2 className="mt-5">Optimal Lineup Combinations (by Summed Player PER)</h2>

            {/* Situation Selection Dropdown */}
            <Row className="mt-3 align-items-center">
                 <Col xs="auto">
                    <Form.Group controlId="gameSituationSelect">
                        <Form.Label className="me-2 mb-0">Select Game Situation:</Form.Label>
                        <Form.Select
                            value={selectedSituation}
                            onChange={(e) => setSelectedSituation(e.target.value)}
                            disabled={isGeneratingLines} // Disable while generating
                        >
                            {gameSituations.map((situation) => (
                                <option key={situation.value} value={situation.value}>
                                    {situation.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                 </Col>
                 <Col>
                    {/* Generate Button */}
                    <Button
                        variant="primary"
                        onClick={handleGenerateCombinations}
                        disabled={isGeneratingLines} // Disable button while generating
                    >
                        {isGeneratingLines ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Generate Combinations'}
                    </Button>
                 </Col>
            </Row>

            {/* Display Generation Results/Status */}
            {/* Show spinner ONLY while generating */}
            {isGeneratingLines && (
                 <div className="text-center mt-4"><Spinner animation="border" /> <p>Generating lineups...</p></div>
            )}
            {/* Show generation error if it occurred */}
            {generationError && (
                <Alert variant="danger" className="mt-4">Error generating lineups: {generationError}</Alert>
            )}
            {/* Show table ONLY if NOT generating, NO generation error, AND lineups exist */}
            {!isGeneratingLines && !generationError && optimalLineups.length > 0 && (
                 <Row className="mt-4">
                    <Col>
                        {/* Display the calculated situation */}
                        <h4>Top Lineups by Total Player PER {calculatedSituation ? `(${calculatedSituation.replace('_', ' ').toUpperCase()})` : ''}</h4>
                        <div style={{ maxHeight: '700px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                             <Table striped bordered hover responsive size="sm" className="mb-0">
                                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}>
                                <tr>
                                    <th>Rank</th>
                                    <th>Forwards</th>
                                    <th>Defenders</th>
                                    <th>Total PER Score</th>
                                </tr>
                                </thead>
                                <tbody>
                                {optimalLineups.map((lineup, index) => (
                                    <tr key={`opt-line-${index}`}>
                                        <td>{index + 1}</td>
                                        <td>{Array.isArray(lineup.Forwards) ? lineup.Forwards.join(', ') : 'N/A'}</td>
                                        <td>{Array.isArray(lineup.Defenders) ? lineup.Defenders.join(', ') : 'N/A'}</td>
                                        <td>{typeof lineup.Total_PER_Score === 'number' ? lineup.Total_PER_Score.toFixed(3) : 'N/A'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                 </Row>
            )}
             {/* --- END Optimal Lineup Section --- */}

        </Container>
    );
}

export default LinesQuery;
// --- END OF FILE LinesQuery.js ---

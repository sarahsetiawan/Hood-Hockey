import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Image, Spinner, Alert } from 'react-bootstrap';

function Goalies() {
    const [tableData, setTableData] = useState([]);
    const [savePercentImageData, setSavePercentImageData] = useState(null);
    const [savesPerGameImageData, setSavesPerGameImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch table data
                const tableResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/goalies-query/');
                if (!tableResponse.ok) throw new Error(`HTTP error! status: ${tableResponse.status}`);
                const tableJson = await tableResponse.json();
                setTableData(tableJson.goalies);

                // Fetch Save Percentage chart image data
                const savePercentChartResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/goalies-savepercent-barchart/');
                if (!savePercentChartResponse.ok) throw new Error(`HTTP error! status: ${savePercentChartResponse.status}`);
                const savePercentChartJson = await savePercentChartResponse.json();
                setSavePercentImageData(savePercentChartJson.image);

                // Fetch Saves Per Game chart image data
                const savesPerGameChartResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/saves-per-game/');
                if (!savesPerGameChartResponse.ok) throw new Error(`HTTP error! status: ${savesPerGameChartResponse.status}`);
                const savesPerGameChartJson = await savesPerGameChartResponse.json();
                setSavesPerGameImageData(savesPerGameChartJson.image);


                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
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

    if (!tableData || tableData.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">No Table Data</Alert>
            </Container>
        );
    }


    return (
        <Container>
            <h2>Goalies Data</h2>

            {/* Save Percentage Bar Chart */}
             <Row className="mt-3">
                <Col>
                    <h3>Save Percentage</h3>
                     {savePercentImageData ? (
                        <Image src={`data:image/png;base64,${savePercentImageData}`} alt="Save Percentage Chart" fluid />
                    ) : (
                        <Spinner animation="border" role="status" />
                    )}
                </Col>
            </Row>

            {/* Saves Per Game Bar Chart */}
            <Row className="mt-3">
                <Col>
                    <h3>Saves Per Game</h3>
                    {savesPerGameImageData ? (  // Conditional rendering for the new chart
                        <Image src={`data:image/png;base64,${savesPerGameImageData}`} alt="Saves Per Game Chart" fluid />
                    ) : (
                         <Spinner animation="border" role="status" />
                    )}
                </Col>
            </Row>


            {/* Table of All Stats */}
            <Row className="mt-3">
                <Col>
            <h3>All Stats</h3>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                         {Object.keys(tableData[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((goalie, index) => (
                        <tr key={index}>
                             {Object.values(goalie).map((value, cellIndex) => (
                                <td key={cellIndex}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
            </Col>
            </Row>
        </Container>
    );
}

export default Goalies;
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';

function Drive() {
    const [driveData, setDriveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDriveData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/hood_hockey_app/drive-query/');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDriveData(data.drive);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchDriveData();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading drive data...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Error loading drive data: {error}</Alert>
            </Container>
        );
    }

    if (!driveData || driveData.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">No drive data found.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Drive Data</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {Object.keys(driveData[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {driveData.map((drive, index) => (
                        <tr key={index}>
                            {Object.values(drive).map((value, cellIndex) => (
                                <td key={cellIndex}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default Drive;
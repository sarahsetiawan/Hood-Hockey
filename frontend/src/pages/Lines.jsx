import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LinesQuery() {
    const [linesData, setLinesData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("useEffect running");
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/hood_hockey_app/lines-rankings/');
                console.log("API response:", response.data);
                setLinesData(response.data);
            } catch (err) {
                console.error("API error:", err);
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            {linesData.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            {Object.keys(linesData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {linesData.map((line, index) => (
                            <tr key={index}>
                                {Object.values(line).map((value, i) => (
                                    <td key={i}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

export default LinesQuery;
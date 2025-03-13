import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LinesQuery() {
    const [corsiData, setCorsiData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("useEffect running");
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/hood_hockey_app/lines-rankings/');
                console.log("API response:", response.data);
                setCorsiData(response.data.corsi);
                setGoalsData(response.data.goals);
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
        <div>
            {/* CORSI Table */}
            {corsiData.length > 0 && (
                <div>
                    <h2>CORSI Rankings</h2>
                    <table>
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
                    </table>
                </div>
            )}

            {/* Goals Table */}
            {goalsData.length > 0 && (
                <div>
                    <h2>Goals Rankings</h2>
                    <table>
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
                    </table>
                </div>
            )}
        </div>
    );
}

export default LinesQuery;

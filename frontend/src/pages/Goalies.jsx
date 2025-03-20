import React, { useState, useEffect } from 'react';

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!tableData || tableData.length === 0) return (<div>No Table Data</div>)


    return (
        <div>
            <h2>Goalies Data</h2>

            {/* Save Percentage Bar Chart */}
            <h3>Save Percentage</h3>
            {savePercentImageData ? (
                <img src={`data:image/png;base64,${savePercentImageData}`} alt="Save Percentage Chart" style={{ width: '100%', maxWidth: '800px' }} />
            ) : (
                <div>Loading Save Percentage chart...</div>
            )}

            {/* Saves Per Game Bar Chart */}
            <h3>Saves Per Game</h3>
            {savesPerGameImageData ? (  // Conditional rendering for the new chart
                <img src={`data:image/png;base64,${savesPerGameImageData}`} alt="Saves Per Game Chart" style={{ width: '100%', maxWidth: '800px' }} />
            ) : (
                <div>Loading Saves Per Game chart...</div>
            )}

            {/* Table of All Stats */}
            <h3>All Stats</h3>
            <table>
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
            </table>
        </div>
    );
}

export default Goalies;
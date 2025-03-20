import React, { useState, useEffect } from 'react';

function Goalies() {
    const [tableData, setTableData] = useState([]);
    const [imageData, setImageData] = useState(null); // State for the image
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch table data
                const tableResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/goalies-query/'); 
                if (!tableResponse.ok) {
                    throw new Error(`HTTP error! status: ${tableResponse.status}`);
                }
                const tableJson = await tableResponse.json();
                setTableData(tableJson.goalies);

                // Fetch chart image data
                const chartResponse = await fetch('http://127.0.0.1:8000/hood_hockey_app/goalies-savepercent-barchart/'); 
                if (!chartResponse.ok) {
                    throw new Error(`HTTP error! status: ${chartResponse.status}`);
                }
                const chartJson = await chartResponse.json();
                setImageData(chartJson.image); // Set the image data

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

    //Handle no data
    if (!tableData || tableData.length === 0) return (<div>No Table Data</div>)

    return (
        <div>
            <h2>Goalies Data</h2>

            {/* Bar Chart (Image) */}
             {imageData ? (
                <img src={`data:image/png;base64,${imageData}`} alt="Save Percentage Chart" style={{ width: '100%', maxWidth: '800px' }}/>
                ) : (
                <div>Loading chart...</div>
                )}
            <br />
            {/* Table of All Stats */}
            <h3>All Stats</h3>
            <table>
                <thead>
                    <tr>
                        {/* Dynamically generate headers */}
                        {Object.keys(tableData[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Dynamically generate rows and cells */}
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
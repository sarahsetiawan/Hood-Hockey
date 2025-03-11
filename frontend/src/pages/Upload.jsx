import { useState, useEffect } from "react";
import api from "../api";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // -------------------------------
    // File upload consts
    // -------------------------------
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadSkatersFile = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        api.post("hood_hockey_app/skaters-upload-file/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                alert("File uploaded successfully!");
                console.log(response.data);
            })
            .catch((error) => {
                alert("File upload failed.");
                console.error(error);
            });
    };

    const uploadGamesFile = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        api.post("hood_hockey_app/games-upload-file/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                alert("File uploaded successfully!");
                console.log(response.data);
            })
            .catch((error) => {
                alert("File upload failed.");
                console.error(error);
            });
    };

    const uploadGoaliesFile = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        api.post("hood_hockey_app/goalies-upload-file/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                alert("File uploaded successfully!");
                console.log(response.data);
            })
            .catch((error) => {
                alert("File upload failed.");
                console.error(error);
            });
    };

    const uploadLinesFile = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        api.post("hood_hockey_app/lines-upload-file/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                alert("File uploaded successfully!");
                console.log(response.data);
            })
            .catch((error) => {
                alert("File upload failed.");
                console.error(error);
            });
    };

    const uploadDriveFile = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        api.post("hood_hockey_app/drive-upload-file/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                alert("File uploaded successfully!");
                console.log(response.data);
            })
            .catch((error) => {
                alert("File upload failed.");
                console.error(error);
            });
    };

    
    return (
        <div>
            <form>
                <h1>Instat Data</h1>
                <h2>Skaters</h2>
                <label>
                    Enter a File (.xlsx):
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadSkatersFile}>Upload File</button>
                <br />
                <h2>Goalies</h2>
                <label>
                    Enter a File (.xlsx):
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadGoaliesFile}>Upload File</button>
                <br />
                <h2>Games</h2>
                <label>
                    Enter a File (.xlsx):
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadGamesFile}>Upload File</button>
                <br />
                <h2>Lines</h2>
                <label>
                    Enter a File (.xlsx):
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadLinesFile}>Upload File</button>
                <br />
                <h2>Drive</h2>
                <label>
                    Enter a File (.json):
                    <input type="file" accept=".json" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadDriveFile}>Upload File</button>
            </form>
        </div>
    );
};

export default Upload;
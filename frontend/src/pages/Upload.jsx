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
    const uploadFile = () => {
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
    
    return (
        <div>
            <form>
            <label>
                Enter a File (.xlsx):
                <input type="file" accept=".xlsx" onChange={handleFileChange} />
            </label>
            <button type="button" onClick={uploadFile}>Upload File</button>
            </form>
        </div>
    );
};

export default Upload;
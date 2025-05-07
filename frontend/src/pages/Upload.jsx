import React, { useState } from "react";
import api from "../api";
import { Container, Form, FormGroup, FormLabel, FormControl, Button, Alert, Spinner } from 'react-bootstrap';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
    const [uploadError, setUploadError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setUploadStatus(null); // Reset status on new file selection
        setUploadError(null);
    };

    const uploadFile = async (endpoint, fileType) => {
        if (!file) {
            setUploadError("Please select a file first.");
            setUploadStatus('error');
            return;
        }

        setLoading(true);
        setUploadStatus(null); // Reset status on upload attempt
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadStatus('success');
            console.log(response.data);
        } catch (error) {
            setUploadStatus('error');
            setUploadError(`File upload failed: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const uploadSkatersFile = () => uploadFile("hood_hockey_app/skaters-upload-file/", "Skaters");
    const uploadGamesFile = () => uploadFile("hood_hockey_app/games-upload-file/", "Games");
    const uploadGoaliesFile = () => uploadFile("hood_hockey_app/goalies-upload-file/", "Goalies");
    const uploadLinesFile = () => uploadFile("hood_hockey_app/lines-upload-file/", "Lines");
    const uploadDriveFile = () => uploadFile("hood_hockey_app/drive-upload-file/", "Drive");


    return (
        <Container className="mt-4">
            <h1>Upload Instat Data</h1>
            {uploadStatus === 'success' && <Alert variant="success">File uploaded successfully!</Alert>}
            {uploadStatus === 'error' && <Alert variant="danger">{uploadError}</Alert>}

            <Form>
                <h2 className="mt-3">Skaters</h2>
                <FormGroup className="mb-3">
                    <FormLabel><strong>Skaters File (.xlsx)</strong></FormLabel>
                    <FormControl type="file" accept=".xlsx" onChange={handleFileChange} />
                    <Button variant="primary" type="button" onClick={uploadSkatersFile} disabled={loading} className="mt-2">
                        {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                        Upload Skaters File
                    </Button>
                </FormGroup>

                <h2 className="mt-3">Goalies</h2>
                <FormGroup className="mb-3">
                    <FormLabel><strong>Goalies File (.xlsx)</strong></FormLabel>
                    <FormControl type="file" accept=".xlsx" onChange={handleFileChange} />
                    <Button variant="primary" type="button" onClick={uploadGoaliesFile} disabled={loading} className="mt-2">
                        {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                        Upload Goalies File
                    </Button>
                </FormGroup>

                <h2 className="mt-3">Games</h2>
                <FormGroup className="mb-3">
                    <FormLabel><strong>Games File (.xlsx)</strong></FormLabel>
                    <FormControl type="file" accept=".xlsx" onChange={handleFileChange} />
                    <Button variant="primary" type="button" onClick={uploadGamesFile} disabled={loading} className="mt-2">
                        {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                        Upload Games File
                    </Button>
                </FormGroup>

                <h2 className="mt-3">Lines</h2>
                <FormGroup className="mb-3">
                    <FormLabel><strong>Lines File (.xlsx)</strong></FormLabel>
                    <FormControl type="file" accept=".xlsx" onChange={handleFileChange} />
                    <Button variant="primary" type="button" onClick={uploadLinesFile} disabled={loading} className="mt-2">
                        {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                        Upload Lines File
                    </Button>
                </FormGroup>

                <h2 className="mt-3">Drive</h2>
                <FormGroup className="mb-3">
                    <FormLabel><strong>Drive File (.json)</strong></FormLabel>
                    <FormControl type="file" accept=".json" onChange={handleFileChange} />
                    <Button variant="primary" type="button" onClick={uploadDriveFile} disabled={loading} className="mt-2">
                        {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                        Upload Drive File
                    </Button>
                </FormGroup>
            </Form>
        </Container>
    );
};

export default Upload;
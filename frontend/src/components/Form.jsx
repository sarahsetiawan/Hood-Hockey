import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';

function FormComponent({ route, method, onLogin }) { // onLogin is now the context's login function
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                onLogin(); // Call the login function from AuthContext
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || "An error occurred.");
            console.error("Form submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h2 className="text-center mb-4">{name}</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading && <Spinner animation="border" size="sm" as="span" className="me-2" />}
                    {name}
                </Button>
            </Form>
        </Container>
    );
}

export default FormComponent;
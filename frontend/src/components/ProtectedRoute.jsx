import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { Container, Spinner } from 'react-bootstrap';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().then(setIsAuthorized).catch(() => setIsAuthorized(false)); // Simplified useEffect
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/hood_hockey_app/token/refresh/", {
                refresh: refreshToken,
            });
            return res.status === 200; // Directly return boolean
        } catch (error) {
            console.error("ProtectedRoute: refreshToken - API error:", error);
            return false;
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            return false;
        }
        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            return !(tokenExpiration < now) || await refreshToken(); // Directly return boolean
        } catch (error) {
            console.error("ProtectedRoute: auth - jwtDecode error:", error);
            return false;
        }
    };

    if (isAuthorized === null) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
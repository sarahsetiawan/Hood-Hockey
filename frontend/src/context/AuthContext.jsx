import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Container, Spinner } from 'react-bootstrap'; // ADD THIS LINE: Import Container and Spinner
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true); // Add loading state

    const checkAuthStatus = useCallback(async () => { // Use useCallback
        setLoadingAuth(true);
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                const refreshed = await refreshToken(); // Call refreshToken
                setIsAuthenticated(refreshed); // Set auth based on refresh result
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("AuthContext: Authentication check error:", error);
            setIsAuthenticated(false);
        } finally {
            setLoadingAuth(false);
        }
    }, []); // No dependencies - useCallback is now correct

    const refreshToken = async () => {
        const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshTokenValue) {
            return false;
        }
        try {
            const res = await api.post("/hood_hockey_app/token/refresh/", { refresh: refreshTokenValue });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error("AuthContext: Token refresh error:", error);
            return false;
        }
    };


    const login = useCallback(() => { // Use useCallback
        checkAuthStatus(); // Re-run auth check after login
    }, [checkAuthStatus]); // Dependency on checkAuthStatus

    const logout = useCallback(() => { // Use useCallback
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        checkAuthStatus(); // Initial auth check on provider mount
    }, [checkAuthStatus]); // Dependency on checkAuthStatus


    const value = {
        isAuthenticated,
        login,
        logout,
        loadingAuth // Expose loading state
    };

    if (loadingAuth) { // Render loading indicator while checking auth
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading authentication status...</span>
                </Spinner>
            </Container>
        );
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };
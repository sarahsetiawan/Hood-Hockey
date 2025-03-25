import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Navbar, Nav, Container } from 'react-bootstrap'; // Import Bootstrap components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Games from "./pages/Games";
import Test from "./pages/test";
import Upload from "./pages/Upload";
import LinesQuery from "./pages/Lines";
import Skaters from "./pages/Skaters";
import Goalies from "./pages/Goalies";
import Drive from "./pages/Drive";

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}


function App() {
    return (
        <BrowserRouter>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">Hood Hockey Analytics</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            <Nav.Link as={Link} to="/games">Games</Nav.Link>
                            <Nav.Link as={Link} to="/skaters">Skaters</Nav.Link>
                            <Nav.Link as={Link} to="/goalies">Goalies</Nav.Link>
                            <Nav.Link as={Link} to="/lines">Lines</Nav.Link>
                            {/* Add more links as needed */}
                        </Nav>
                        <Nav>
                            {/* Conditionally render Login/Logout based on authentication */}
                            {localStorage.getItem('accessToken') ? ( // Or your preferred token key
                                <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
                            ) : (
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/games" element={<Games />} />
                <Route path="/test" element={<Test />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/lines" element={<LinesQuery />} />
                <Route path="/skaters" element={<Skaters />} />
                <Route path="/goalies" element={<Goalies />} />
                <Route path="/drive" element={<Drive />} />
                <Route path="*" element={<NotFound />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
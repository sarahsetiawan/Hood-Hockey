import React, { useContext } from "react"; // Import useContext
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Navbar, Nav, Container } from 'react-bootstrap';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Games from "./pages/Games";
import Upload from "./pages/Upload";
import LinesQuery from "./pages/Lines";
import Skaters from "./pages/Skaters";
import Goalies from "./pages/Goalies";
import Drive from "./pages/Drive";
import { AuthContext } from './context/AuthContext'; // Import AuthContext

function Logout() {
    const { logout } = useContext(AuthContext); // Get logout from context
    logout(); // Call logout function from context
    return <Navigate to="/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}

function App() {
    const { isAuthenticated } = useContext(AuthContext); // Consume AuthContext

    return (
        <BrowserRouter>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">Hood Hockey Analytics</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            {isAuthenticated && (<>
                                <Nav.Link as={Link} to="/games">Games</Nav.Link>
                                <Nav.Link as={Link} to="/skaters">Skaters</Nav.Link>
                                <Nav.Link as={Link} to="/goalies">Goalies</Nav.Link>
                                <Nav.Link as={Link} to="/lines">Lines</Nav.Link>
                                <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
                                <Nav.Link as={Link} to="/drive">Drive</Nav.Link>
                            </>)}
                        </Nav>
                        <Nav>
                            {isAuthenticated ? (
                                <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/register" element={<RegisterAndLogout />} />
                    <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
                    <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                    <Route path="/lines" element={<ProtectedRoute><LinesQuery /></ProtectedRoute>} />
                    <Route path="/skaters" element={<ProtectedRoute><Skaters /></ProtectedRoute>} />
                    <Route path="/goalies" element={<ProtectedRoute><Goalies /></ProtectedRoute>} />
                    <Route path="/drive" element={<ProtectedRoute><Drive /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
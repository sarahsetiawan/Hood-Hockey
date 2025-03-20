import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Games from "./pages/Games"
import Test from "./pages/test"
import Upload from "./pages/Upload"
import LinesQuery from "./pages/Lines"
import Skaters from "./pages/Skaters"
import Goalies from "./pages/Goalies"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function GamesPage() { // Rename to GamesPage
  return <Games />; // Render the Game component
}

function App() {
  return (
    <BrowserRouter>
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
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
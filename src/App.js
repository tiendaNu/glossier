import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import Footer from "./components/Footer"; // Importación del Footer
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Productos from "./pages/Productos";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css"; // Nuevo CSS para el fondo

function App() {
  return (
    <Router>
      <div className="app-container">
        <AppNavbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Productos />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Footer /> {/* Footer agregado aquí */}
      </div>
    </Router>
  );
}

export default App;

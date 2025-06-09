import React, { useState } from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion"; // ajustá la ruta si hace falta
import logo from "../assets/logo.png"; // ajustá la ruta según tu estructura


function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsOpen(false); // Cerrar el menú al hacer logout
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const detalleColor = "#F7A8B8";

  return (
    <Navbar
      variant="dark"
      expand="md"
      className="px-5"
      style={{ backgroundColor: "#000000" }}
      expanded={isOpen}
    >
      <Navbar.Brand
        as={Link}
        to="/"
        onClick={handleLinkClick}
        style={{ color: detalleColor, fontWeight: "bold" }}
      >
        <img src={logo} alt="Logo de Glossier" height={60} />
      </Navbar.Brand>

      <Navbar.Toggle
        aria-controls="responsive-navbar-nav"
        onClick={handleToggle}
        style={{ borderColor: detalleColor }}
      />

      <Navbar.Collapse
        id="responsive-navbar-nav"
        className="justify-content-end"
      >
        <Nav className="align-items-center ms-auto gap-2">
          {user ? (
            <>
              <Nav.Link as={Link} to="/admin" onClick={handleLinkClick}>
                <Button
                  variant="outline-light"
                  style={{ borderColor: detalleColor, color: detalleColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = detalleColor;
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = detalleColor;
                  }}
                >
                  Admin
                </Button>
              </Nav.Link>
              <Button
                variant="outline-light"
                onClick={handleLogout}
                style={{ borderColor: detalleColor, color: detalleColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = detalleColor;
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = detalleColor;
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Nav.Link as={Link} to="/login" onClick={handleLinkClick}>
              <Button
                variant="outline-light"
                style={{ borderColor: detalleColor, color: detalleColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = detalleColor;
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = detalleColor;
                }}
              >
                Login
              </Button>
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar;

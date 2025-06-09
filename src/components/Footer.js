import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="text-center py-3">
        <p className="footer-text mb-1">
          &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </p>
        <Link
          to="https://www.instagram.com/fran.andrade.e/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <i className="bi bi-instagram me-2"></i>
          Desarrollado por Francisco Andrade
        </Link>
      </div>
    </div>
  );
};

export default Footer;

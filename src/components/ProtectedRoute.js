import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Cargando...</div>;

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

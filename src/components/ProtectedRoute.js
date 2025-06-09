import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

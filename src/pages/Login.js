import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion";
import { Container, Form, Alert } from "react-bootstrap";
import "./Login.css"; // Asegúrate de importar el CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError("Credenciales incorrectas o error en el inicio de sesión.");
      console.error(err);
    }
  };

  return (
    <Container fluid className="login-container">
      <div className="login-card">
        <h2 className="text-center mb-4">Iniciar sesión</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Control
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <button type="submit" className="w-100 buttonFilters">
            Iniciar sesión
          </button>
        </Form>
      </div>
    </Container>
  );
};

export default Login;

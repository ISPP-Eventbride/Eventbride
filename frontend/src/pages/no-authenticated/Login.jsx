/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { getCurrentUser } from "../../utils/api";
import apiClient from "../../apiClient";
import '../../static/resources/css/Login.css'

// eslint-disable-next-line react/prop-types
function Login({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/users/auth/login", form);
      const token = response.data.token;
      const data = await getCurrentUser({ token });
      const updated = await fetch(`/api/users/planExpired`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const user = await updated.json();


      setUser(user);
      window.localStorage.setItem("user", JSON.stringify(data.user));
      window.localStorage.setItem("jwt", response.data.token);
      window.location.href = "/";
    } catch (err) {
      setError("Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-layout">
      <div className="login-side">
        <div className="login-card">
          <div className="login-header">
            <h1>Bienvenido</h1>
            <p>Inicia sesión para continuar</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username"> Usuario <span className="asterisk">*</span> </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Ingresa tu nombre de usuario"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña <span className="asterisk">*</span> </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Iniciar sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
          </div>
        </div>
      </div>

      <div className="collage-side">
        <div className="photo-collage">
          <div className="collage-item item-1">
            <div className="collage-label">Bodas</div>
          </div>
          <div className="collage-item item-2">
            <div className="collage-label">Bautizos</div>
          </div>
          <div className="collage-item item-3">
            <div className="collage-label">Comuniones</div>
          </div>
          <div className="collage-item item-4"></div>
          <div className="collage-item item-5"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;

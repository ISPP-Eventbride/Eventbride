"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import apiClient from "../../apiClient"
import "../../static/resources/css/Register.css"

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    telephone: "",
    password: "",
    dni: "",
    role: "CLIENT",
    profilePicture: "",
    receivesEmails: false,
  })

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.firstName.length > 40) {
      setError("El nombre no puede tener más de 40 caracteres.")
      return
    }

    if (form.lastName.length > 40) {
      setError("El apellido no puede tener más de 40 caracteres.")
      return
    }

    if (form.username.length > 50) {
      setError("El nombre de usuario no puede tener más de 50 caracteres.")
      return
    }

    const dniPattern = /^[0-9]{8}[A-Za-z]$/
    if (!dniPattern.test(form.dni)) {
      setError("El DNI es incorrecto.")
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email)) {
      setError("El correo electrónico no es válido")
      return
    }

    const telephonePattern = /^[0-9]{9}$/
    if (!telephonePattern.test(form.telephone)) {
      setError("El teléfono debe tener 9 numeros.")
      return
    }

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones para continuar.")
      return
    }

    setIsLoading(true)

    const role = form.role === "proveedor" ? "SUPPLIER" : "CLIENT"

    try {
      const response = await apiClient.post("/api/users/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        telephone: Number(form.telephone),
        dni: form.dni,
        password: form.password,
        role: role,
        receivesEmails: Boolean(form.receivesEmails),
        profilePicture: form.profilePicture?.trim() === "" ? null : form.profilePicture,
      })

      if (response.data.error) {
        setError("Error: " + response.data.error)
        return
      }

      window.location.href = "/login"
    } catch (error) {
      console.error("Error en el registro:", error.response?.data || error.message)
      setError("Error al registrarse. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="split-layout register-layout">
      <div className="login-side">
        <div className="login-card register-card">
          <div className="login-header">
            <h1>Crear cuenta</h1>
            <p>Completa el formulario para registrarte</p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre <span className="asterisk">*</span> </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido <span className="asterisk">*</span> </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Tu apellido"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de usuario <span className="asterisk">*</span> </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Elige un nombre de usuario"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profilePicture">URL de foto de perfil</label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="profilePicture"
                  name="profilePicture"
                  placeholder="https://foto.de/perfil"
                  value={form.profilePicture}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico <span className="asterisk">*</span> </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telephone">Teléfono <span className="asterisk">*</span> </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    placeholder="Tu número de teléfono"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dni">DNI <span className="asterisk">*</span> </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    placeholder="Tu DNI"
                    value={form.dni}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña <span className="asterisk">*</span> </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Crea una contraseña segura"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Tipo de usuario <span className="asterisk">*</span> </label>
              <div className="select-wrapper">
                <select id="role" name="role" value={form.role} onChange={handleChange} required>
                  <option value="">Selecciona tu rol</option>
                  <option value="cliente">Cliente</option>
                  <option value="proveedor">Proveedor</option>
                </select>
              </div>
            </div>

            <div className="form-group terms-checkbox-container">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="receivesEmails"
                  name="receivesEmails"
                  checked={form.receivesEmails}
                  onChange={handleChange}
                />
                <label htmlFor="receivesEmails" className="terms-label">
                  Deseo recibir notificaciones y novedades
                </label>
              </div>
            </div>

            <div className="form-group terms-checkbox-container">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="termsAccept"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <label htmlFor="termsAccept" className="terms-label">
                  <a href="/terminos-y-condiciones">Acepto los Términos y Condiciones de Eventbride</a>
                </label>
              </div>
            </div>

            <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <span>Crear cuenta</span>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
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
  )
}

export default Register

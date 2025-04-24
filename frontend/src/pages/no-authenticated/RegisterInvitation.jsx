/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../apiClient";
import '../../static/resources/css/RegisterInvitation.css'

const Register = () => {
  const { invitationId } = useParams();
  const [jwtToken] = useState(localStorage.getItem("jwt"));

  const [form, setForm] = useState({
    id: invitationId,
    firstName: "",
    lastName: "",
    numberOfGuests: "",
    telephone: "",
  });

  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/invitation/${invitationId}`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setInvitation(data);
      })
      .catch((error) =>
        console.error("Error obteniendo las invitaciones de este evento:", error)
      );
  }, [error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/invitation", {
        method: "PUT", // Usamos PUT para actualizar los datos de la invitación
        headers: {
          "Content-Type": "application/json", // Especificamos que los datos se envían en formato JSON
        },
        body: JSON.stringify({
          id: invitationId,
          maxGuests: invitation.maxGuests,
          firstName: form.firstName,
          lastName: form.lastName,
          numberOfGuests: form.numberOfGuests,
          telephone: form.telephone,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        setError("Error: " + data?.error);
        return;
      }
      setSuccess(true);
      navigate(`/invitaciones/confirmar/${invitationId}`);
    } catch (error) {
      console.error("Error en el registro:", error.response?.data || error.message);
      setError("Error al registrarse. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Invitación</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="Nombre"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            min="1"
            max={invitation?.maxGuests}
            step="1"
            name="numberOfGuests"
            placeholder={`Nº Acompañantes (Máximo ${invitation?.maxGuests})`}
            value={form.numberOfGuests}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telephone"
            placeholder="Teléfono"
            value={form.telephone}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={success}>
            {success ? "Invitación Aceptada" : "Aceptar Invitación"}
          </button>
        </form>
      </div>
    </div>
  );


};

export default Register;

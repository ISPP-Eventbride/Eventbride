"use client"

import { useState } from "react"
import { Calendar, Users, PartyPopper, Church } from "lucide-react"

import { useNavigate } from "react-router-dom"
import "../../static/resources/css/CreateEvents.css"

const EVENT_TYPES = {
  WEDDING: "Boda",
  CHRISTENING: "Bautizo",
  COMMUNION: "Comunión",
}

function CreateEvents() {
  const currentUser = JSON.parse(localStorage.getItem("user"))
  const [jwtToken] = useState(localStorage.getItem("jwt"));
  const [eventType, setEventType] = useState("")
  const [guests, setGuests] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const user = currentUser
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Simple validation
    if (!eventType || !guests || !eventDate || name === "") {
      setError("Por favor completa todos los campos")
      return
    }

    // Additional validation for guests
    const minGuests = 1
    const maxGuests = 9999
    if (guests < minGuests || guests > maxGuests) {
      setError(`El número de invitados debe estar entre ${minGuests} y ${maxGuests}`)
      return
    }

    // Additional validation for name
    if (name.length > 50) {
      setError(`El nombre del evento no puede superar los 50 caracteres`)
      return
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(eventDate);

    // Calcula la diferencia en días
    const minDaysDifference = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));

    console.log("Diferencia en días:", minDaysDifference);

    if (eventType === "CHRISTENING" && minDaysDifference < 30) {
      setError("Para un bautizo, la fecha de creación debe ser al menos 1 mes desde de hoy");
      return;
    } else if (eventType === "COMMUNION" && minDaysDifference < 90) {
      setError("Para una comunión, la fecha de creación debe ser al menos 3 meses desde de hoy");
      return;
    } else if (eventType === "WEDDING" && minDaysDifference < 120) {
      setError("Para una boda, la fecha de creación debe ser al menos 4 meses desde de hoy");
      return;
    }
    // }


    const newEvent = {
      eventType,
      guests,
      eventDate,
      name,
      user,
    }

    setIsSubmitting(true)

    try {
      await fetch(`/api/v1/events/create`, {
        method: "POST", // Usamos POST para crear un nuevo evento
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Content-Type": "application/json", // Asegúrate de que el contenido es JSON
        },
        body: JSON.stringify(newEvent), // Se envían los datos en el cuerpo de la solicitud
      });

      navigate("/events")
    } catch (error) {
      setError("Error al crear el evento")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="event-container">
      <div className="event-card">
      <div className="event-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PartyPopper className="event-icon" />
          <h2 style={{ margin: 0 }}>Crear Evento</h2>
        </div>
        <p className="event-subtitle">Completa el formulario para crear tu nuevo evento</p>
      </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="name">
              <Church size={18} className="input-icon" />
              Nombre <span className="asterisk">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={
                !eventType
                  ? "Ej: Nombre del evento"
                  : eventType === "WEDDING"
                    ? "Ej: Boda de Roberto y Lucía"
                    : eventType === "CHRISTENING"
                      ? "Ej: Bautizo de Pedro"
                      : eventType === "COMMUNION"
                        ? "Ej: Comunión de Juan"
                        : "Ej: Nombre del evento"
              }
              className="form-input"
            />

          </div>

          <div className="form-group">
            <label htmlFor="eventType">
              <PartyPopper size={18} className="input-icon" />
              Tipo de evento <span className="asterisk">*</span>
            </label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
              className="form-select"
            >
              <option value="" disabled>
                Selecciona un tipo de evento
              </option>
              {Object.entries(EVENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="guests">
              <Users size={18} className="input-icon" />
              Número de invitados estimado <span className="asterisk">*</span>
            </label>
            <input
              type="number"
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
              placeholder="Ej: 100"
              min="1"
              max="9999"
              className="form-input"
            />
          </div>


          <div className="form-group">
            <label htmlFor="eventDate">
              <Calendar size={18} className="input-icon" />
              Fecha del evento <span className="asterisk">*</span>
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="form-input"
              min={new Date().toISOString().split("T")[0]}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString().split("T")[0]}
            />
          </div>


          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Creando evento..." : "Crear evento"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEvents


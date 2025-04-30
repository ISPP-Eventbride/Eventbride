import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../static/resources/css/AdminUsers.css";

function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [editEventId, setEditEventId] = useState(null);
  const [eventData, setEventData] = useState({});
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const listToShow = filteredEvents.length > 0 ? filteredEvents : events;
  const totalPages = Math.ceil(listToShow.length / itemsPerPage);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [jwtToken] = useState(localStorage.getItem("jwt"));

  const eventTypeMap = {
    WEDDING: "Boda",
    CHRISTENING: "Bautizo",
    COMMUNION: "Comunión",
  };

  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [totalPages]);

  function getEvents() {
    fetch("/api/v1/events/DTO", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text); // Captura errores tipo 500 con mensaje plano
        }
        return res.json();
      })
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => {
        console.error("Error obteniendo eventos:", err.message);
        setError("Error al cargar eventos: " + err.message);
      });
  }

  function startEditing(event) {
    setEditEventId(event.id);
    setEventData((prev) => ({ ...prev, [event.id]: { ...event } }));
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [editEventId]: {
        ...prev[editEventId],
        [name]: value,
      },
    }));
  }

  function validateEventData(event) {
    setError("");

    const data = eventData[event.id];
    if (!data.eventType || !data.guests || !data.eventDate) {
      setError("Por favor, complete todos los campos obligatorios.");
      return false;
    }
    if (data.guests <= 0) {
      setError("El número de invitados debe ser mayor que cero.");
      return false;
    }
    const date = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(date.getTime()) || date < today) {
      setError("La fecha del evento no puede estar en el pasado.");
      return false;
    }
    const fourMonthsLater = new Date(today);
    fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);

    if (date < fourMonthsLater) {
      setError("La fecha del evento debe ser al menos dentro de 4 meses.");
      return false;
    }

    return true;
  }

  function updateEvent(event) {
    if (!validateEventData(event)) return;

    const rawData = eventData[event.id];

    const formattedDate = rawData.eventDate.includes("T")
      ? rawData.eventDate.split("T")[0]
      : rawData.eventDate;

    const cleanedProperties = (rawData.eventPropertiesDTO || []).map(prop => {
      const fullStartTime = prop.startTime?.includes("T")
        ? prop.startTime
        : `${formattedDate}T${prop.startTime || "00:00:00"}`;

      return {
        ...prop,
        startTime: fullStartTime
      };
    });

    const evento = {
      ...rawData,
      eventDate: `${formattedDate}T00:00:00`,
      eventProperties: cleanedProperties
    };

    delete evento.eventPropertiesDTO;

    console.log("Payload enviado:", evento);

    fetch(`/api/v1/events/${event.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(evento),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }
        return res.json();
      })
      .then((updated) => {
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setEditEventId(null);
        setError("");
      })
      .catch((err) => {
        console.error("Error al actualizar el evento:", err.message);
        setError(err.message || "Error inesperado");
      });
  }

  function searchEventById() {
    if (!searchId.trim()) {
      setFilteredEvents([]);
      return;
    }
    const foundEvent = events.find((event) => String(event.id) === searchId.trim());
    if (foundEvent) {
      setFilteredEvents([foundEvent]);
      setError("");
    } else {
      setFilteredEvents([]);
      setError("No se encontró ningún evento con ese ID.");
    }
  }

  const startIndex = page * itemsPerPage;
  const currentEvents = listToShow.slice(startIndex, startIndex + itemsPerPage);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "6%", marginBottom: "20px", gap: "10px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
          maxWidth: "40%",
          width: "100%"
        }}>
          <input
            type="text"
            placeholder="Buscar por ID de evento..."
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              if (!e.target.value.trim()) {
                setFilteredEvents([]);
                setError("");
              }
            }}
            style={{ padding: "10px", maxWidth: "40%", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button
            onClick={searchEventById}
            style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "#007BFF", color: "white", maxWidth: "20%", border: "none" }}
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setSearchId("");
              setFilteredEvents([]);
              setError("");
            }}
            style={{ padding: "10px 16px", borderRadius: "8px", maxWidth: "20%", backgroundColor: "#ccc", border: "none" }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: "red", padding: "10px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {currentUser?.role === "ADMIN" ? (
        <div>
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "24px 0",
              }}
            >
              <button
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                disabled={page === 0}
                style={{
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                  width: 40,
                  height: 40,
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  marginRight: 8,
                  padding: 0,
                }}
              >
                <ChevronDown size={20} color="black" style={{ transform: "rotate(90deg)" }} />
              </button>

              <span style={{ fontWeight: "bold", margin: "0 12px" }}>
                Página {page + 1} de {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                disabled={page + 1 >= totalPages}
                style={{
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                  width: 40,
                  height: 40,
                  cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                  marginLeft: 8,
                  padding: 0,
                }}
              >
                <ChevronDown size={20} color="black" style={{ transform: "rotate(-90deg)" }} />
              </button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {currentEvents.map((event, index) => (

              /* SI NO OS GUSTA EL QUE SE PUEDA HACER SCROLL, ELIMINADLE EL STYLE*/
              <div key={index} className="service-container" style={{ height: "90%" }}>
                <h2 className="service-title">Nombre: {event.name}</h2>
                <p className="service-title">ID: {event.id}</p>
                <p className="service-title">De {event.userEmail}</p>

                <div className="service-info">
                  <form style={{ width: "100%" }} onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                      <label>Tipo de Evento: {editEventId === event.id && <span className="asterisk">*</span>}</label>
                      <select
                        name="eventType"
                        value={eventData[event.id]?.eventType || event.eventType}
                        onChange={handleInputChange}
                        required={editEventId === event.id}
                        disabled={editEventId !== event.id}
                      >
                        {Object.keys(eventTypeMap).map((type) => (
                          <option key={type} value={type}>{eventTypeMap[type]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Invitados:{editEventId === event.id && <span className="asterisk">*</span>}</label>
                      <input
                        type="number"
                        name="guests"
                        min="1"
                        value={eventData[event.id]?.guests || event.guests}
                        required={editEventId === event.id}
                        onChange={handleInputChange}
                        readOnly={editEventId !== event.id}
                      />
                    </div>

                    <div className="form-group">
                      <label>Fecha del Evento:</label>
                      <input
                        type="date"
                        name="eventDate"
                        value={eventData[event.id]?.eventDate || (event.eventDate ? event.eventDate.split("T")[0] : "")}
                        onChange={handleInputChange}
                        readOnly={!(editEventId === event.id && (event.eventPropertiesDTO?.length <= 0 || event.eventProperties?.length <= 0))}
                      />
                    </div>

                    {(event.eventPropertiesDTO?.length > 0 || event.eventProperties?.length > 0) && (
                      
                      /* SI NO OS GUSTA EL QUE SE PUEDA HACER SCROLL, ELIMINADLE EL STYLE*/
                      <div className="event-services-box" style={{ height: "300px", overflowY: "auto" }}>
                        <h3>Servicios del Evento</h3>

                        {(event.eventPropertiesDTO || []).some(prop => prop.venueDTO) && (
                          <div className="service-subsection">
                            <h4>Locales</h4>
                            {(event.eventPropertiesDTO || []).filter(prop => prop.venueDTO).map((prop, idx) => (
                              <div key={idx} className="service-card">
                                <p><strong>Nombre:</strong> {prop.venueDTO.name}</p>
                                <p><strong>Ciudad:</strong> {prop.venueDTO.cityAvailable}</p>
                                <p><strong>Aprobado:</strong> {prop.status=== "APPROVED"? "Sí" : "No"}</p>
                                <p><strong>Fecha solicitud:</strong> {new Date(prop.requestDate).toLocaleDateString("es-ES")}</p>
                                <button type="button" className="cancel-button" onClick={() => navigate(`/admin/event/${event.id}/event-prop/${prop.id}`)}>
                                    Editar recinto asociado
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {(event.eventPropertiesDTO || []).some(prop => prop.otherServiceDTO) && (
                          <div className="service-subsection">
                            <h4>Servicios adicionales</h4>
                            {(event.eventPropertiesDTO || []).filter(prop => prop.otherServiceDTO).map((prop, idx) => (
                              <div key={idx} className="service-card">
                                <p><strong>Servicio:</strong> {prop.otherServiceDTO.name}</p>
                                <p><strong>Ciudad:</strong> {prop.otherServiceDTO.cityAvailable}</p>
                                <p><strong>Aprobado:</strong> {prop.approved ? "Sí" : "No"}</p>
                                <p><strong>Fecha solicitud:</strong> {new Date(prop.requestDate).toLocaleDateString("es-ES")}</p>
                                <button type="button" className="cancel-button" onClick={() => navigate(`/admin/event/${event.id}/event-prop/${prop.id}`)}>
                                    Editar servicio asociado
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="button-container">
                      {editEventId === event.id ? (
                        <>
                          <button className="save-btn" style={{ backgroundColor: "#4CAF50" }} onClick={() => updateEvent(event)}>Guardar</button>
                        </>
                      ) : (
                        <>
                          <button className="edit-btn" onClick={() => startEditing(event)}>Editar</button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No tienes permisos para ver esta sección.</p>
      )}
    </>
  );
}

export default AdminEvents;

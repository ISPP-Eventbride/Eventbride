/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Filter,
  X,
  MapPin,
  Users,
  SquareIcon,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import "../../static/resources/css/VenueScreen.css"
import LeafletMap from "../../components/LeafletMap";
import { useAlert } from "../../context/AlertContext.jsx"

const VenuesScreen = () => {
  const [venues, setVenues] = useState([])
  const [city, setCity] = useState("")
  const [maxGuests, setMaxGuests] = useState("")
  const [surface, setSurface] = useState("")
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [jwtToken] = useState(localStorage.getItem("jwt"));
  const [venuesWithCoordinates, setVenuesWithCoordinates] = useState([]);
  const navigate = useNavigate();

  // Modal para ver detalles del venue al hacer click en la card
  const [selectedVenue, setSelectedVenue] = useState(null)
  // Modal para añadir el venue a un evento
  const [selectedVenueForAdd, setSelectedVenueForAdd] = useState(null)
  const [addModalVisible, setAddModalVisible] = useState(false)

  const [events, setEvents] = useState([])
  // Para almacenar la hora de inicio y fin (solo horas y minutos) de cada venue dentro del evento
  const [venueTimes, setVenueTimes] = useState({})
  const [loading, setLoading] = useState(true)

  const { showAlert } = useAlert()

  // ------------------------------------------------------------------------------
  // Obtiene venues con o sin filtros
  // ------------------------------------------------------------------------------
  const getFilteredVenues = async () => {
    try {
      setLoading(true)
      const params = {}
      if (city) params.city = city
      if (maxGuests) params.maxGuests = maxGuests
      if (surface) params.surface = surface
      const response = await axios.get("/api/venues/filter", { params: params, headers: { Authorization: `Bearer ${jwtToken}` } })
      setVenues(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const findAllVenues = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/venues", { headers: { Authorization: `Bearer ${jwtToken}` } })
      setVenues(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const parseCoordinates = (coordinatesString) => {
    if (!coordinatesString) return null;

    try {
      const [latStr, lngStr] = coordinatesString.split(',').map(str => str.trim());

      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("Invalid coordinates:", coordinatesString);
        return null;
      }

      return { lat, lng };
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      return null;
    }
  };

  useEffect(() => {
    if (city || maxGuests || surface) {
      getFilteredVenues()
    } else {
      findAllVenues()
    }
  }, [])

  useEffect(() => {
    const processedVenues = venues.map(venue => {
      if (!venue.coordinates) {
        console.warn("Venue missing coordinates:", venue);
        return null;
      }

      const parsedCoordinates = parseCoordinates(venue.coordinates);

      if (!parsedCoordinates) {
        console.warn("Could not parse coordinates for venue:", venue);
        return null;
      }

      return {
        ...venue,
        latitude: parsedCoordinates.lat,
        longitude: parsedCoordinates.lng,
        coordinates: venue.coordinates
      };
    }).filter(Boolean);

    setVenuesWithCoordinates(processedVenues);
  }, [venues]);


  // ------------------------------------------------------------------------------
  // Lógica de filtros
  // ------------------------------------------------------------------------------
  const applyFilters = () => {
    getFilteredVenues()
  }

  const clearFilters = () => {
    setCity("")
    setMaxGuests("")
    setSurface("")
    findAllVenues()
  }

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  // ------------------------------------------------------------------------------
  // Obtiene los eventos del usuario
  // ------------------------------------------------------------------------------
  const getUserEvents = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`/api/v1/events/next/${currentUser.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        method: "GET",
      })
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error("Error obteniendo eventos:", error)
    }
  }

  // ------------------------------------------------------------------------------
  // Manejo de modales
  // ------------------------------------------------------------------------------
  // Muestra el modal con detalles del venue
  const handleVenueClick = (venue) => {
    setSelectedVenue(venue)
  }

  // Al hacer click en "Añadir a mi evento", abre el modal de asignar venue
  const handleAddVenueClick = (e, venue) => {
    e.stopPropagation()
    setSelectedVenueForAdd(venue)
    getUserEvents()
    setAddModalVisible(true)
  }

  // ------------------------------------------------------------------------------
  // Almacena la hora de inicio/fin seleccionada del venue para un evento específico
  // ------------------------------------------------------------------------------
  const handleTimeChange = (eventId, field, value) => {
    setVenueTimes((prevTimes) => ({
      ...prevTimes,
      [eventId]: {
        ...prevTimes[eventId],
        [field]: value,
      },
    }))
  }

  // ------------------------------------------------------------------------------
  // Combina la fecha del evento (día, mes, año) con la hora (HH:mm) seleccionada
  // para formar un LocalDateTime "yyyy-MM-dd HH:mm:ss"
  // ------------------------------------------------------------------------------
  const combineDateAndTime = (eventDate, time) => {
    const datePart = eventDate.split("T")[0];
    return `${datePart}T${time}:00`;
  };

  // ------------------------------------------------------------------------------
  // Envía la petición PUT para añadir el venue al evento
  // utilizando las horas de inicio/fin del venue (no cambia la fecha del evento)
  // ------------------------------------------------------------------------------
  const handleConfirmVenue = async (eventObj, venueId) => {
    const times = venueTimes[eventObj.id] || {}
    if (!times.startTime || !times.endTime) {
      showAlert("Por favor, ingresa la hora de inicio y la hora de fin para este venue.")
      return
    }
    // Combinar la fecha del evento con la hora que indicó el usuario
    const startDate = combineDateAndTime(eventObj.eventDate, times.startTime)
    const endDate = combineDateAndTime(eventObj.eventDate, times.endTime)

    try {
      await axios.put(`/api/event-properties/${eventObj.id}/add-venue/${venueId}`, null, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      showAlert("¡Operación realizada con éxito!")
      setAddModalVisible(false)
    } catch (error) {
      console.error("Error al añadir el venue:", error)
      showAlert("Este evento ya tiene un servicio asociado.")
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  return (
    <div className="venues-container">
      {/* Header */}
      <div className="venues-header">
        <h1 className="venues-title">Recintos Disponibles</h1>

        <button className="filter-toggle" onClick={toggleFilters}>
          <Filter size={18} />
          {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
          {filtersVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Filters */}
      {filtersVisible && (
        <div className="filter-container">
          <h2 className="filter-title">Filtros disponibles</h2>
          <div className="filter-form">
            <div className="input-group">
              <label className="input-label">Ciudad</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Madrid"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Mínimo de invitados</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ej: 100"
                value={maxGuests}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) {
                    showAlert("El número no puede ser negativo");
                    return;
                  }
                  setMaxGuests(value);
                }}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Superficie (m²)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ej: 200"
                value={surface}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) {
                    showAlert("El número no puede ser negativo");
                    return;
                  }
                  setSurface(value);
                }}
              />
            </div>
          </div>
          <div className="button-group">
            <button className="primary-button" onClick={applyFilters}>
              <Filter size={16} />
              Aplicar filtros
            </button>
            <button className="secondary-button" onClick={clearFilters}>
              <X size={16} />
              Borrar filtros
            </button>
          </div>
        </div>
      )}

      <LeafletMap venues={venuesWithCoordinates} />

      {/* Venues grid */}
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Cargando venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <Info size={40} className="mx-auto mb-4" style={{ color: "#d9be75" }} />
          <p>No se encontraron venues con los criterios seleccionados.</p>
        </div>
      ) : (
        <div className="venues-grid" style={{ marginTop: "2%" }}>
          {venues.map((venue) => (
            <div key={venue.id} className="venue-card" >
              <div className="card-header" style={{ cursor: "pointer" }} onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                <h3 className="card-title">{venue.name}</h3>
              </div>
              <div className="card-body" style={{ cursor: "pointer" }} onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                {
                  venue.userDTO?.plan === "PREMIUM" && <span className="service-badge premium-badge">Promocionado</span>
                }
                <div className="card-info">
                  <span className="card-text">
                    <img style={{ height: "25%", width: "100%" }}
                      src={venue.picture || "https://iili.io/3EpzvZx.png"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://iili.io/3EpzvZx.png";
                      }}
                      alt="Imagen del servicio"></img>
                  </span>
                </div>
              </div>
              <div className="card-footer">
                {venue.available ? (
                  <>
                    <button className="add-button" onClick={(e) => handleAddVenueClick(e, venue)}>
                      <Plus size={16} />
                      Añadir a mi evento
                    </button>
                    <Link to={`/chat/${venue.userDTO.id}`} className="chat-button">
                      💬 Chatear
                    </Link>
                  </>
                ) : (
                  <div className="not-available-banner">No disponible</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venue details modal */}
      {selectedVenue && !addModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{selectedVenue.name}</h2>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div className="card-info">
                  <MapPin size={18} className="card-icon" />
                  <span className="card-text">
                    <strong>Dirección:</strong> {selectedVenue.address}
                  </span>
                </div>
                <div className="card-info">
                  <Users size={18} className="card-icon" />
                  <span className="card-text">
                    <strong>Capacidad máxima:</strong> {selectedVenue.maxGuests} personas
                  </span>
                </div>
                <div className="card-info">
                  <SquareIcon size={18} className="card-icon" />
                  <span className="card-text">
                    <strong>Superficie:</strong> {selectedVenue.surface} m²
                  </span>
                </div>
                <div className="card-info">
                  <MapPin size={18} className="card-icon" />
                  <span className="card-text">
                    <strong>Ciudad:</strong> {selectedVenue.cityAvailable}
                  </span>
                </div>
                <div className="card-info">
                  <MapPin size={18} className="card-icon" />
                  <span className="card-text">
                    <strong>Código Postal:</strong> {selectedVenue.postalCode}
                  </span>
                </div>
                <div className="card-info">
                  <span className="card-text">
                    <img style={{ height: "25%", width: "100%" }}
                      src={selectedVenue.picture || "https://iili.io/3EpzvZx.png"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://iili.io/3EpzvZx.png";
                      }}
                      alt="Imagen del servicio"></img>
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedVenue.available &&
                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedVenue(null)
                    handleAddVenueClick(e, selectedVenue)
                  }}
                >
                  <Plus size={16} />
                  Añadir a mi evento
                </button>}
              <button className="close-button" onClick={() => setSelectedVenue(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to event modal */}
      {addModalVisible && selectedVenueForAdd && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Selecciona un evento para añadir: {selectedVenueForAdd.name}</h2>
            </div>
            <div className="modal-body">
              {events.length === 0 ? (
                <div className="empty-state">
                  <Info size={40} style={{ color: "#d9be75", margin: "0 auto 1rem" }} />
                  <p className="empty-text">Tus eventos ya tienen este servicio.</p>
                </div>
              ) : (
                events.map((eventObj) => (
                  <div key={eventObj.id} className="event-card">
                    <div className="event-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <span className="event-badge">{eventObj.eventType}</span>
                        <h3 className="event-title" style={{ height: "10%" }}>{eventObj.name}</h3>
                      </div>
                      <div className="card-info">
                        <Users size={16} className="card-icon" />
                        <span className="card-text">{eventObj.guests} invitados</span>
                        <Calendar size={18} className="detail-icon" />
                        <span className="detail-text">{formatDate(eventObj.eventDate)}</span>
                      </div>
                    </div>


                    <div className="time-input-group">
                      <div className="input-group">
                        <label className="input-label">
                          <Clock
                            size={16}
                            style={{ display: "inline-block", marginRight: "0.5rem", color: "#d9be75" }}
                          />
                          Hora de inicio
                        </label>
                        <input
                          type="time"
                          className="input-field"
                          value={venueTimes[eventObj.id]?.startTime || ""}
                          onChange={(e) => handleTimeChange(eventObj.id, "startTime", e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">
                          <Clock
                            size={16}
                            style={{ display: "inline-block", marginRight: "0.5rem", color: "#d9be75" }}
                          />
                          Hora de fin
                        </label>
                        <input
                          type="time"
                          className="input-field"
                          value={venueTimes[eventObj.id]?.endTime || ""}
                          onChange={(e) => handleTimeChange(eventObj.id, "endTime", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                      <button
                        className="primary-button"
                        onClick={() => handleConfirmVenue(eventObj, selectedVenueForAdd.id)}
                      >
                        <ArrowRight size={16} />
                        Confirmar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="primary-button" onClick={() => setAddModalVisible(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenuesScreen
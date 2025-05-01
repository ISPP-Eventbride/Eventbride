"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Filter, X, MapPin, Users, SquareIcon, Clock, Plus, ChevronDown, ChevronUp, Info, Calendar, ArrowRight, Search, Loader2, Star, MessageCircle, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import LeafletMap from "../../components/LeafletMap"
import { useAlert } from "../../context/AlertContext.jsx"
import "../../static/resources/css/VenueScreen.css"

const VenuesScreen = () => {
  const [venues, setVenues] = useState([])
  const [city, setCity] = useState("")
  const [maxGuests, setMaxGuests] = useState("")
  const [surface, setSurface] = useState("")
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [jwtToken] = useState(localStorage.getItem("jwt"))
  const [venuesWithCoordinates, setVenuesWithCoordinates] = useState([])
  const navigate = useNavigate()

  // Modal para ver detalles del venue al hacer click en la card
  const [selectedVenue, setSelectedVenue] = useState(null)
  // Modal para añadir el venue a un evento
  const [selectedVenueForAdd, setSelectedVenueForAdd] = useState(null)
  const [addModalVisible, setAddModalVisible] = useState(false)

  const [events, setEvents] = useState([])
  // Para almacenar la hora de inicio y fin (solo horas y minutos) de cada venue dentro del evento
  const [venueTimes, setVenueTimes] = useState({})
  const [loading, setLoading] = useState(true)
  // State to track loading status for each event confirmation button
  const [confirmingVenue, setConfirmingVenue] = useState({});

  const { showAlert } = useAlert()

  // ** Estados y lógica de paginación **
  const [page, setPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.ceil(venues.length / itemsPerPage)

  // Ajustar página si cambia totalPages
  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0))
    }
  }, [totalPages])

  const startIndex = page * itemsPerPage
  const currentVenues = venues.slice(startIndex, startIndex + itemsPerPage)

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
      const response = await axios.get("/api/venues/filter", {
        params: params,
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
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
    if (!coordinatesString) return null

    try {
      const [latStr, lngStr] = coordinatesString.split(",").map((str) => str.trim())

      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("Invalid coordinates:", coordinatesString)
        return null
      }

      return { lat, lng }
    } catch (error) {
      console.error("Error parsing coordinates:", error)
      return null
    }
  }

  useEffect(() => {
    if (city || maxGuests || surface) {
      getFilteredVenues()
    } else {
      findAllVenues()
    }
  }, [])

  useEffect(() => {
    const processedVenues = venues
      .map((venue) => {
        if (!venue.coordinates) {
          console.warn("Venue missing coordinates:", venue)
          return null
        }

        const parsedCoordinates = parseCoordinates(venue.coordinates)

        if (!parsedCoordinates) {
          console.warn("Could not parse coordinates for venue:", venue)
          return null
        }

        return {
          ...venue,
          latitude: parsedCoordinates.lat,
          longitude: parsedCoordinates.lng,
          coordinates: venue.coordinates,
        }
      })
      .filter(Boolean)

    setVenuesWithCoordinates(processedVenues)
  }, [venues])

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
          Authorization: `Bearer ${jwtToken}`,
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
    const datePart = eventDate.split("T")[0]
    return `${datePart}T${time}:00`
  }

  // ------------------------------------------------------------------------------
  // Envía la petición PUT para añadir el venue al evento
  // utilizando las horas de inicio/fin del venue (no cambia la fecha del evento)
  // ------------------------------------------------------------------------------
  const handleConfirmVenue = async (eventObj, venueId) => {
    // Set loading state for this specific event button
    setConfirmingVenue(prev => ({ ...prev, [eventObj.id]: true }));

    const times = venueTimes[eventObj.id] || {}
    if (!times.startTime || !times.endTime) {
      showAlert("Por favor, ingresa la hora de inicio y la hora de fin para este venue.")
      setConfirmingVenue(prev => ({ ...prev, [eventObj.id]: false })); // Reset loading state
      return
    }
    if (times.startTime >= times.endTime) {
      showAlert("Por favor, ingresa un intervalo horario válido.")
      setConfirmingVenue(prev => ({ ...prev, [eventObj.id]: false })); // Reset loading state
      return
    }
    // Combinar la fecha del evento con la hora que indicó el usuario
    const startDate = combineDateAndTime(eventObj.eventDate, times.startTime)
    const endDate = combineDateAndTime(eventObj.eventDate, times.endTime)

    try {
      await axios.put(`/api/event-properties/${eventObj.id}/add-venue/${venueId}`, null, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      showAlert("¡Operación realizada con éxito!")
      setAddModalVisible(false)
      // Optionally clear times for this event if needed
      // setVenueTimes(prev => {
      //   const newTimes = { ...prev };
      //   delete newTimes[eventObj.id];
      //   return newTimes;
      // });
    } catch (error) {
      console.error("Error al añadir el venue:", error.code, error.response?.data?.error)
      showAlert(error.response?.data?.error || "Error al añadir el venue")
    } finally {
      // Reset loading state regardless of success or failure
      setConfirmingVenue(prev => ({ ...prev, [eventObj.id]: false }));
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Formatear tipo de evento
  const formatEventType = (eventType) => {
    switch (eventType) {
      case "WEDDING":
        return "Boda"
      case "COMMUNION":
        return "Comunión"
      case "CHRISTENING":
        return "Bautizo"
      case "BIRTHDAY":
        return "Cumpleaños"
      case "CORPORATE":
        return "Evento corporativo"
      default:
        return "Otro evento"
    }
  }

  // Obtener color de badge según tipo de evento
  const getEventBadgeColor = (eventType) => {
    switch (eventType) {
      case "WEDDING":
        return "badge-wedding"
      case "COMMUNION":
        return "badge-communion"
      case "CHRISTENING":
        return "badge-christening"
      case "BIRTHDAY":
        return "badge-birthday"
      case "CORPORATE":
        return "badge-corporate"
      default:
        return "badge-default"
    }
  }

  return (
    <div className="venues-container">
      {/* Header */}
      <div className="venues-header">
        <div className="venues-header-content">
          <h1 className="venues-title">Recintos para Eventos</h1>
          <p className="venues-subtitle">Encuentra el lugar perfecto para tu próximo evento</p>
        </div>
      </div>
      <button className="filter-toggle-button" onClick={toggleFilters}>
        <Filter className="button-icon" />
        <span>{filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}</span>
        {filtersVisible ? <ChevronUp className="button-icon-right" /> : <ChevronDown className="button-icon-right" />}
      </button>

      {/* Filters */}
      {filtersVisible && (
        <div className="filters-panel">
          <div className="filters-header">
            <h2 className="filters-title">Filtros de búsqueda</h2>
          </div>
          <div className="filters-form">
            <div className="filter-group">
              <label className="filter-label">
                <MapPin className="filter-icon" />
                Ciudad
              </label>
              <div className="filter-input-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Ej: Madrid"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Users className="filter-icon" />
                Capacidad mínima
              </label>
              <div className="filter-input-wrapper">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Ej: 100"
                  value={maxGuests}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value < 0) {
                      showAlert("El número no puede ser negativo")
                      return
                    }
                    setMaxGuests(value)
                  }}
                />
                <span className="filter-input-suffix">personas</span>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <SquareIcon className="filter-icon" />
                Superficie mínima
              </label>
              <div className="filter-input-wrapper">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Ej: 200"
                  value={surface}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value < 0) {
                      showAlert("El número no puede ser negativo")
                      return
                    }
                    setSurface(value)
                  }}
                />
                <span className="filter-input-suffix">m²</span>
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button className="filter-button apply-button" onClick={applyFilters}>
              <Search className="button-icon" />
              <span>Buscar</span>
            </button>
            <button className="filter-button clear-button" onClick={clearFilters}>
              <X className="button-icon" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="map-container">
        <LeafletMap venues={venuesWithCoordinates} />
      </div>

      {/* Venues grid */}
      <div className="venues-content">
        <h2 className="venues-section-title">
          {loading ? "Cargando recintos..." : `${venues.length} recintos disponibles`}
        </h2>

        {loading ? (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <h3 className="loading-text">Cargando recintos</h3>
            <p className="loading-subtext">Espere mientras obtenemos los recintos disponibles...</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon-container">
              <Info className="empty-icon" />
            </div>
            <h3 className="empty-title">No se encontraron recintos</h3>
            <p className="empty-text">No hay recintos disponibles con los criterios seleccionados.</p>
            <button className="reset-button" onClick={clearFilters}>
              <X className="button-icon" />
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div>
            <div className="venues-grid fade-in">
              {currentVenues.map((venue) => (
                <div
                  key={venue.id}
                  className={`venue-card hover-shadow ${!venue.available ? "venue-unavailable" : ""}`}
                >
                  {/* Imagen del venue */}
                  <div className="venue-image-container" onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                    <img
                      src={venue.picture || "https://iili.io/3EpzvZx.png"}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://iili.io/3EpzvZx.png"
                      }}
                      alt={venue.name}
                      className="venue-image"
                    />
                    <div className="venue-image-overlay"></div>
                    {venue.userDTO?.plan === "PREMIUM" && (
                      <div className="premium-badge">
                        <Star className="premium-icon" />
                        <span>Promocionado</span>
                      </div>
                    )}
                    {!venue.available && (
                      <div className="unavailable-badge">
                        <X className="unavailable-icon" />
                        <span>No disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Cabecera de la tarjeta */}
                  <div className="venue-header" onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                    <h3 className="venue-name">{venue.name}</h3>
                    <div className="venue-location">
                      <MapPin className="location-icon" />
                      <span>{venue.cityAvailable}</span>
                    </div>
                  </div>

                  {/* Detalles del venue */}
                  <div className="venue-details" onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                    <div className="details-grid">
                      <div className="detail-item">
                        <Users className="detail-icon" />
                        <div className="detail-content">
                          <p className="detail-label">Capacidad</p>
                          <p className="detail-value">{venue.maxGuests} personas</p>
                        </div>
                      </div>

                      <div className="detail-item">
                        <SquareIcon className="detail-icon" />
                        <div className="detail-content">
                          <p className="detail-label">Superficie</p>
                          <p className="detail-value">{venue.surface} m²</p>
                        </div>
                      </div>
                    </div>

                    <div className="venue-description">
                      <p>{venue.description}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="venue-actions">
                    {venue.available ? (
                      <>
                        <button className="action-button add-button" onClick={(e) => handleAddVenueClick(e, venue)}>
                          <Plus className="button-icon" />
                          <span>Añadir a mi evento</span>
                        </button>
                        <Link to={`/chat/${venue.userDTO.id}`} className="action-button chat-button">
                          <MessageCircle className="button-icon" />
                          <span>Chatear</span>
                        </Link>
                      </>
                    ) : (
                      <div className="unavailable-message">
                        <Info className="info-icon" />
                        <span>Este recinto no está disponible actualmente</span>
                      </div>
                    )}
                  </div>

                  {/* Ver más link */}
                  <div className="venue-footer">
                    <button className="view-details-button" onClick={() => navigate(`/detallesVenues/${venue.id}`)}>
                      <ExternalLink className="button-icon" />
                      <span>Ver detalles</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "24px 0",
              }}>
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
          </div>
        )}
      </div>

      {/* Venue details modal */}
      {selectedVenue && !addModalVisible && (
        <div className="modal-overlay" onClick={() => setSelectedVenue(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedVenue.name}</h2>
              <button className="modal-close-button" onClick={() => setSelectedVenue(null)}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-content">
              <div className="venue-image-container modal-image">
                <img
                  src={selectedVenue.picture || "https://iili.io/3EpzvZx.png"}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://iili.io/3EpzvZx.png"
                  }}
                  alt={selectedVenue.name}
                  className="venue-image"
                />
              </div>

              <div className="modal-details">
                <div className="modal-section">
                  <h3 className="section-title">Información del recinto</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Dirección</p>
                        <p className="detail-value">{selectedVenue.address}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Ciudad</p>
                        <p className="detail-value">{selectedVenue.cityAvailable}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Código Postal</p>
                        <p className="detail-value">{selectedVenue.postalCode}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Users className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Capacidad máxima</p>
                        <p className="detail-value">{selectedVenue.maxGuests} personas</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <SquareIcon className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Superficie</p>
                        <p className="detail-value">{selectedVenue.surface} m²</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3 className="section-title">Descripción</h3>
                  <p className="modal-description">{selectedVenue.description}</p>
                </div>
              </div>

              <div className="modal-actions">
                {selectedVenue.available ? (
                  <>
                    <button
                      className="modal-button primary-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVenue(null)
                        handleAddVenueClick(e, selectedVenue)
                      }}
                    >
                      <Plus className="button-icon" />
                      <span>Añadir a mi evento</span>
                    </button>
                    <Link to={`/chat/${selectedVenue.userDTO.id}`} className="modal-button secondary-button">
                      <MessageCircle className="button-icon" />
                      <span>Chatear con propietario</span>
                    </Link>
                  </>
                ) : (
                  <div className="unavailable-message modal-unavailable">
                    <Info className="info-icon" />
                    <span>Este recinto no está disponible actualmente</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to event modal */}
      {addModalVisible && selectedVenueForAdd && (
        <div className="modal-overlay" onClick={() => setAddModalVisible(false)}>
          <div className="modal-container add-event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Añadir a evento: {selectedVenueForAdd.name}</h2>
              <button className="vs-modal-close-button" onClick={() => setAddModalVisible(false)}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="vs-modal-content">
              {events.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon-container">
                    <Info className="empty-icon" />
                  </div>
                  <h3 className="empty-title">No hay eventos disponibles</h3>
                  <p className="empty-text">No tienes eventos a los que puedas añadir este recinto.</p>
                </div>
              ) : (
                <div className="vs-events-list">
                  {events.map((eventObj) => (
                    <div key={eventObj.id} className="vs-event-card">
                      <div className="event-header">
                        <div className="event-title-container">
                          <span className={`event-badge ${getEventBadgeColor(eventObj.eventType)}`}>
                            {formatEventType(eventObj.eventType)}
                          </span>
                          <h3 className="vs-event-title">{eventObj.name}</h3>
                        </div>
                        <div className="event-info">
                          <div className="event-info-item">
                            <Users className="info-icon" />
                            <span>{eventObj.guests} invitados</span>
                          </div>
                          <div className="event-info-item">
                            <Calendar className="info-icon" />
                            <span>{formatDate(eventObj.eventDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="event-time-selection">
                        <h4 className="time-selection-title">Selecciona el horario</h4>
                        <div className="time-inputs">
                          <div className="time-input-group">
                            <label className="time-input-label">
                              <Clock className="time-icon" />
                              <span>Hora de inicio</span>
                            </label>
                            <input
                              type="time"
                              className="time-input"
                              value={venueTimes[eventObj.id]?.startTime || ""}
                              required
                              onChange={(e) => handleTimeChange(eventObj.id, "startTime", e.target.value)}
                            />
                          </div>
                          <div className="time-input-group">
                            <label className="time-input-label">
                              <Clock className="time-icon" />
                              <span>Hora de fin</span>
                            </label>
                            <input
                              type="time"
                              className="time-input"
                              value={venueTimes[eventObj.id]?.endTime || ""}
                              required
                              onChange={(e) => handleTimeChange(eventObj.id, "endTime", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="vs-event-actions">
                        <button
                          className="vs-event-confirm-button"
                          onClick={() => handleConfirmVenue(eventObj, selectedVenueForAdd.id)}
                          disabled={confirmingVenue[eventObj.id]} // Disable button when confirming
                        >
                          {confirmingVenue[eventObj.id] ? (
                            <>
                              <Loader2 className="button-icon animate-spin" />
                              <span>Confirmando...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight className="button-icon" />
                              <span>Confirmar selección</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenuesScreen

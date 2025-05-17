/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Filter, X, MapPin, DollarSign, Users, Clock, Plus, ChevronDown, ChevronUp, Info, Calendar, CheckCircle, Search, Star, MessageCircle, ExternalLink, Loader2, Utensils, Music, Palette, Package } from 'lucide-react'
import { Link } from "react-router-dom"
import { useAlert } from "../../context/AlertContext"
import "../../static/resources/css/OtherService.css"

const OtherServiceScreenPublic = () => {
  const [otherServices, setOtherServices] = useState([])
  const [category, setCategory] = useState(null)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [type, setType] = useState(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [serviceDetailsVisible, setServiceDetailsVisible] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedOtherServiceId, setSelectedOtherServiceId] = useState(null)
  const [serviceDetails, setServiceDetails] = useState(null)
  const [venueTimes, setVenueTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [confirmingService, setConfirmingService] = useState({});
  const navigate = useNavigate();

  // Estados de paginación
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(otherServices.length / itemsPerPage);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [totalPages]);  

  const currentUser = JSON.parse(localStorage.getItem("user"))
  const [jwtToken] = useState(localStorage.getItem("jwt"))

  const { showAlert } = useAlert()

    const getFilteredOtherServices = async () => {
        try {
            setLoading(true);

            const params = { name, city, type };

            const config = { params };
            if (jwtToken) {
            config.headers = {
                Authorization: `Bearer ${jwtToken}`,
            };
            }

            const response = await axios.get("/api/other-services/filter", config);
            setOtherServices(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAllOtherServices = async () => {
        try {
            setLoading(true);

            const config = {};
            if (jwtToken) {
            config.headers = {
                Authorization: `Bearer ${jwtToken}`,
            };
            }

            const response = await axios.get("/api/other-services", config);
            setOtherServices(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

  const getUserEvents = async () => {
    try {
      const response = await fetch(`/api/v1/events/next/${currentUser.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        method: "GET",
      })
      const data = await response.json()
      setEvents((prevEvents) => [...prevEvents, ...data])
    } catch (error) {
      console.error("Error obteniendo eventos:", error)
    }
  }

  const getUserEventsWithoutAService = async (serviceId) => {
    try {
      const response = await fetch(`/api/v1/events/next/${currentUser.id}/without/${serviceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        method: "GET",
      })
      const data = await response.json()
      setEvents((prevEvents) => [...prevEvents, ...data])
    } catch (error) {
      console.error("Error obteniendo eventos:", error)
    }
  }

  const getServiceDetails = async (serviceId) => {
    try {
      const response = await axios.get(`/api/other-services/${serviceId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      setServiceDetails(response.data)
      setServiceDetailsVisible(true)
    } catch (error) {
      console.error("Error obteniendo detalles del servicio:", error)
    }
  }

  const handleCategoryClick = (category) => {
    if (category !== type) {
      setCategory(category)
      setType(category)
    } else {
      // Si ya está seleccionada, deseleccionar
      setCategory(null)
      setType(null)
    }
  }

  const handleServiceClick = (serviceId) => {
    getServiceDetails(serviceId)
  }

  const handleAddServiceClick = (e, serviceId) => {
    e.stopPropagation()
    setSelectedOtherServiceId(serviceId)
    setSelectedService(serviceId)
    setEvents([]) // Limpiar eventos anteriores
    getUserEventsWithoutAService(serviceId)
    setModalVisible(true)
  }

  const handleTimeChange = (eventId, field, value) => {
    setVenueTimes((prevTimes) => ({
      ...prevTimes,
      [eventId]: {
        ...prevTimes[eventId],
        [field]: value,
      },
    }))
  }

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  const formatServiceType = (type) => {
    switch (type) {
      case "CATERING":
        return "Catering"
      case "ENTERTAINMENT":
        return "Entretenimiento"
      case "DECORATION":
        return "Decoración"
      default:
        return "Otro servicio"
    }
  }

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case "CATERING":
        return <Utensils className="category-icon" />
      case "ENTERTAINMENT":
        return <Music className="category-icon" />
      case "DECORATION":
        return <Palette className="category-icon" />
      default:
        return <Package className="category-icon" />
    }
  }

  const getServiceBadgeColor = (type) => {
    switch (type) {
      case "CATERING":
        return "badge-catering"
      case "ENTERTAINMENT":
        return "badge-entertainment"
      case "DECORATION":
        return "badge-decoration"
      default:
        return "badge-default"
    }
  }

  const formatEventType = (type) => {
    switch (type) {
      case "WEDDING":
        return "Boda"
      case "CHRISTENING":
        return "Bautizo"
      case "COMMUNION":
        return "Comunión"
      case "BIRTHDAY":
        return "Cumpleaños"
      case "CORPORATE":
        return "Evento corporativo"
      default:
        return "Evento"
    }
  }

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const combineDateAndTime = (eventDate, time) => {
    // Extrae la parte de la fecha sin convertir a Date
    const datePart = eventDate.split("T")[0]
    // Devuelve en formato ISO estándar usando "T" como separador
    return `${datePart}T${time}:00`
  }

  const handleConfirmService = async (eventObj, selectedOtherServiceId) => {
    // Set loading state for this specific event button
    setConfirmingService(prev => ({ ...prev, [eventObj.id]: true }));

    const times = venueTimes[eventObj.id] || {}
    if (!times.startTime || !times.endTime) {
      showAlert("Por favor, ingresa la hora de inicio y la hora de fin para este servicio.")
      setConfirmingService(prev => ({ ...prev, [eventObj.id]: false })); // Reset loading state
      return
    }
    if (times.startTime >= times.endTime) {
      showAlert("Por favor, ingresa un intervalo horario válido.")
      setConfirmingService(prev => ({ ...prev, [eventObj.id]: false })); // Reset loading state
      return
    }

    const startDate = combineDateAndTime(eventObj.eventDate, times.startTime)
    const endDate = combineDateAndTime(eventObj.eventDate, times.endTime)

    try {
      await axios.put(`/api/event-properties/${eventObj.id}/add-otherservice/${selectedOtherServiceId}`, null, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      showAlert("¡Operación realizada con éxito!")
      setModalVisible(false)
      // Optionally clear times for this event if needed
      // setVenueTimes(prev => {
      //   const newTimes = { ...prev };
      //   delete newTimes[eventObj.id];
      //   return newTimes;
      // });
    } catch (error) {
      console.error("Error al añadir el servicio:", error)
      showAlert(error.response?.data?.error || "Error al añadir el servicio")
    } finally {
      // Reset loading state regardless of success or failure
      setConfirmingService(prev => ({ ...prev, [eventObj.id]: false }));
    }
  }

  useEffect(() => {
    getAllOtherServices()
  }, [])

  useEffect(() => {
    if (type) {
      getFilteredOtherServices()
    } else {
      getAllOtherServices()
    }
  }, [type])

  const startIndex = page * itemsPerPage;
  const currentServices = otherServices.slice(startIndex, startIndex + itemsPerPage);


  return (
    <div className="services-container">
      {/* Header */}
      <div className="services-header">
        <div className="services-header-content">
          <h1 className="services-title">Servicios para Eventos</h1>
          <p className="services-subtitle">Encuentra los mejores servicios para hacer tu evento inolvidable</p>
        </div>
      </div>
      <div style={{ marginBottom: '30px' }}>
        <button className="filter-toggle-button" onClick={toggleFilters}>
          <Filter className="button-icon" />
          <span>{filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}</span>
          {filtersVisible ? <ChevronUp className="button-icon-right" /> : <ChevronDown className="button-icon-right" />}
        </button>
      </div>

      {/* Categorías */}
      <div className="categories-panel">
        <button
          className={`category-button ${!category ? "active" : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          <Package className="category-icon" />
          <span>Todos</span>
        </button>
        <button
          className={`category-button ${category === "CATERING" ? "active" : ""}`}
          onClick={() => handleCategoryClick("CATERING")}
        >
          <Utensils className="category-icon" />
          <span>Catering</span>
        </button>
        <button
          className={`category-button ${category === "ENTERTAINMENT" ? "active" : ""}`}
          onClick={() => handleCategoryClick("ENTERTAINMENT")}
        >
          <Music className="category-icon" />
          <span>Entretenimiento</span>
        </button>
        <button
          className={`category-button ${category === "DECORATION" ? "active" : ""}`}
          onClick={() => handleCategoryClick("DECORATION")}
        >
          <Palette className="category-icon" />
          <span>Decoración</span>
        </button>
      </div>

      {/* Filtros */}
      {filtersVisible && (
        <div className="filters-panel">
          <div className="filters-header">
            <h2 className="filters-title">Filtros de búsqueda</h2>
          </div>
          <div className="filters-form">
            <div className="filter-group">
              <label className="filter-label">
                <Package className="filter-icon" />
                Nombre del servicio
              </label>
              <div className="filter-input-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Ej: Catering Deluxe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
          </div>

          <div className="filters-actions">
            <button className="filter-button apply-button" onClick={getFilteredOtherServices}>
              <Search className="button-icon" />
              <span>Buscar</span>
            </button>
            <button
              className="filter-button clear-button"
              onClick={() => {
                setName("")
                setCity("")
                getAllOtherServices()
              }}
            >
              <X className="button-icon" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="services-content">
        <h2 className="services-section-title">
          {category
            ? `Servicios de ${formatServiceType(category)}`
            : loading
              ? "Cargando servicios..."
              : `${otherServices.length} servicios disponibles`}
        </h2>

        {/* Grid de servicios */}
        {loading ? (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <h3 className="loading-text">Cargando servicios</h3>
            <p className="loading-subtext">Espere mientras obtenemos los servicios disponibles...</p>
          </div>
        ) : otherServices.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon-container">
              <Info className="empty-icon" />
            </div>
            <h3 className="empty-title">No se encontraron servicios</h3>
            <p className="empty-text">No hay servicios disponibles con los criterios seleccionados.</p>
            <button
              className="reset-button"
              onClick={() => {
                setName("")
                setCity("")
                setCategory(null)
                setType(null)
                getAllOtherServices()
              }}
            >
              <X className="button-icon" />
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div
            className="services-grid fade-in"
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "flex-start",
                minHeight: "650px"
            }}
            >
            {currentServices.map((service) => (
                <div
                key={service.id}
                className={`service-card hover-shadow ${!service.available ? "service-unavailable" : ""}`}
                style={{
                    flex: "none",
                    width: "calc(33.333% - 20px)",
                    maxWidth: "400px",
                    minHeight: "600px"
                }}
                >
                <div className="service-image-container" onClick={() => navigate(`/detallesOtherServicesPublic/${service.id}`)}>
                    <img
                    src={service.picture || "https://iili.io/3EpzvZx.png"}
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://iili.io/3EpzvZx.png"
                    }}
                    alt={service.name}
                    className="service-image"
                    />
                    <div className="service-image-overlay"></div>
                    {service.userDTO?.plan === "PREMIUM" && (
                    <div className="premium-badge">
                        <Star className="premium-icon" />
                        <span>Promocionado</span>
                    </div>
                    )}
                    {!service.available && (
                    <div className="unavailable-badge">
                        <X className="unavailable-icon" />
                        <span>No disponible</span>
                    </div>
                    )}
                </div>

                <div className="service-header" onClick={() => navigate(`/detallesOtherServicesPublic/${service.id}`)}>
                    <h3 className="services-name">{service.name}</h3>
                    <div className="service-type">
                    <span className={`service-badge ${getServiceBadgeColor(service.otherServiceType)}`}>
                        {getServiceTypeIcon(service.otherServiceType)}
                        <span>{formatServiceType(service.otherServiceType)}</span>
                    </span>
                    </div>
                </div>

                <div className="service-details" onClick={() => navigate(`/detallesOtherServicesPublic/${service.id}`)}>
                    <div className="details-grid">
                    <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <div className="detail-content">
                        <p className="detail-label">Ciudad</p>
                        <p className="detail-value">{service.cityAvailable}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <DollarSign className="detail-icon" />
                        <div className="detail-content">
                        <p className="detail-label">Precio</p>
                        <p className="detail-value">
                            {service.limitedByPricePerGuest
                            ? `${service.servicePricePerGuest}€ por invitado`
                            : service.limitedByPricePerHour
                                ? `${service.servicePricePerHour}€ por hora`
                                : `${service.fixedPrice}€ precio fijo`}
                        </p>
                        </div>
                    </div>
                    </div>

                    <div className="service-description">
                    <p>{service.description}</p>
                    </div>
                </div>
          </div>
            ))}
            </div>
        )}

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

      {/* Modal para seleccionar evento */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-container add-event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecciona un evento</h2>
              <button className="vs-modal-close-button" onClick={() => setModalVisible(false)}>
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
                  <p className="empty-text">No tienes eventos a los que puedas añadir este servicio.</p>
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
                              min={venueTimes[eventObj.id]?.startTime}
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
                          onClick={() => handleConfirmService(eventObj, selectedOtherServiceId)}
                          disabled={confirmingService[eventObj.id]} // Disable button based on specific event ID
                        >
                          {confirmingService[eventObj.id] ? ( // Show loading state based on specific event ID
                            <>
                              <Loader2 className="button-icon animate-spin" />
                              <span>Confirmando...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="button-icon" />
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

      {/* Modal para detalles del servicio */}
      {serviceDetailsVisible && serviceDetails && (
        <div className="modal-overlay" onClick={() => setServiceDetailsVisible(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{serviceDetails.name}</h2>
              <button className="modal-close-button" onClick={() => setServiceDetailsVisible(false)}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-content">
              <div className="service-image-container modal-image">
                <img
                  src={serviceDetails.picture || "https://iili.io/3EpzvZx.png"}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://iili.io/3EpzvZx.png"
                  }}
                  alt={serviceDetails.name}
                  className="service-image"
                />
              </div>

              <div className="modal-details">
                <div className="modal-section">
                  <h3 className="section-title">Información del servicio</h3>
                  <div className="service-type-badge">
                    <span className={`service-badge ${getServiceBadgeColor(serviceDetails.otherServiceType)}`}>
                      {getServiceTypeIcon(serviceDetails.otherServiceType)}
                      <span>{formatServiceType(serviceDetails.otherServiceType)}</span>
                    </span>
                  </div>

                  <div className="details-grid">
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Ciudad</p>
                        <p className="detail-value">{serviceDetails.cityAvailable}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <DollarSign className="detail-icon" />
                      <div className="detail-content">
                        <p className="detail-label">Precio</p>
                        <p className="detail-value">
                          {serviceDetails.limitedByPricePerGuest
                            ? `${serviceDetails.servicePricePerGuest}€ por invitado`
                            : serviceDetails.limitedByPricePerHour
                              ? `${serviceDetails.servicePricePerHour}€ por hora`
                              : `${serviceDetails.fixedPrice}€ precio fijo`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3 className="section-title">Descripción</h3>
                  <p className="modal-description">{serviceDetails.description}</p>
                </div>

                {serviceDetails.extraInformation && (
                  <div className="modal-section">
                    <h3 className="section-title">Información adicional</h3>
                    <p className="modal-description">{serviceDetails.extraInformation}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {serviceDetails.available ? (
                  <>
                    <button
                      className="modal-button primary-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setServiceDetailsVisible(false)
                        handleAddServiceClick(e, serviceDetails.id)
                      }}
                    >
                      <Plus className="button-icon" />
                      <span>Añadir a mi evento</span>
                    </button>
                    <Link
                      to={`/chat/${serviceDetails.userDTO.id}`}
                      className="modal-button secondary-button"
                    >
                      <MessageCircle className="button-icon" />
                      <span>Chatear con proveedor</span>
                    </Link>
                  </>
                ) : (
                  <div className="unavailable-message modal-unavailable">
                    <Info className="info-icon" />
                    <span>Este servicio no está disponible actualmente</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OtherServiceScreenPublic

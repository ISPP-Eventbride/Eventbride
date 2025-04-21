/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import {
  Filter,
  X,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  CheckCircle,
} from "lucide-react"
import { Link } from "react-router-dom"
import "../../static/resources/css/OtherService.css"
import "../../static/resources/css/Alert.css"
import { useAlert } from "../../context/AlertContext"

const OtherServiceScreen = () => {
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
  const [isConfirming, setIsConfirming] = useState(false)
  const navigate = useNavigate();


  const currentUser = JSON.parse(localStorage.getItem("user"))
  const [jwtToken] = useState(localStorage.getItem("jwt"));

  const { showAlert } = useAlert()

  const getFilteredOtherServices = async () => {
    try {
      setLoading(true)
      const params = { name, city, type }
      const response = await axios.get(`/api/other-services/filter`, {
        params: params,
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      setOtherServices(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAllOtherServices = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/other-services", { headers: { Authorization: `Bearer ${jwtToken}` } })
      setOtherServices(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUserEvents = async () => {
    try {
      const response = await fetch(`/api/v1/events/next/${currentUser.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
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
          "Authorization": `Bearer ${jwtToken}`
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
      const response = await axios.get(`/api/other-services/${serviceId}`, { headers: { Authorization: `Bearer ${jwtToken}` } })
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

  const formatEventType = (type) => {
    switch (type) {
      case "WEDDING":
        return "Boda"
      case "CHRISTENING":
        return "Bautizo"
      case "COMMUNION":
        return "Comunión"
      default:
        return "Evento"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const combineDateAndTime = (eventDate, time) => {
    // Extrae la parte de la fecha sin convertir a Date
    const datePart = eventDate.split("T")[0];
    // Devuelve en formato ISO estándar usando "T" como separador
    return `${datePart}T${time}:00`;
  };

  const handleConfirmService = async (eventObj, selectedOtherServiceId) => {
    const times = venueTimes[eventObj.id] || {}
    if (!times.startTime || !times.endTime) {
      showAlert("Por favor, ingresa la hora de inicio y la hora de fin para este servicio.")
      return
    }

    const startDate = combineDateAndTime(eventObj.eventDate, times.startTime)
    const endDate = combineDateAndTime(eventObj.eventDate, times.endTime)

    setIsConfirming(true) // Bloquea clics múltiples
    try {
      await axios.put(`/api/event-properties/${eventObj.id}/add-otherservice/${selectedOtherServiceId}`, null, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      showAlert("¡Operación realizada con éxito!")
      setModalVisible(false)
    } catch (error) {
      console.error("Error al añadir el servicio:", error)
    } finally {
      setIsConfirming(false)
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

  return (
    <div className="services-container">
      <div className="services-header">
        <h1 className="services-title">Servicios para Eventos</h1>
      </div>

      {/* Categorías */}
      <div className="category-container">
        <button className={`category-button ${!category ? "active" : ""}`} onClick={() => handleCategoryClick(null)}>
          Todos los servicios
        </button>
        <button
          className={`category-button ${category === "CATERING" ? "active" : ""}`}
          onClick={() => handleCategoryClick("CATERING")}
        >
          Catering
        </button>
        <button
          className={`category-button ${category === "ENTERTAINMENT" ? "active" : ""}`}
          onClick={() => handleCategoryClick("ENTERTAINMENT")}
        >
          Entretenimiento
        </button>
        <button
          className={`category-button ${category === "DECORATION" ? "active" : ""}`}
          onClick={() => handleCategoryClick("DECORATION")}
        >
          Decoración
        </button>
      </div>

      {/* Filtros */}
      <button className="filter-toggle" onClick={toggleFilters}>
        <Filter size={18} />
        {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
        {filtersVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {filtersVisible && (
        <div className="filter-container">
          <h2 className="filter-title">Filtros disponibles</h2>
          <div className="filter-form">
            <div className="input-group">
              <label className="input-label">Nombre del servicio</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Catering Deluxe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
          </div>
          <div className="button-group">
            <button className="primary-button" onClick={getFilteredOtherServices}>
              <Filter size={16} />
              Aplicar filtros
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setName("")
                setCity("")
                getAllOtherServices()
              }}
            >
              <X size={16} />
              Borrar filtros
            </button>
          </div>
        </div>
      )}

      <h2 className="services-subtitle">
        {category ? `Servicios de ${formatServiceType(category)}` : "Todos los servicios disponibles"}
      </h2>

      {/* Grid de servicios */}
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      ) : otherServices.length === 0 ? (
        <div className="empty-state">
          <Info size={48} className="empty-icon" />
          <h2 className="empty-title">No se encontraron servicios</h2>
          <p className="empty-text">Intenta con otros filtros o categorías.</p>
        </div>
      ) : (
        <div className="services-grid">
          {otherServices.map((service) => {

            return (
              <div key={service.id} className="service-card" >
                <div className="card-header" style={{ cursor: "pointer" }} onClick={() => navigate(`/detallesOtherServices/${service.id}`)}>
                  <h3 className="service-title">{service.name}</h3>
                </div>
                <div className="card-body" style={{ cursor: "pointer" }} onClick={() => navigate(`/detallesOtherServices/${service.id}`)}>
                  {
                    service.userDTO?.plan === "PREMIUM" && <span className="service-badge premium-badge">Promocionado</span>
                  }
                  <span className="service-badge">{formatServiceType(service.otherServiceType)}</span>

                  <div className="service-info">
                    <MapPin size={18} className="info-icon" />
                    <span className="info-text">{service.cityAvailable}</span>
                  </div>

                  <div className="service-info">
                    <DollarSign size={18} className="info-icon" />
                    <span className="info-text">
                      {service.limitedByPricePerGuest
                        ? `${service.servicePricePerGuest}€ por invitado`
                        : service.limitedByPricePerHour
                          ? `${service.servicePricePerHour}€ por hora`
                          : `${service.fixedPrice}€ precio fijo`}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  {service.available ? (
                    <>
                      <button className="add-button" onClick={(e) => handleAddServiceClick(e, service.id)}>
                        <Plus size={16} />
                        Añadir a mi evento
                      </button>
                      <Link to={`/chat/${service.userDTO.id}`} className="chat-button">
                        💬 Chatear
                      </Link>
                    </>
                  ) : (
                    <div className="not-available-banner">No disponible</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal para seleccionar evento */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Selecciona un evento</h2>
            </div>
            <div className="modal-body">
              {events.length === 0 ? (
                <div className="empty-state" style={{ boxShadow: "none" }}>
                  <Info size={36} className="empty-icon" />
                  <p className="empty-text">Tus eventos ya tienen este servicio.</p>
                </div>
              ) : (
                events.map((eventObj) => (
                  <div key={eventObj.id} className="event-card">
                    <span className="event-badge">{eventObj.eventType}</span>
                    <h3 className="event-title" style={{ height: "10%", marginBottom: "10%" }}>{eventObj.name}</h3>

                    <div className="event-details">
                      <div className="event-detail">
                        <Calendar size={18} className="detail-icon" />
                        <span className="detail-text">{formatDate(eventObj.eventDate)}</span>
                      </div>

                      <div className="event-detail">
                        <Users size={18} className="detail-icon" />
                        <span className="detail-text">{eventObj.guests} invitados</span>
                      </div>
                    </div>

                    <div className="time-inputs">
                      <div className="time-group">
                        <label className="time-label">
                          <Clock size={16} className="detail-icon" />
                          Hora de inicio
                        </label>
                        <input
                          type="time"
                          className="time-input"
                          value={venueTimes[eventObj.id]?.startTime || ""}
                          onChange={(e) => handleTimeChange(eventObj.id, "startTime", e.target.value)}
                        />
                      </div>

                      <div className="time-group">
                        <label className="time-label">
                          <Clock size={16} className="detail-icon" />
                          Hora de fin
                        </label>
                        <input
                          type="time"
                          className="time-input"
                          value={venueTimes[eventObj.id]?.endTime || ""}
                          onChange={(e) => handleTimeChange(eventObj.id, "endTime", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="event-actions">
                      <button
                        className="primary-button"
                        style={{ flex: "1" }}
                        onClick={() => handleConfirmService(eventObj, selectedOtherServiceId)}
                        disabled={isConfirming}
                      >
                        <CheckCircle size={16} />
                        Confirmar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setModalVisible(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para detalles del servicio */}
      {serviceDetailsVisible && serviceDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{serviceDetails.name}</h2>
            </div>
            <div className="modal-body">
              <div className="service-details">
                <div className="details-section">
                  <span className="service-badge">{formatServiceType(serviceDetails.otherServiceType)}</span>

                  <div className="event-detail" style={{ marginTop: "1rem" }}>
                    <MapPin size={18} className="detail-icon" />
                    <span className="detail-text">Ciudad: {serviceDetails.cityAvailable}</span>
                  </div>

                  <div className="event-detail">
                    <DollarSign size={18} className="detail-icon" />
                    <span className="detail-text">
                      Precio:{" "}
                      {serviceDetails.limitedByPricePerGuest
                        ? `${serviceDetails.servicePricePerGuest}€ por invitado`
                        : serviceDetails.limitedByPricePerHour
                          ? `${serviceDetails.servicePricePerHour}€ por hora`
                          : `${serviceDetails.fixedPrice}€ precio fijo`}
                    </span>
                  </div>
                </div>

                <div className="details-section">
                  <span className="details-label">Descripción:</span>
                  <p className="details-text">{serviceDetails.description}</p>
                </div>

                {serviceDetails.extraInformation && (
                  <div className="details-section">
                    <span className="details-label">Información adicional:</span>
                    <p className="details-text">{serviceDetails.extraInformation}</p>
                  </div>
                )}
                <div className="card-info">
                  <span className="card-text">
                    <img style={{ height: "25%", width: "100%" }}
                      src={serviceDetails.picture || "https://iili.io/3Ywlapf.png"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://iili.io/3Ywlapf.png";
                      }}
                      alt="Imagen del servicio"></img>
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {serviceDetails.available &&
                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setServiceDetailsVisible(false);
                    handleAddServiceClick(e, serviceDetails.id);
                  }}
                >
                  <Plus size={16} />
                  Añadir a mi evento
                </button>}
              <button className="secondary-button" onClick={() => setServiceDetailsVisible(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OtherServiceScreen
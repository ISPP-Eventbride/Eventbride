"use client"

import { FaChevronLeft } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AlertCircle, Clock, MapPin, Users, DollarSign, Calendar, MessageCircle, X, Info } from "lucide-react"
import PaypalButtonTotal from "../../components/PaypalButtomTotal"
import "../../static/resources/css/EventDetails.css"
import { useAlert } from "../../context/AlertContext.jsx"

function EventDetails() {
  const [evento, setEvento] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState(null)
  const [isCostBreakdownModalOpen, setIsCostBreakdownModalOpen] = useState(false)
  const [isPaymentBreakdownModalOpen, setIsPaymentBreakdownModalOpen] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const { showAlert } = useAlert()
  const jwtToken = localStorage.getItem("jwt")
  const commissionRate = 1.05
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedGuests, setEditedGuests] = useState(0)
  const [editedEventType, setEditedEventType] = useState("")

  function getEvents() {
    setIsLoading(true)
    fetch(`/api/v1/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvento(data)
        setIsLoading(false)
        return fetch(`/api/payment/${data.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        })
      })
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch((err) => {
        console.error(err)
        setPayments([])
        setIsLoading(false)
      })
  }

  useEffect(() => {
    getEvents()
  }, [id])

  useEffect(() => {
    if (evento) {
      setEditedName(evento.name)
      setEditedGuests(evento.guests)
      setEditedEventType(evento.eventType)
    }
  }, [evento])

  const deleteEvent = () => {
    fetch(`/api/v1/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => {
        if (res.ok) navigate("/")
        else throw new Error()
      })
      .catch(() => showAlert("No puedes eliminar un evento con algún servicio pagado."))
  }

  const updateEvent = () => {
    fetch(`/api/v1/events/updateEventDetails/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        eventType: editedEventType,
        guests: editedGuests,
        name: editedName,
      }),
    })
      .then((res) => {
        if (res.ok) {
          getEvents()
          setIsEditing(false)
          showAlert("Evento actualizado correctamente")
        } else {
          throw new Error()
        }
      })
      .catch(() => showAlert("Error al actualizar el evento"))
  }

  const solicitarServicio = (propId) => {
    fetch(`/api/event-properties/status/pending/${propId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => {
        if (res.ok) getEvents()
      })
      .catch((err) => console.error(err))
  }

  const deleteEventProperty = (propId) => {
    setIsLoading(true)
    fetch(`/api/event-properties/client/${propId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        getEvents()
      })
      .catch(() => showAlert("Error al eliminar el servicio."))
      .finally(() => {
        setIsLoading(false)
        setIsDeletePropertyModalOpen(false)
      })
  }

  const decodeText = (text) => {
    try {
      return decodeURIComponent(escape(text))
    } catch {
      return text
    }
  }

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const getPaymentStatusText = (status) =>
    ({
      PENDING: "Pendiente",
      APPROVED: "Pagar reserva",
      DEPOSIT_PAID: "Completar pago",
      COMPLETED: "Servicio pagado",
      CANCELLED: "Servicio cancelado",
    })[status] || "Pagar"

  if (isLoading) {
    return (
      <div className="ed-loading-container">
        <div className="ed-loading-spinner" />
        <p className="ed-loading-text">Cargando detalles del evento...</p>
        <p className="ed-loading-subtext">Espere mientras obtenemos la información...</p>
      </div>
    )
  }
  if (!evento) {
    return (
      <div className="ed-container">
        <div className="ed-empty-container">
          <div className="ed-empty-icon-container">
            <Info className="ed-empty-icon" />
          </div>
          <h3 className="ed-empty-title">No se encontró el evento</h3>
          <p className="ed-empty-text">No pudimos encontrar el evento solicitado.</p>
          <button className="ed-reset-button" onClick={() => navigate("/")}>
            <FaChevronLeft className="ed-button-icon" />
            Volver a eventos
          </button>
        </div>
      </div>
    )
  }

  const recintos = evento.eventPropertiesDTO.filter((p) => p.venueDTO)
  const servicios = evento.eventPropertiesDTO.filter((p) => p.otherServiceDTO)

  const sumaCoste = () => evento.eventPropertiesDTO.reduce((sum, p) => sum + (p.setPricePerService || 0), 0)
  const sumaPagado = () => payments.reduce((sum, p) => sum + (p.amount || 0) / commissionRate, 0)

  const depositItems = evento.eventPropertiesDTO
    .filter((p) => p.status === "APPROVED")
    .map((p) => ({ id: p.id, amount: p.depositAmount }))

  const restItems = evento.eventPropertiesDTO
    .filter((p) => p.status === "DEPOSIT_PAID")
    .map((p) => ({ id: p.id, amount: p.setPricePerService - p.depositAmount }))

  const needDeposit = depositItems.length > 0

  return (
    <>
      <div className="ed-container">
        {/* Header */}
        <div className="ed-header">
          <div className="ed-header-content">
            <div className="ed-title-row">
              <Link className="ed-back-link" to="/events">
                <FaChevronLeft />
              </Link>
              <h1 className="ed-title">Detalles del Evento</h1>
            </div>
            {isEditing ? (
              <div
                className="ed-edit-form"
                style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Nombre del evento:
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Número de invitados:
                  </label>
                  <input
                    type="number"
                    value={editedGuests}
                    onChange={(e) => setEditedGuests(Number.parseInt(e.target.value))}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Tipo de evento:</label>
                  <select
                    value={editedEventType}
                    onChange={(e) => setEditedEventType(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="WEDDING">Boda</option>
                    <option value="COMMUNION">Comunión</option>
                    <option value="CHRISTENING">Bautizo</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: "8px 16px",
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: "red",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={updateEvent}
                    style={{
                      padding: "8px 16px",
                      background: "#4a90e2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            ) : (
              <h2 className="ed-event-name">{decodeText(evento.name)}</h2>
            )}
          </div>
        </div>

        {/* Delete button - moved here */}
        <div className="ed-delete-button-container">
          <button className="ed-delete-button" style={{justifyContent:"center"}} onClick={() => setIsDeleteModalOpen(true)}>
            <X className="ed-button-icon" />
            <span>Eliminar evento</span>
          </button>
        </div>
        <div className="ed-delete-button-container">
          {!isEditing && (
            <button
              className="ed-edit-button"
              onClick={() => setIsEditing(true)}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                background: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Editar detalles
            </button>
          )}
        </div>

        {/* Advertencia */}
        {(evento.eventType === "WEDDING" || evento.eventType === "COMMUNION") && sumaPagado() < sumaCoste() && (
          <div className="ed-warning">
            <AlertCircle size={20} className="ed-warning-icon" />
            <span>
              Fecha límite de pago{" "}
              <b>{evento.eventType === "WEDDING" ? 3 : evento.eventType === "COMMUNION" ? 2 : 0}</b> meses antes del
              evento.
            </span>
          </div>
        )}

        {/* Información del evento */}
        <div className="ed-info-card">
          <div className="ed-info">
            <div className="ed-info-item">
              <Calendar className="ed-info-icon" />
              <div className="ed-info-content">
                <p className="ed-info-label">Fecha</p>
                <p className="ed-info-value">{formatearFecha(evento.eventDate)}</p>
              </div>
            </div>
            <div className="ed-info-item">
              <Users className="ed-info-icon" />
              <div className="ed-info-content">
                <p className="ed-info-label">Invitados</p>
                <p className="ed-info-value">{evento.guests}</p>
              </div>
            </div>
            <div className="ed-info-item">
              <DollarSign className="ed-info-icon" />
              <div className="ed-info-content">
                <p className="ed-info-label">Coste acumulado</p>
                <p className="ed-info-value">
                  <span className="ed-clickable-text" onClick={() => setIsCostBreakdownModalOpen(true)}>
                    {sumaCoste().toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </p>
              </div>
            </div>
            <div className="ed-info-item">
              <DollarSign className="ed-info-icon" />
              <div className="ed-info-content">
                <p className="ed-info-label">Pagado</p>
                <p className="ed-info-value">
                  <span className="ed-clickable-text--success" onClick={() => setIsPaymentBreakdownModalOpen(true)}>
                    {sumaPagado().toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de recintos */}
        <div className="ed-section">
          <h2 className="ed-section-title">Recinto contratado</h2>
          <div className="ed-cards-container">
            {recintos.length ? (
              recintos.map((p) => (
                <div key={p.id} className="ed-property-card ed-hover-shadow">
                  <div className="ed-venue-header">
                    <h3 className="ed-venue-name">{decodeText(p.venueDTO.name)}</h3>
                    <div className="ed-status-indicator">
                      <span className={`ed-status-dot ed-status-dot--${p.status.toLowerCase()}`}></span>
                      <span className="ed-status-text">{p.status === "COMPLETED" ? "Pagado" : "En proceso"}</span>
                    </div>
                  </div>

                  <div className="ed-venue-content">
                    <div className="ed-venue-image-container">
                      <img
                        className="ed-venue-image"
                        src={p.venueDTO.picture || "https://iili.io/3EpzvZx.png"}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://iili.io/3EpzvZx.png"
                        }}
                        alt={p.venueDTO.name}
                      />
                      <div className="ed-venue-image-overlay"></div>
                    </div>

                    <div className="ed-venue-details">
                      <div className="ed-details-grid">
                        <div className="ed-detail-item">
                          <MapPin className="ed-detail-icon" />
                          <div className="ed-detail-content">
                            <p className="ed-detail-label">Ubicación</p>
                            <p className="ed-detail-value">{decodeText(p.venueDTO.address)}</p>
                          </div>
                        </div>
                        <div className="ed-detail-item">
                          <Clock className="ed-detail-icon" />
                          <div className="ed-detail-content">
                            <p className="ed-detail-label">Horas</p>
                            <p className="ed-detail-value">
                              {p.startTime.slice(0, 5)} - {p.finishTime.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ed-venue-actions">
                    <button
                      className={`ed-action-button ed-add-button ${["PENDING", "COMPLETED"].includes(p.status) ? "ed-button-disabled" : ""
                        }`}
                      disabled={["PENDING", "COMPLETED"].includes(p.status)}
                      onClick={() =>
                        p.status === "CANCELLED" ? solicitarServicio(p.id) : navigate(`/payment/${p.id}`)
                      }
                    >
                      <DollarSign className="ed-button-icon" />
                      <span>{getPaymentStatusText(p.status)}</span>
                    </button>
                    <Link className="ed-action-button ed-chat-button" to={`/chat/${p.venueDTO.userDTO.id}`}>
                      <MessageCircle className="ed-button-icon" />
                      <span>Chatear</span>
                    </Link>
                    <button
                      className="ed-action-button ed-delete-property-button"
                      onClick={() => {
                        setPropertyToDelete(p.id)
                        setIsDeletePropertyModalOpen(true)
                      }}
                    >
                      <X className="ed-button-icon" />
                      <span>Eliminar recinto</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="ed-empty-container">
                <div className="ed-empty-icon-container">
                  <Info className="ed-empty-icon" />
                </div>
                <h3 className="ed-empty-title">No hay recintos contratados</h3>
                <p className="ed-empty-text">Aún no has contratado ningún recinto para este evento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de servicios */}
        <div className="ed-section">
          <h2 className="ed-section-title">Otros servicios contratados</h2>
          <div className="ed-services-grid">
            {servicios.length ? (
              servicios.map((p) => (
                <div key={p.id} className="ed-property-card ed-hover-shadow">
                  {/* Imagen del servicio */}
                  <div className="ed-service-image-container">
                    <img
                      className="ed-service-image"
                      src={p.otherServiceDTO.picture || "https://iili.io/3EpzvZx.png"}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://iili.io/3EpzvZx.png"
                      }}
                      alt={p.otherServiceDTO.name}
                    />
                    <div className="ed-service-image-overlay"></div>
                  </div>

                  <div className="ed-service-header">
                    <h3 className="ed-service-name">{decodeText(p.otherServiceDTO.name)}</h3>
                    <div className="ed-status-indicator">
                      <span className={`ed-status-dot ed-status-dot--${p.status.toLowerCase()}`}></span>
                      <span className="ed-status-text">{p.status === "COMPLETED" ? "Pagado" : "En proceso"}</span>
                    </div>
                  </div>

                  <div className="ed-service-content">
                    <div className="ed-details-grid">
                      <div className="ed-detail-item">
                        <Info className="ed-detail-icon" />
                        <div className="ed-detail-content">
                          <p className="ed-detail-label">Descripción</p>
                          <p className="ed-detail-value">{decodeText(p.otherServiceDTO.description)}</p>
                        </div>
                      </div>
                      <div className="ed-detail-item">
                        <Clock className="ed-detail-icon" />
                        <div className="ed-detail-content">
                          <p className="ed-detail-label">Horas</p>
                          <p className="ed-detail-value">
                            {p.startTime.slice(0, 5)} - {p.finishTime.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ed-service-actions">
                    <button
                      className={`ed-action-button ed-add-button ${["PENDING", "COMPLETED"].includes(p.status) ? "ed-button-disabled" : ""
                        }`}
                      disabled={["PENDING", "COMPLETED"].includes(p.status)}
                      onClick={() =>
                        p.status === "CANCELLED" ? solicitarServicio(p.id) : navigate(`/payment/${p.id}`)
                      }
                    >
                      <DollarSign className="ed-button-icon" />
                      <span>{getPaymentStatusText(p.status)}</span>
                    </button>
                    <Link className="ed-action-button ed-chat-button" to={`/chat/${p.otherServiceDTO.userDTO.id}`}>
                      <MessageCircle className="ed-button-icon" />
                      <span>Chatear</span>
                    </Link>
                    <button
                      className="ed-action-button ed-delete-property-button"
                      onClick={() => {
                        setPropertyToDelete(p.id)
                        setIsDeletePropertyModalOpen(true)
                      }}
                    >
                      <X className="ed-button-icon" />
                      <span>Eliminar servicio</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="ed-empty-container">
                <div className="ed-empty-icon-container">
                  <Info className="ed-empty-icon" />
                </div>
                <h3 className="ed-empty-title">No hay servicios adicionales</h3>
                <p className="ed-empty-text">Aún no has contratado ningún servicio adicional para este evento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de pago */}
        <div className="ed-payment-summary">
          <h2 className="ed-section-title">Resumen del pago</h2>
          <div className="ed-summary-card">
            <div className="ed-summary-content">
              {(needDeposit ? depositItems : restItems).map(({ id, amount }) => (
                <div key={id} className="ed-summary-item">
                  <span>
                    {evento.eventPropertiesDTO.find((p) => p.id === id).venueDTO?.name ||
                      evento.eventPropertiesDTO.find((p) => p.id === id).otherServiceDTO?.name}
                  </span>
                  <span className="ed-price">
                    {amount.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              ))}
              <div className="ed-summary-item">
                <span>Gastos de gestión: {((commissionRate - 1) * 100).toFixed(0)}%</span>
                <span className="ed-price">
                  {(
                    (needDeposit
                      ? depositItems.reduce((s, i) => s + i.amount, 0)
                      : restItems.reduce((s, i) => s + i.amount, 0)) *
                    (commissionRate - 1)
                  ).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="ed-separator" />
              <div className="ed-summary-item ed-summary-item--total">
                <span>Total</span>
                <span className="ed-price">
                  {(
                    (needDeposit
                      ? depositItems.reduce((s, i) => s + i.amount, 0)
                      : restItems.reduce((s, i) => s + i.amount, 0)) * commissionRate
                  ).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de pago */}
        <div className="ed-payment-container">
          <div className="ed-payment-button-container">
            <div className="ed-paypal-container">
              <h3 className="ed-payment-method-title">Pagar con</h3>
              <PaypalButtonTotal
                amount={
                  needDeposit
                    ? depositItems.reduce((s, i) => s + i.amount, 0)
                    : restItems.reduce((s, i) => s + i.amount, 0)
                }
                paymentType={needDeposit ? "DEPOSITO PARA RESERVA" : "FINAL"}
                eventPropsIds={needDeposit ? depositItems.map((i) => i.id) : restItems.map((i) => i.id)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de desglose de precios */}
      {isCostBreakdownModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsCostBreakdownModalOpen(false)}>
          <div className="ed-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2 className="ed-modal-title">Desglose de precios</h2>
              <button className="ed-modal-close-button" onClick={() => setIsCostBreakdownModalOpen(false)}>
                <X className="ed-close-icon" />
              </button>
            </div>

            <div className="ed-modal-content">
              <div className="ed-modal-section">
                <h3 className="ed-section-title">
                  Costes servicios:{" "}
                  {sumaCoste().toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </h3>
                <div className="ed-price-breakdown">
                  {evento.eventPropertiesDTO.map((p, i) => (
                    <div key={i} className="ed-price-breakdown-item">
                      <strong>{p.venueDTO ? decodeText(p.venueDTO.name) : decodeText(p.otherServiceDTO.name)}</strong>:{" "}
                      {p.setPricePerService.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ed-modal-actions">
              <button
                className="ed-modal-button ed-secondary-button"
                onClick={() => setIsCostBreakdownModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de desglose de pagos */}
      {isPaymentBreakdownModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsPaymentBreakdownModalOpen(false)}>
          <div className="ed-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2 className="ed-modal-title">Desglose de pagos</h2>
              <button className="ed-modal-close-button" onClick={() => setIsPaymentBreakdownModalOpen(false)}>
                <X className="ed-close-icon" />
              </button>
            </div>

            <div className="ed-modal-content">
              <div className="ed-modal-section">
                <div className="ed-payments-breakdown">
                  {evento.eventPropertiesDTO.map((p, i) => {
                    const pagos = payments.filter((pay) => pay.eventPropertiesId === p.id)
                    const totalRem = pagos
                      .filter((pay) => pay.paymentType === "REMAINING")
                      .reduce((s, pay) => s + pay.amount / commissionRate, 0)
                    const totalDep = pagos
                      .filter((pay) => pay.paymentType === "DEPOSIT")
                      .reduce((s, pay) => s + pay.amount / commissionRate, 0)
                    return (
                      <div key={i} className="ed-payment-breakdown-item">
                        <h4 className="ed-service-name">
                          {p.venueDTO ? decodeText(p.venueDTO.name) : decodeText(p.otherServiceDTO.name)}
                        </h4>
                        <div className="ed-payment-details">
                          <div className="ed-payment-detail">
                            <span className="ed-payment-label">Total:</span>
                            <span className="ed-payment-value">
                              {totalRem > 0
                                ? totalRem.toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                })
                                : "Sin pagar"}
                            </span>
                          </div>
                          <div className="ed-payment-detail">
                            <span className="ed-payment-label">Señal:</span>
                            <span className="ed-payment-value">
                              {totalDep > 0
                                ? totalDep.toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                })
                                : "Sin pagar"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="ed-modal-actions">
              <button
                className="ed-modal-button ed-secondary-button"
                onClick={() => setIsPaymentBreakdownModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminar evento */}
      {isDeleteModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="ed-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2 className="ed-modal-title">¿Eliminar este evento?</h2>
              <button className="ed-modal-close-button" onClick={() => setIsDeleteModalOpen(false)}>
                <X className="ed-close-icon" />
              </button>
            </div>

            <div className="ed-modal-content">
              <p className="ed-modal-description">Esta acción no se puede deshacer.</p>
            </div>

            <div className="ed-modal-actions">
              <button className="ed-modal-button ed-secondary-button" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
              <button className="ed-modal-button ed-primary-button" onClick={deleteEvent}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminar propiedad */}
      {isDeletePropertyModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsDeletePropertyModalOpen(false)}>
          <div className="ed-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2 className="ed-modal-title">
                ¿Eliminar este {recintos.some((p) => p.id === propertyToDelete) ? "recinto" : "servicio"}?
              </h2>
              <button className="ed-modal-close-button" onClick={() => setIsDeletePropertyModalOpen(false)}>
                <X className="ed-close-icon" />
              </button>
            </div>

            <div className="ed-modal-content">
              <p className="ed-modal-description">
                Esta acción no se puede deshacer.{" "}
                <strong>
                  {decodeText(
                    recintos.find((p) => p.id === propertyToDelete)?.venueDTO?.name ||
                    servicios.find((p) => p.id === propertyToDelete)?.otherServiceDTO?.name ||
                    "",
                  )}
                </strong>{" "}
                se eliminará.
              </p>
            </div>

            <div className="ed-modal-actions">
              <button
                className="ed-modal-button ed-secondary-button"
                onClick={() => setIsDeletePropertyModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="ed-modal-button ed-primary-button"
                onClick={() => deleteEventProperty(propertyToDelete)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventDetails
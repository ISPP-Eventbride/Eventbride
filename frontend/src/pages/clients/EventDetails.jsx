"use client"
import { FaChevronLeft } from "react-icons/fa";

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../../static/resources/css/EventDetails.css"
import PaypalButtonTotal from "../../components/PaypalButtomTotal";
import "../../static/resources/css/OtherService.css"
import { Link } from "react-router-dom"
import { AlertCircle } from "lucide-react";
import { useAlert } from "../../context/AlertContext.jsx"


function EventDetails() {
  const [evento, setEvento] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isCostBreakdownModalOpen, setIsCostBreakdownModalOpen] = useState(false);
  const [isPaymentBreakdownModalOpen, setIsPaymentBreakdownModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)
  const commissionRate = 1.05; // Comisión del 5%
  const [jwtToken] = useState(localStorage.getItem("jwt"));
  const [payments, setPayments] = useState([]);

  const { showAlert } = useAlert()

  // Función para obtener los datos del evento
  function getEvents() {
    setIsLoading(true);

    fetch(`/api/v1/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setEvento(data);
        setIsLoading(false);

        fetch(`/api/payment/${data.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => {
            setPayments(data);
          })
          .catch((error) => {
            console.error("Error obteniendo pagos:", error);
            setPayments([]);
          });
      })
      .catch((error) => {
        console.error("Error obteniendo evento:", error);
        setIsLoading(false);
      });
  }


  // Función para eliminar el evento
  function deleteEvent() {
    fetch(`/api/v1/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Evento eliminado correctamente")
          navigate("/")
        } else {
          console.error("Error al eliminar el evento")
          showAlert("Error al eliminar el evento. No puedes eliminar un evento con algún servicio pagado.")
        }
      })
      .catch((error) => console.error("Error eliminando evento:", error))
  }

  // Abrir y cerrar modales
  const openModal = () => setIsDeleteModalOpen(true)
  const closeModal = () => setIsDeleteModalOpen(false)
  const openCostBreakdownModal = () => setIsCostBreakdownModalOpen(true);
  const closeCostBreakdownModal = () => setIsCostBreakdownModalOpen(false);
  const openPaymentBreakdownModal = () => setIsPaymentBreakdownModalOpen(true);
  const closePaymentBreakdownModal = () => setIsPaymentBreakdownModalOpen(false);

  // Abrir modal de confirmación para eliminar propiedad
  const openDeletePropertyModal = (propertyId) => {
    setPropertyToDelete(propertyId)
    setIsDeletePropertyModalOpen(true)
  }

  // Cerrar modal de confirmación para eliminar propiedad
  const closeDeletePropertyModal = () => {
    setIsDeletePropertyModalOpen(false)
    setPropertyToDelete(null)
  }

  // Función para solicitar servicio
  const solicitarServicio = (eventPropertiesId) => {
    fetch(`/api/event-properties/status/pending/${eventPropertiesId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "PUT",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Servicio solicitado correctamente");
          getEvents();
        } else {
          console.error("Error al solicitar el servicio");
        }
      })
      .catch((error) => console.error("Error solicitando el servicio:", error));
  };

  const deleteEventProperty = (eventPropertiesId) => {
    setIsLoading(true)

    fetch(`/api/event-properties/client/${eventPropertiesId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error status: ${response.status}`)
        }
        console.log("Servicio eliminado correctamente")
        getEvents()
      })
      .catch((error) => {
        console.error("Error eliminando el servicio:", error)
        showAlert("Error al eliminar el servicio. Por favor, inténtelo de nuevo.")
      })
      .finally(() => {
        setIsLoading(false)
        closeDeletePropertyModal()
      })
  }

  // Confirmar eliminación de propiedad
  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      deleteEventProperty(propertyToDelete)
    }
  }

  // Cargar evento al montar el componente
  useEffect(() => {
    getEvents()
  }, [id])

  // Convertir tipo de evento a español
  const tipoDeEvento = (type) => {
    switch (type) {
      case "WEDDING":
        return "Boda"
      case "CHRISTENING":
        return "Bautizo"
      case "COMMUNION":
        return "Comunión"
      default:
        return "Evento desconocido"
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const opciones = { year: "numeric", month: "long", day: "numeric" }
    return new Date(fecha).toLocaleDateString("es-ES", opciones)
  }

  // Decodificar texto
  const decodeText = (text) => {
    try {
      return decodeURIComponent(escape(text))
    } catch {
      return text
    }
  }

  // Texto para el estado de pago
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendiente de aprobación"
      case "APPROVED":
        return "Pagar reserva"
      case "DEPOSIT_PAID":
        return "Completar pago"
      case "COMPLETED":
        return "Servicio pagado"
      case "CANCELLED":
        return "Servicio cancelado, volver a solicitar"
      default:
        return "Pagar"
    }
  }

  // Función para comprobar si la reserva ha expirado según el tipo de evento
  const isReservaExpired = () => {
    if (!evento || !evento.eventDate) return false;
    const eventDate = new Date(evento.eventDate);
    const currentDate = new Date();
    let threshold; // en meses
    switch (evento.eventType) {
      case "WEDDING":
        threshold = 3;
        break;
      case "COMMUNION":
        threshold = 2;
        break;
      case "CHRISTENING":
        threshold = 0;
        break;
      default:
        threshold = 0;
    }
    // Cálculo aproximado en meses (1 mes ≈ 30 días)
    const diffInDays = (eventDate - currentDate) / (1000 * 60 * 60 * 24);
    const diffInMonths = diffInDays / 30;
    return diffInMonths < threshold;
  }

  // Obtener el nombre del servicio o recinto a eliminar
  const getPropertyName = () => {
    if (!propertyToDelete || !evento || !evento.eventPropertiesDTO) return ""

    const property = evento.eventPropertiesDTO.find((prop) => prop.id === propertyToDelete)
    if (!property) return ""

    if (property.venueDTO) {
      return decodeText(property.venueDTO.name)
    } else if (property.otherServiceDTO) {
      return decodeText(property.otherServiceDTO.name)
    }

    return ""
  }

  // Determinar si el servicio a eliminar es un recinto o un servicio
  const isVenue = () => {
    if (!propertyToDelete || !evento || !evento.eventPropertiesDTO) return false

    const property = evento.eventPropertiesDTO.find((prop) => prop.id === propertyToDelete)
    return property && property.venueDTO
  }

  // Renderizar carga o mensaje de evento no encontrado
  if (isLoading) {
    return (
      <div className="event-contain loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando detalles del evento...</p>
      </div>
    )
  }
  if (!evento) {
    return (
      <div className="event-contain">
        <div className="no-event">
          <h2>No se encontró el evento</h2>
          <button className="back-button" onClick={() => navigate("/")}>
            Volver a eventos
          </button>
        </div>
      </div>
    )
  }

  // Cálculos de costes
  const calcularCosteServicios = () => {
    if (!evento || !evento.eventPropertiesDTO) return 0;
    return evento.eventPropertiesDTO.reduce((total, prop) => total + (prop.setPricePerService || 0), 0);
  };
  const calcularDepositServicios = () => {
    if (!evento || !evento.eventPropertiesDTO) return 0;
    return evento.eventPropertiesDTO.reduce((total, prop) => total + (prop.depositAmount || 0), 0);
  };
  const sumaCosteTotalDeposit = () => {
    if (!evento || !evento.eventPropertiesDTO) return 0;
    return evento.eventPropertiesDTO.reduce((total, prop) => total + (prop.setPricePerService || 0), 0);
  };

  const sumaPagado = () => {
    if (!evento || !evento.eventPropertiesDTO) return 0.0;

    let amount = 0.0;

    payments.forEach((pago) => {
      const sinImpuestos = (pago.amount || 0.0) / 1.05;
      amount += sinImpuestos;
    });

    return amount;
  };

  const reservarOPagarServicios = () => {
    if (!evento || !Array.isArray(evento.eventPropertiesDTO)) return null;
    const estados = evento.eventPropertiesDTO.map(prop =>
      prop.status?.trim().toUpperCase()
    );
    const todosSonFinales = estados.every(status =>
      status === 'PENDING' || status === 'COMPLETED' || status === 'CANCELLED'
    );
    if (todosSonFinales) return null;
    return estados.includes('APPROVED');
  };

  const obtenerDepositosActivos = () => {
    if (!evento || !evento.eventPropertiesDTO) return 0;
    const depositos = {};
    evento.eventPropertiesDTO.forEach((evenProp) => {
      if (evenProp.status === "APPROVED") {
        depositos[evenProp.id] = evenProp.depositAmount;
      }
    });
    return depositos;
  };

  const obetenerTotales = () => {
    if (!evento || !evento.eventPropertiesDTO) return null;
    const totales = {};
    evento.eventPropertiesDTO.forEach((evenProp) => {
      if (evenProp.status === "DEPOSIT_PAID") {
        totales[evenProp.id] = evenProp.pricePerService - evenProp.depositAmount;
      }
    });
    return totales;
  };

  // Determinar los meses límite de pago según el tipo de evento
  const getMesesLimitePago = () => {
    switch (evento?.eventType) {
      case "WEDDING":
        return 3;
      case "COMMUNION":
        return 2;
      case "CHRISTENING":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <>
      <div className="event-contain">
        <div className="event-details">
          <div className="event-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="event-title-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                <span className="event-type-badge">{tipoDeEvento(evento?.eventType)}</span>
                <Link
                  to="/events"
                  title="volver a servicios"
                  className="btn-primary"
                  style={{ backgroundColor: "transparent", color: "black", padding: 0, marginBottom: "1.3vh", marginRight: "1vh" }}
                >
                  <FaChevronLeft />
                </Link>
                <h2 style={{ height: "60%" }} className="event-title">Detalles del Evento</h2>
              </div>
              <h3 style={{ fontSize: "150%" }}>{evento?.name}</h3>
            </div>

            {sumaPagado() <= 0 && (
              <button className="delete-button" style={{ maxWidth: "10%", marginLeft: "auto" }} onClick={openModal}>
                <i className="delete-icon">✕</i>
                <span>Eliminar</span>
              </button>
            )}
          </div>


          {(evento.eventType === "WEDDING" || evento.eventType === "COMMUNION") && (
            <div className="warning-message" style={{ marginTop: "1rem" }}>
              <AlertCircle size={20} className="mr-2" />
              La fecha límite de pago de la reserva es antes de&nbsp;
              <b>{getMesesLimitePago()}</b> &nbsp;mes(es) del evento.
              <br />
            </div>
          )}


          <div className="event-info-card">
            <div className="event-info">
              <div className="info-item">
                <span className="info-label">Fecha:</span>
                <p className="event-date">{formatearFecha(evento?.eventDate)}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Invitados estimados:</span>
                <p className="event-guests">{evento?.guests}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Coste acumulado:</span>
                <p className="event-budget">
                  <u
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={openCostBreakdownModal}
                  >
                    {sumaCosteTotalDeposit().toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </u>
                </p>
              </div>
              <div className="info-item">
                <span className="info-label">Pagado:</span>
                <p className="event-budget">
                  <u
                    style={{ cursor: "pointer", color: "green" }}
                    onClick={openPaymentBreakdownModal}
                  >
                    {sumaPagado().toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </u>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="event-properties-container">
          <div className="event-venues">
            <h3 className="section-title">Recinto contratado</h3>
            {evento?.eventPropertiesDTO?.some((prop) => prop.venueDTO) ? (
              evento.eventPropertiesDTO.map((prop, i) =>
                prop.venueDTO ? (
                  <div key={i} className="venue-card">
                    <div className="card-header" style={{ backgroundColor: "#d9be75" }}>
                      <h4 className="venue-name">{decodeText(prop.venueDTO.name)}</h4>
                    </div>
                    <div className="service-image-container">
                      <img
                        className="service-image"
                        src={prop.venueDTO.picture || "https://iili.io/3EpzvZx.png"}
                        alt={prop.venueDTO.name}
                        style={{
                          objectFit: "cover",
                          maxHeight: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      />
                    </div>
                    <div className="venue-details">
                      <p className="venue-address">
                        <span className="detail-label">Ubicación:</span>
                        {decodeText(prop.venueDTO.address)}
                      </p>
                    </div>
                    <div className="venue-details">
                      <p className="venue-description">
                        <span className="detail-label">Horario contratado:</span>
                        {decodeText(prop.startTime).split(":").slice(0, 2).join(":")} -{" "}

                        {decodeText(prop.finishTime).split(":").slice(0, 2).join(":")}
                      </p>
                    </div>
                    <div className="payment-container" style={{ width: "200px" }}>
                      {prop.status === "APPROVED" && isReservaExpired() ? (
                        <button
                          className="payment-button expired"
                          disabled
                          style={{
                            backgroundColor: "red",
                            width: "100px",
                            height: "100px"
                          }}
                        >
                          Fecha expirada
                        </button>
                      ) : (
                        <>
                          <button
                            className={`payment-button ${(["PENDING", "COMPLETED"].includes(prop.status)) ? "disabled" : ""}`}
                            disabled={["PENDING", "COMPLETED"].includes(prop.status)}
                            onClick={() => {
                              if (prop.status === "CANCELLED") {
                                solicitarServicio(prop.id);
                                return;
                              } else {
                                navigate(`/payment/${prop.id}`);
                              }
                            }}
                            style={{
                              backgroundColor: prop.status === "DEPOSIT_PAID" ? "green" : "#d9be75"
                            }}
                          >
                            {getPaymentStatusText(prop.status)}
                          </button>
                          <div>
                            <Link to={`/chat/${prop.venueDTO.userDTO.id}`} className="chat-button">
                              💬 Chatear
                            </Link>
                          </div>
                        </>
                      )}
                      {(prop.status === "PENDING" || prop.status === "APPROVED" || prop.status === "CANCELLED") && (
                        <button className="delete-property-button" onClick={() => openDeletePropertyModal(prop.id)}>
                          <i className="delete-property-icon">✕</i>
                          Eliminar recinto
                        </button>
                      )}
                      <div className="status-indicator">
                        <span className={`status-dot status-${prop.status.toLowerCase()}`}></span>
                        <span className="status-text">{prop.status === "COMPLETED" ? "Pagado" : "En proceso"}</span>
                      </div>
                    </div>
                  </div>
                ) : null,
              )
            ) : (
              <div className="empty-state">
                <p>No hay recintos contratados</p>
              </div>
            )}
          </div>
          <div className="event-services">
            <h3 className="section-title">Otros servicios contratados</h3>
            {evento?.eventPropertiesDTO?.some((prop) => prop.otherServiceDTO) ? (
              evento.eventPropertiesDTO.map((prop, i) =>
                prop.otherServiceDTO ? (
                  <div key={i} className="venue-card">
                    <div className="card-header" style={{ backgroundColor: "#d9be75" }}>
                      <h4 className="service-name">{decodeText(prop.otherServiceDTO.name)}</h4>
                    </div>
                    <div className="service-image-container" style={{ objectFit: "cover", maxHeight: "100%" }}>
                      <img
                        className="service-image"
                        src={prop.otherServiceDTO.picture || "https://iili.io/3EpzvZx.png"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://iili.io/3EpzvZx.png";
                        }}
                        alt="Imagen del servicio"
                        style={{
                          objectFit: "cover",
                          maxHeight: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      />
                    </div>
                    <div className="venue-details">
                      <p className="venue-description">
                        <span className="detail-label">Descripción:</span>
                        {decodeText(prop.otherServiceDTO.description)}
                      </p>
                    </div>
                    <div className="venue-details">
                      <p className="venue-description">
                        <span className="detail-label">Horario contratado:</span>
                        {decodeText(prop.startTime).split(":").slice(0, 2).join(":")} -
                        {decodeText(prop.finishTime).split(":").slice(0, 2).join(":")}
                      </p>
                    </div>
                    <div className="payment-container" style={{ width: "200px" }}>
                      {prop.status === "APPROVED" && isReservaExpired() ? (
                        <button
                          className="payment-button expired"
                          disabled
                          style={{
                            backgroundColor: "red",
                            width: "100px",
                            height: "100px"
                          }}
                        >
                          Fecha expirada
                        </button>
                      ) : (
                        <>
                          <button
                            className={`payment-button ${(["PENDING", "COMPLETED"].includes(prop.status)) ? "disabled" : ""}`}
                            disabled={["PENDING", "COMPLETED"].includes(prop.status)}
                            onClick={() => {
                              if (prop.status === "CANCELLED") {
                                solicitarServicio(prop.id);
                                return;
                              } else {
                                navigate(`/payment/${prop.id}`);
                              }
                            }}
                            style={{
                              backgroundColor: prop.status === "DEPOSIT_PAID" ? "green" : "#d9be75"
                            }}
                          >
                            {getPaymentStatusText(prop.status)}
                          </button>
                          <div>
                            <Link to={`/chat/${prop.otherServiceDTO.userDTO.id}`} className="chat-button">
                              💬 Chatear
                            </Link>
                          </div>
                        </>
                      )}
                      {(prop.status === "PENDING" || prop.status === "APPROVED" || prop.status === "CANCELLED") && (
                        <button className="delete-property-button" onClick={() => openDeletePropertyModal(prop.id)}>
                          <i className="delete-property-icon">✕</i>
                          Eliminar servicio
                        </button>
                      )}
                      <div className="status-indicator">
                        <span className={`status-dot status-${prop.status.toLowerCase()}`}></span>
                        <span className="status-text">{prop.status === "COMPLETED" ? "Pagado" : "En proceso"}</span>
                      </div>
                    </div>
                  </div>
                ) : null,
              )
            ) : (
              <div className="empty-state">
                <p>No hay servicios adicionales contratados</p>
              </div>
            )}
          </div>
        </div>
        <div className="payment-summary">
          <h3 className="section-title">Resumen del pago</h3>
          <h3 className="summary-title">
            Desglose de {reservarOPagarServicios() ? "pago de señales" : "pago final de servicios"}
          </h3>
          <div className="summary-card">
            <div className="summary-content">
              {reservarOPagarServicios() ? (
                <>
                  {Object.entries(obtenerDepositosActivos()).map(([id, amount]) => {
                    const prop = evento.eventPropertiesDTO.find((p) => p.id === parseInt(id));
                    const name = prop?.venueDTO?.name || prop?.otherServiceDTO?.name || "Sin nombre";
                    return (
                      <div key={id} className="summary-item">
                        <span>{decodeText(name)}</span>
                        <span className="price">{amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                      </div>
                    );
                  })}
                  <div className="summary-item">
                    <span>Gastos de gestión ({((commissionRate - 1) * 100).toFixed(0)}%)</span>
                    <span className="price">
                      {Object.values(obtenerDepositosActivos())
                        .reduce((acc, val) => acc + val * (commissionRate - 1), 0)
                        .toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {Object.entries(obetenerTotales()).map(([id, amount]) => {
                    const prop = evento.eventPropertiesDTO.find((p) => p.id === parseInt(id));
                    const name = prop?.venueDTO?.name || prop?.otherServiceDTO?.name || "Sin nombre";
                    return (
                      <div key={id} className="summary-item">
                        <span>{decodeText(name)}</span>
                        <span className="price">{amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                      </div>
                    );
                  })}
                  <div className="summary-item">
                    <span>Gastos de gestión ({((commissionRate - 1) * 100).toFixed(0)}%)</span>
                    <span className="price">
                      {Object.values(obetenerTotales())
                        .reduce((acc, val) => acc + val * (commissionRate - 1), 0)
                        .toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                </>
              )}
              <div className="separator"></div>
              <div className="summary-item total">
                <span>Total</span>
                <span>
                  {reservarOPagarServicios()
                    ? Object.values(obtenerDepositosActivos())
                      .reduce((acc, val) => acc + val * commissionRate, 0)
                      .toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                    : Object.values(obetenerTotales())
                      .reduce((acc, val) => acc + val * commissionRate, 0)
                      .toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="event-payment-container flex justify-center items-center">
          {reservarOPagarServicios() !== null && (
            <div className="text-center font-semibold text-lg">
              {reservarOPagarServicios() ? (
                (() => {
                  // Si la reserva ha expirado, mostramos el botón rojo en lugar del PaypalButtonTotal
                  if (isReservaExpired()) {
                    return (
                      <div
                        style={{
                          backgroundColor: "red",
                          width: "100px",
                          height: "100px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          marginTop: "1rem"
                        }}
                      >
                        Fecha expirada
                      </div>
                    );
                  }
                  const depositos = obtenerDepositosActivos();
                  const total = depositos ? Object.values(depositos).reduce((acc, val) => acc + val, 0) : 0;
                  const ids = depositos ? Object.keys(depositos).map(Number) : [];
                  return (
                    <span>
                      <h3 className="summary-title" style={{ marginTop: '1rem' }}>
                        Pagar con
                      </h3>
                      <PaypalButtonTotal
                        amount={total}
                        paymentType={'DEPOSITO PARA RESERVA'}
                        eventPropsIds={ids}
                      />
                    </span>
                  );
                })()
              ) : (
                (() => {
                  const totales = obetenerTotales();
                  const total = totales ? Object.values(totales).reduce((acc, val) => acc + val, 0) : 0;
                  const ids = totales ? Object.keys(totales).map(Number) : [];
                  return (
                    <span>
                      <h3 className="summary-title" style={{ marginTop: '1rem' }}>
                        Pagar con
                      </h3>
                      <PaypalButtonTotal
                        amount={total}
                        paymentType={'CANTIDAD RESTANTE'}
                        eventPropsIds={ids}
                      />
                    </span>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de desglose de precios */}
      {isCostBreakdownModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Desglose de precios</h3>
            </div>
            <h2 style={{ display: "flex", flexDirection: "column", textAlign: "left", alignItems: "flex-start" }}>
              Costes servicios: {calcularCosteServicios().toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </h2>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", textAlign: "left", alignItems: "flex-start" }}>
              {evento?.eventPropertiesDTO?.map((prop, i) => (
                <div key={i} className="price-breakdown-item">
                  <p>
                    <strong>{decodeText(prop.otherServiceDTO?.name || prop.venueDTO?.name)}</strong>:{" "}
                    {prop.setPricePerService?.toLocaleString("es-ES", { style: "currency", currency: "EUR" }) || "N/A"}
                  </p>
                </div>
              ))}
            </div>
            <h2 style={{ display: "flex", flexDirection: "column", textAlign: "left", alignItems: "flex-start" }}>
              Señales: {calcularDepositServicios().toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </h2>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", textAlign: "left", alignItems: "flex-start" }}>
              {evento?.eventPropertiesDTO?.map((prop, i) => (
                <div key={i} className="price-breakdown-item">
                  <p>
                    <strong>{decodeText(prop.otherServiceDTO?.name || prop.venueDTO?.name)}</strong>:{" "}
                    {prop.depositAmount?.toLocaleString("es-ES", { style: "currency", currency: "EUR" }) || "null"}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ justifyContent: "center", display: "flex", flexDirection: "row" }}>
              La señal se descontará en el pago final.
            </p>
            <div className="modal-footer" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <button style={{ borderRadius: "10%", backgroundColor: "red", color: "white", width: "20%", height: "4%" }} className="close-button" onClick={closeCostBreakdownModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaymentBreakdownModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Desglose de pagos</h3>
            </div>

            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", textAlign: "left", alignItems: "flex-start" }}
            >
              {evento?.eventPropertiesDTO?.map((prop, i) => {
                const nombreServicio = decodeText(
                  prop.otherServiceDTO?.name || prop.venueDTO?.name || `Servicio ${i + 1}`
                );

                // Filtrar los payments por eventPropertiesId
                const pagosAsociados = payments.filter(p => p.eventPropertiesId === prop.id);

                const total = pagosAsociados
                  .filter(p => p.paymentType === "REMAINING")
                  .reduce((acc, p) => acc + ((p.amount || 0) / 1.05), 0);

                const deposit = pagosAsociados
                  .filter(p => p.paymentType === "DEPOSIT")
                  .reduce((acc, p) => acc + ((p.amount || 0) / 1.05), 0);

                const mostrarTotal = total > 0
                  ? total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                  : "Sin pagar";

                const mostrarDeposit = deposit > 0
                  ? deposit.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                  : "Sin pagar";

                return (
                  <div key={i} className="price-breakdown-item" style={{ marginBottom: "1rem" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>{nombreServicio}</p>
                    <p>Total: {mostrarTotal}</p>
                    <p>Señal: {mostrarDeposit}</p>
                  </div>
                );
              })}
            </div>

            <p style={{ justifyContent: "center", display: "flex", flexDirection: "row" }}>
              No se están aplicando los impuestos.
            </p>

            <div className="modal-footer" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <button style={{ borderRadius: "10%", backgroundColor: "red", color: "white", width: "20%", height: "4%" }} className="close-button" onClick={closePaymentBreakdownModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>¿Estás seguro de que quieres eliminar este evento?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer. El evento será eliminado permanentemente.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="confirm-button" onClick={deleteEvent}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de propiedad */}
      {isDeletePropertyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>¿Estás seguro de que quieres eliminar este {isVenue() ? "recinto" : "servicio"}?</h3>
            </div>
            <div className="modal-body">
              <p>
                Esta acción no se puede deshacer. El {isVenue() ? "recinto" : "servicio"} {getPropertyName()} será
                eliminado permanentemente.
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeDeletePropertyModal}>
                Cancelar
              </button>
              <button className="confirm-button" onClick={confirmDeleteProperty}>
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
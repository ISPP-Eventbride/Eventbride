"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
    MapPin,
    DollarSign,
    Users,
    Clock,
    Plus,
    Edit,
    Package,
    Info,
    AlertCircle,
    ChevronDown,
    EyeOff,
    Eye,
    Loader2,
} from "lucide-react"
import { useAlert } from "../../context/AlertContext.jsx"
import "../../static/resources/css/Servicios.css"

const Servicios = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const [jwtToken] = useState(localStorage.getItem("jwt"))
    const { showAlert } = useAlert()
    const [spinner, setSpinner] = useState(null)

    const [page, setPage] = useState(0);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(services.length / itemsPerPage);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/services/user/${currentUser.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                method: "GET",
            })

            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const otherServices = Array.isArray(data?.otherServices)
                ? data.otherServices.map((otherService) => ({ ...otherService, type: "otherService" }))
                : []
            const venues = Array.isArray(data?.venues) ? data.venues.map((venue) => ({ ...venue, type: "venue" })) : []

            const allServices = [...otherServices, ...venues]
            const plan = currentUser.plan || "BASIC"
            const maxAllowed = plan === "PREMIUM" ? 10 : 3

            const availableServices = allServices.filter((s) => s.available)
            const excessServiceIds = availableServices.slice(maxAllowed).map((s) => s.id)

            const markedServices = allServices.map((service) => ({
                ...service,
                overLimit: excessServiceIds.includes(service.id),
            }))

            setServices(markedServices)
        } catch (error) {
            console.error("Error fetching services:", error)
        } finally {
            setLoading(false)
        }
    }, [currentUser.id, currentUser.plan, jwtToken])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    useEffect(() => {
        if (page > totalPages - 1) {
          setPage(Math.max(totalPages - 1, 0));
        }
      }, [totalPages]);

    const startIndex = page * itemsPerPage;
    const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

    // Función para formatear el tipo de servicio
    const formatServiceType = (type, otherServiceType) => {
        if (type === "venue") return "Recinto para eventos"
        switch (otherServiceType) {
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

    const handleOtherServiceDisable = async (id) => {
        setSpinner(id)
        try {
            const response = await fetch(`/api/other-services/disable/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                method: "PATCH",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "No se pudo habilitar el servicio")
            }

            setServices((prevItems) =>
                prevItems.map((item) =>
                    item.id === id && item.type === "otherService" ? { ...item, available: !item.available } : item,
                ),
            )
        } catch (error) {
            console.error("Error al cambiar disponibilidad del servicio:", error)
            showAlert(error.message)
        } finally {
            setSpinner(null)
        }
    }

    const handleVenuesDisable = async (id) => {
        setSpinner(id)
        try {
            const response = await fetch(`/api/venues/disable/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                method: "PATCH",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "No se pudo habilitar el servicio")
            }

            setServices((prevItems) =>
                prevItems.map((item) =>
                    item.id === id && item.type === "venue" ? { ...item, available: !item.available } : item,
                ),
            )
        } catch (error) {
            console.error("Error al cambiar disponibilidad del servicio:", error)
            showAlert(error.message)
        } finally {
            setSpinner(null)
        }
    }

    // Obtener el color de badge según tipo de servicio
    const getServiceBadgeColor = (type, otherServiceType) => {
        if (type === "venue") return "badge-venue"

        switch (otherServiceType) {
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

    return (
        <div className="servicios-container">
            <div className="servicios-header">
                <h1 className="servicios-title">Mis Servicios</h1>
                <p className="servicios-subtitle">Gestiona tus servicios y recintos para eventos</p>
            </div>

            {currentUser.plan === "BASIC" && services.filter((s) => s.overLimit).length > 0 && (
                <div className="alert-message warning-message">
                    <AlertCircle className="alert-icon" />
                    <div>
                        <p className="alert-title">Límite de servicios excedido</p>
                        <p className="alert-text">
                            Has excedido el límite de servicios del plan {currentUser.plan}. Debes desactivar los sobrantes. El máximo
                            permitido es {currentUser.plan === "PREMIUM" ? "10" : "3"}.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <Loader2 className="loading-spinner" />
                    <h3 className="loading-text">Cargando servicios</h3>
                    <p className="loading-subtext">Espere mientras obtenemos sus servicios...</p>
                </div>
            ) : services.length === 0 ? (
                <div className="empty-container">
                    <div className="empty-icon-container">
                        <Info className="empty-icon" />
                    </div>
                    <h3 className="empty-title">No tienes servicios registrados</h3>
                    <p className="empty-text">Comienza creando tu primer servicio.</p>
                    <button className="create-button" onClick={() => navigate("/misservicios/registrar")}>
                        <Plus className="button-icon" />
                        Crear nuevo servicio
                    </button>
                </div>
            ) : (
                <>
                    <div>
                        <div className="servicios-grid fade-in">
                            {currentServices.map((service) => (
                                <div
                                    key={service.id}
                                    className={`servicio-card hover-shadow ${service.overLimit ? "over-limit" : ""} ${!service.available ? "disabled-service" : ""}`}
                                >
                                    {/* Imagen del servicio */}
                                    <div className="servicio-image-container">
                                        <img
                                            src={service.picture || "https://iili.io/3EpzvZx.png"}
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = "https://iili.io/3EpzvZx.png"
                                            }}
                                            alt={service.name}
                                            className="servicio-image"
                                        />
                                        <div className="servicio-image-overlay"></div>
                                        {service.overLimit && (
                                            <div className="over-limit-badge">
                                                <AlertCircle className="over-limit-icon" />
                                                <span>Excede límite</span>
                                            </div>
                                        )}
                                        {!service.available && (
                                            <div className="disabled-badge">
                                                <EyeOff className="disabled-icon" />
                                                <span>Deshabilitado</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cabecera de la tarjeta */}
                                    <div className="servicio-header">
                                        <div className="servicio-header-content">
                                            <h3 className="servicio-name">{service.name}</h3>
                                            <span className={`servicio-badge ${getServiceBadgeColor(service.type, service.otherServiceType)}`}>
                                                {formatServiceType(service.type, service.otherServiceType)}
                                            </span>
                                        </div>
                                        <div className="servicio-status">
                                            <span className={`status-indicator ${service.available ? "status-active" : "status-inactive"}`}>
                                                {service.available ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detalles del servicio */}
                                    <div className="servicio-details">
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <MapPin className="detail-icon" />
                                                <div className="detail-content">
                                                    <p className="detail-label">Ubicación</p>
                                                    <p className="detail-value">{service.cityAvailable}</p>
                                                </div>
                                            </div>

                                            {service.limitedByPricePerGuest && (
                                                <div className="detail-item">
                                                    <Users className="detail-icon" />
                                                    <div className="detail-content">
                                                        <p className="detail-label">Precio por invitado</p>
                                                        <p className="detail-value">{service.servicePricePerGuest}€</p>
                                                    </div>
                                                </div>
                                            )}

                                            {service.limitedByPricePerHour && (
                                                <div className="detail-item">
                                                    <Clock className="detail-icon" />
                                                    <div className="detail-content">
                                                        <p className="detail-label">Precio por hora</p>
                                                        <p className="detail-value">{service.servicePricePerHour}€</p>
                                                    </div>
                                                </div>
                                            )}

                                            {!service.limitedByPricePerHour && !service.limitedByPricePerGuest && (
                                                <div className="detail-item">
                                                    <DollarSign className="detail-icon" />
                                                    <div className="detail-content">
                                                        <p className="detail-label">Precio fijo</p>
                                                        <p className="detail-value">{service.fixedPrice}€</p>
                                                    </div>
                                                </div>
                                            )}

                                            {service.type === "venue" && service.maxGuests && (
                                                <div className="detail-item">
                                                    <Users className="detail-icon" />
                                                    <div className="detail-content">
                                                        <p className="detail-label">Capacidad</p>
                                                        <p className="detail-value">{service.maxGuests} personas</p>
                                                    </div>
                                                </div>
                                            )}

                                            {service.type === "venue" && service.surface && (
                                                <div className="detail-item">
                                                    <Package className="detail-icon" />
                                                    <div className="detail-content">
                                                        <p className="detail-label">Superficie</p>
                                                        <p className="detail-value">{service.surface} m²</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div className="servicio-description">
                                            <h4 className="description-title">Descripción</h4>
                                            <p className="description-text">{service.description}</p>
                                        </div>

                                        {/* Información adicional para otros servicios */}
                                        {service.type === "otherService" && service.extraInformation && (
                                            <div className="servicio-extra-info">
                                                <h4 className="extra-info-title">Información adicional</h4>
                                                <p className="extra-info-text">{service.extraInformation}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="servicio-actions">
                                        <button
                                            className={`action-button toggle-button ${service.available ? "disable-button" : "enable-button"}`}
                                            onClick={() => {
                                                if (service.type === "otherService") {
                                                    handleOtherServiceDisable(service.id)
                                                } else {
                                                    handleVenuesDisable(service.id)
                                                }
                                            }}
                                            disabled={spinner === service.id}
                                        >
                                            {spinner === service.id ? (
                                                <>
                                                    <Loader2 className="button-icon spinner" />
                                                    <span>Procesando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    {service.available ? <EyeOff className="button-icon" /> : <Eye className="button-icon" />}
                                                    <span>{service.available ? "Deshabilitar" : "Habilitar"}</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className="action-button edit-button"
                                            onClick={() =>
                                                navigate(`/misservicios/editar/${service.type}/${service.id}/`, {
                                                    id: service.id,
                                                    serviceType: service.type,
                                                })
                                            }
                                        >
                                            <Edit className="button-icon" />
                                            <span>Editar</span>
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
                                margin: "24px 0"
                            }}>
                                <button
                                onClick={() => setPage(p => Math.max(p - 1, 0))}
                                disabled={page === 0}
                                style={{
                                    backgroundColor: "#f0f0f0",
                                    border: "none",
                                    borderRadius: 4,
                                    width: 40, height: 40,
                                    cursor: page === 0 ? "not-allowed" : "pointer",
                                    marginRight: 8, padding: 0
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
                                    width: 40, height: 40,
                                    cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                                    marginLeft: 8, padding: 0
                                }}
                                >
                                <ChevronDown size={20} color="black" style={{ transform: "rotate(-90deg)" }} />
                                </button>
                            </div>
                        )}
                    </div>

                    {currentUser.plan &&
                        (services.filter((s) => s.available).length < (currentUser.plan === "PREMIUM" ? 10 : 3) ? (
                            <div className="create-service-container">
                                <button className="create-button" onClick={() => navigate("/misservicios/registrar")}>
                                    <Plus className="button-icon" />
                                    Crear nuevo servicio
                                </button>
                            </div>
                        ) : (
                            <div className="alert-message warning-message">
                                <AlertCircle className="alert-icon" />
                                <div>
                                    <p className="alert-title">Límite de servicios activos alcanzado</p>
                                    <p className="alert-text">
                                        Has alcanzado el límite de servicios activos ({currentUser.plan === "PREMIUM" ? "10" : "3"}) del
                                        plan {currentUser.plan}. Deshabilita alguno antes de crear más.
                                    </p>
                                </div>
                            </div>
                        ))}
                </>
            )}
        </div>
    )
}

export default Servicios

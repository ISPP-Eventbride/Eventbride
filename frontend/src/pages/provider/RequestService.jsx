"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { MapPin, DollarSign, Users, Clock, Check, X, Info, Calendar, Phone, Mail, User, AlertCircle, Loader2 } from 'lucide-react'
import "../../static/resources/css/RequestService.css"

export default function RequestService() {
    const [serviceRequests, setServiceRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const [jwtToken] = useState(localStorage.getItem("jwt"))

    useEffect(() => {
        getRequests()
    }, [])

    // Función para obtener las solicitudes adaptada a la estructura real de datos
    async function getRequests() {
        try {
            setIsLoading(true)
            const response = await axios.get(`/api/event-properties/requests/${currentUser.id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })

            // Transformar los datos de la API al formato que espera el componente
            const formattedRequests = []

            // La respuesta es un array de arrays
            response.data.forEach((requestGroup) => {
                // Cada grupo puede contener múltiples solicitudes
                if (Array.isArray(requestGroup) && requestGroup.length >= 2) {
                    const eventProperty = requestGroup[0] // Datos del evento/servicio
                    const user = requestGroup[1] // Datos del usuario

                    // Determinar si es un venue o un otherService
                    const isVenue = eventProperty.venueDTO !== null
                    const serviceName = isVenue
                        ? eventProperty.venueDTO?.name || "Venue sin nombre"
                        : eventProperty.otherServiceDTO?.name || "Servicio sin nombre"

                    const location = isVenue
                        ? `${eventProperty.venueDTO?.cityAvailable || ""}`
                        : `${eventProperty.otherServiceDTO?.cityAvailable || ""}`

                    // Obtener información del evento
                    const eventInfo = eventProperty.eventDTO || {}

                    // Convertir la fecha del evento a objeto Date
                    const eventDate = eventProperty.requestDate || eventInfo.eventDate || null
                    const date = eventDate ? new Date(eventDate) : new Date()

                    // Formatear la hora de inicio
                    const startTime = eventProperty.startTime ? eventProperty.startTime.substring(0, 5) : "00:00"

                    formattedRequests.push({
                        id: eventProperty.id,
                        clientId: user.id,
                        clientName: `${user.firstName} ${user.lastName}`,
                        clientEmail: user.email || "No disponible",
                        clientPhone: user.telephone || "No disponible",
                        clientUsername: user.username,
                        clientProfilePicture: user.profilePicture,
                        serviceName: serviceName,
                        eventType: isVenue ? "Recinto" : "Servicio",
                        eventInfo: eventInfo,
                        eventCategory: eventInfo.eventType || "OTRO",
                        guests: eventInfo.guests || 0,
                        date: date,
                        time: startTime,
                        location: location,
                        status: eventProperty.status?.toLowerCase() || "pending",
                        price: eventProperty.setPricePerService || eventProperty.pricePerService || 0,
                        depositAmount: eventProperty.depositAmount || 0,
                        finishTime: eventProperty.finishTime ? eventProperty.finishTime.substring(0, 5) : "00:00",
                        isVenue: isVenue,
                        venueDTO: eventProperty.venueDTO,
                        otherServiceDTO: eventProperty.otherServiceDTO,
                        rawData: eventProperty, // Guardamos los datos originales por si los necesitamos
                    })
                }
            })

            const pendingRequests = formattedRequests.filter(
                (request) => request.status === "pending"
            )

            setServiceRequests(pendingRequests)
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching data:", error)
            setIsLoading(false)
        }
    }

    const handleAccept = async (id) => {
        setProcessingId(id)
        try {
            await axios.put(
                `/api/event-properties/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                },
            )
            // Actualizar el estado local eliminando la solicitud aceptada
            setServiceRequests(serviceRequests.filter((request) => request.id !== id))
        } catch (error) {
            console.error("Error al aceptar la solicitud:", error)
        } finally {
            setProcessingId(null)
            window.location.href = '/solicitudes'
            // Opcional: redirigir o mostrar notificación
        }
    }

    const handleReject = async (id) => {
        setProcessingId(id)
        try {
            await axios.delete(`/api/event-properties/${id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })
            // Actualizar el estado local eliminando la solicitud rechazada
            setServiceRequests(serviceRequests.filter((request) => request.id !== id))
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error)
        } finally {
            setProcessingId(null)
            // Opcional: redirigir o mostrar notificación
        }
    }

    // Formatear fecha para mostrar
    const formatDate = (date) => {
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    // Formatear tipo de servicio
    const formatServiceType = (request) => {
        if (request.isVenue) return "Recinto para eventos"

        const otherServiceType = request.otherServiceDTO?.otherServiceType

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
        <div className="solicitudes-container">
            <div className="solicitudes-header">
                <h1 className="solicitudes-title">Solicitudes de Servicios</h1>
                <p className="solicitudes-subtitle">Gestiona las solicitudes de tus clientes para tus servicios y recintos</p>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <Loader2 className="loading-spinner" />
                    <h3 className="loading-text">Cargando solicitudes</h3>
                    <p className="loading-subtext">Espere mientras obtenemos sus solicitudes...</p>
                </div>
            ) : serviceRequests.length === 0 ? (
                <div className="empty-container">
                    <div className="empty-icon-container">
                        <Info className="empty-icon" />
                    </div>
                    <h3 className="empty-title">No hay solicitudes pendientes</h3>
                    <p className="empty-text">Cuando recibas solicitudes para tus servicios, aparecerán aquí.</p>
                </div>
            ) : (
                <div className="solicitudes-grid fade-in">
                    {serviceRequests.map((request) => (
                        <div key={request.id} className="solicitud-card hover-shadow">
                            {/* Cabecera de la tarjeta */}
                            <div className="solicitud-header">
                                <div className="solicitud-header-content">
                                    <h3 className="solicitud-name">{request.serviceName}</h3>
                                    <div className="badge-container">
                                        <span className="solicitud-badge">{formatServiceType(request)}</span>
                                        {request.eventCategory && (
                                            <span className={`event-badge ${getEventBadgeColor(request.eventCategory)}`}>
                                                {formatEventType(request.eventCategory)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {request.clientProfilePicture ? (
                                        <img
                                            src={request.clientProfilePicture || "/placeholder.svg"}
                                            alt={request.clientName}
                                            className="solicitud-avatar"
                                        />
                                    ) : (
                                        <div className="solicitud-avatar-placeholder">
                                            <User className="solicitud-avatar-icon" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información del cliente */}
                            <div className="client-section">
                                <h4 className="section-title">Información del cliente</h4>
                                <div>
                                    <div className="info-item">
                                        <User className="info-icon" />
                                        <span className="info-label">{request.clientName}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="info-item">
                                        <Mail className="info-icon" />
                                        <span className="info-value">{request.clientEmail}</span>
                                    </div>
                                    <div className="info-item">
                                        <Phone className="info-icon" />
                                        <span className="info-value">{request.clientPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del servicio */}
                            <div className="details-section">
                                <h4 className="section-title">Detalles de la solicitud</h4>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <Calendar className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Fecha</p>
                                            <p className="detail-value">{formatDate(request.date)}</p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <Clock className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Horario</p>
                                            <p className="detail-value">
                                                {request.time} - {request.finishTime}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <MapPin className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Ubicación</p>
                                            <p className="detail-value">{request.location || "No especificada"}</p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <DollarSign className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Precio</p>
                                            <p className="detail-value">{request.price}€</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de invitados */}
                                {request.guests > 0 && (
                                    <div className="additional-info">
                                        <Users className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Invitados</p>
                                            <p className="detail-value">{request.guests} personas</p>
                                        </div>
                                    </div>
                                )}

                                {/* Información adicional */}
                                {request.isVenue && request.venueDTO?.maxGuests && (
                                    <div className="additional-info">
                                        <Users className="detail-icon" />
                                        <div className="detail-content">
                                            <p className="detail-label">Capacidad</p>
                                            <p className="detail-value">{request.venueDTO.maxGuests} personas</p>
                                        </div>
                                    </div>
                                )}

                                {/* Depósito si existe */}
                                {request.depositAmount > 0 && (
                                    <div className="deposit-alert">
                                        <AlertCircle className="alert-icon" />
                                        <div className="alert-content">
                                            <p className="alert-title">Depósito requerido</p>
                                            <p className="alert-text">{request.depositAmount}€</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="actions-section">
                                <button
                                    onClick={() => handleReject(request.id)}
                                    disabled={processingId === request.id}
                                    className="btn btn-reject"
                                >
                                    {processingId === request.id ? <Loader2 className="btn-icon spinner" /> : <X className="btn-icon" />}
                                    Rechazar
                                </button>

                                <button
                                    onClick={() => handleAccept(request.id)}
                                    disabled={processingId === request.id}
                                    className="btn btn-confirm"
                                >
                                    {processingId === request.id ? (
                                        <Loader2 className="btn-icon spinner" />
                                    ) : (
                                        <Check className="btn-icon" />
                                    )}
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

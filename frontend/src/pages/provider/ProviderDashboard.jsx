"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Clock,
    User,
    MessageSquare,
    FileText,
    ArrowUpDown,
    CalendarDays,
    List,
    Handshake,
    DollarSign
} from "lucide-react"
import logo from "../../static/resources/images/logo-eventbride.png"
import "../../static/resources/css/ProviderDashboard.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function SupplierDashboard() {
    const [currentView, setCurrentView] = useState("list") // "list" or "calendar"
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [filterStatus, setFilterStatus] = useState("all") // "all", "pending", "accepted", "rejected"
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [sortBy, setSortBy] = useState("date") // "date", "client", "service"
    const [sortOrder, setSortOrder] = useState("asc") // "asc" or "desc"
    const [requests, setRequests] = useState("")
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const [jwtToken] = useState(localStorage.getItem("jwt"))
    const [chatId, setChatId] = useState("")
    const navigator = useNavigate();

    // Mock data for service requests
    const [serviceRequests, setServiceRequests] = useState([])

    // Reemplazar la función getRequests() con esta nueva versión
    async function getRequests() {
        try {
            setIsLoading(true)
            const response = await axios.get(`/api/event-properties/requests/${currentUser.id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })

            // Transformar los datos de la API al formato que espera el componente
            const formattedRequests = []

            // La respuesta es un array de arrays, donde cada subarray contiene [eventProperty, user]
            response.data.forEach((requestPair) => {
                if (Array.isArray(requestPair) && requestPair.length >= 2) {
                    const eventProperty = requestPair[0]
                    const user = requestPair[1]

                    // Determinar si es un venue o un otherService
                    const isVenue = eventProperty.venueDTO !== null
                    const serviceName = isVenue
                        ? eventProperty.venueDTO?.name || "Venue sin nombre"
                        : eventProperty.otherServiceDTO?.name || "Servicio sin nombre"

                    const location = isVenue
                        ? `${eventProperty.venueDTO?.cityAvailable || ""}`
                        : `${eventProperty.otherServiceDTO?.cityAvailable || ""}`

                    // Convertir la fecha de string a objeto Date
                    const date = new Date(eventProperty.requestDate)

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
                        date: date,
                        time: startTime,
                        location: location,
                        status: eventProperty.status?.toLowerCase() || "pending",
                        price: eventProperty.setPricePerService,
                        depositAmount: eventProperty.depositAmount,
                        finishTime: eventProperty.finishTime ? eventProperty.finishTime.substring(0, 5) : "00:00",
                        isVenue: isVenue,
                        venueDTO: eventProperty.venueDTO,
                        otherServiceDTO: eventProperty.otherServiceDTO,
                        rawData: eventProperty, // Guardamos los datos originales por si los necesitamos
                    })
                }
            })

            setServiceRequests(formattedRequests)
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching data:", error)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getRequests()
    }, [])

    // Filter requests based on status and search query
    const filteredRequests = serviceRequests.filter((request) => {
        const matchesStatus = filterStatus === "all" || request.status === filterStatus
        const matchesSearch =
            request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.eventType.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesStatus && matchesSearch
    })

    // Sort requests
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        let comparison = 0

        if (sortBy === "date") {
            comparison = a.date.getTime() - b.date.getTime()
        } else if (sortBy === "client") {
            comparison = a.clientName.localeCompare(b.clientName)
        } else if (sortBy === "service") {
            comparison = a.serviceName.localeCompare(b.serviceName)
        }

        return sortOrder === "asc" ? comparison : -comparison
    })

    // Group requests by date for calendar view
    const requestsByDate = sortedRequests.reduce((acc, request) => {
        const dateStr = request.date.toDateString()
        if (!acc[dateStr]) {
            acc[dateStr] = []
        }
        acc[dateStr].push(request)
        return acc
    }, {})

    // Handle status change
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            // Aquí deberías hacer la llamada a la API para actualizar el estado
            // Por ejemplo:
            // await axios.put(`/api/event-properties/requests/${requestId}/status`,
            //   { status: newStatus },
            //   { headers: { Authorization: `Bearer ${jwtToken}` } }
            // )

            // Por ahora, solo actualizamos el estado local
            setServiceRequests((prevRequests) =>
                prevRequests.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)),
            )

            // Actualizar el detalle si está seleccionado
            if (selectedRequest && selectedRequest.id === requestId) {
                setSelectedRequest({ ...selectedRequest, status: newStatus })
            }
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    // Toggle sort order
    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("asc")
        }
    }

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    // Get day of week names
    const getDayNames = () => {
        return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    }

    // Get month name
    const getMonthName = (date) => {
        const months = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ]
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
    }

    // Navigate to next month
    const goToNextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
    }

    // Check if a date has requests
    const hasRequests = (date) => {
        if (!date) return false
        return !!requestsByDate[date.toDateString()]
    }

    // Get requests for a specific date
    const getRequestsForDate = (date) => {
        if (!date) return []
        return requestsByDate[date.toDateString()] || []
    }

    // Format date
    const formatDate = (date) => {
        const options = { day: "numeric", month: "long", year: "numeric" }
        return date.toLocaleDateString("es-ES", options)
    }

    // Status badge component
    const StatusBadge = ({ status }) => {
        let bgColor = ""
        let textColor = ""
        let statusText = ""

        switch (status) {
            case "pending":
                bgColor = "bg-amber-100"
                textColor = "text-amber-800"
                statusText = "Pendiente"
                break
            case "approved":
                bgColor = "bg-green-100"
                textColor = "text-green-800"
                statusText = "Aceptada"
                break
            case "deposit_paid":
                bgColor = "bg-green-100"
                textColor = "text-green-800"
                statusText = "Reserva pagada"
                break
            case "completed":
                bgColor = "bg-green-100"
                textColor = "text-green-800"
                statusText = "Pago completado"
                break
            case "cancelled":
                bgColor = "bg-red-100"
                textColor = "text-red-800"
                statusText = "Rechazada"
                break
            default:
                bgColor = "bg-gray-100"
                textColor = "text-gray-800"
                statusText = status || "Desconocido"
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
            >
                {statusText}
            </span>
        )
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="supplier-dashboard">

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    <div className="dashboard-content">
                        {/* Page Title and Actions */}
                        <div className="page-header">
                            <div className="page-title">
                                <h2>Servicios contratados</h2>
                                <p className="page-description">
                                    Gestiona las solicitudes de tus servicios y visualiza tu calendario de servicios
                                </p>
                            </div>
                            <div className="view-toggle">
                                <button
                                    className={`view-button ${currentView === "list" ? "active" : ""}`}
                                    onClick={() => setCurrentView("list")}
                                >
                                    <List size={18} />
                                    <span>Lista</span>
                                </button>
                                <button
                                    className={`view-button ${currentView === "calendar" ? "active" : ""}`}
                                    onClick={() => setCurrentView("calendar")}
                                >
                                    <CalendarDays size={18} />
                                    <span>Calendario</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="stats-summary">
                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{serviceRequests.filter((r) => r.status === "pending").length}</h3>
                                    <p className="stat-label">Pendientes</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon accepted">
                                    <Check size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{serviceRequests.filter((r) => r.status === "approved").length}</h3>
                                    <p className="stat-label">Aceptadas</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon accepted">
                                    <Handshake size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{serviceRequests.filter((r) => r.status === "deposit_paid").length}</h3>
                                    <p className="stat-label">Reserva pagada</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon accepted">
                                    <DollarSign size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{serviceRequests.filter((r) => r.status === "completed").length}</h3>
                                    <p className="stat-label">Pago completado</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="filters-container">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Buscar por cliente, servicio o tipo de servicio..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-buttons" style={{ maxWidth: "20%", display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                                <button
                                    className={`filter-button ${filterStatus === "all" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("all")}
                                >
                                    Todas
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === "pending" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("pending")}
                                >
                                    Pendientes
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === "approved" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("approved")}
                                >
                                    Aceptadas
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === "deposit_paid" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("deposit_paid")}
                                >
                                    Reservado
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === "completed" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("completed")}
                                >
                                    Pagado
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === "cancelled" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("cancelled")}
                                >
                                    Rechazadas
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="content-area">
                            {/* List View */}
                            {currentView === "list" && (
                                <div className="requests-list-container">
                                    <div className="requests-list-header">
                                        <div className="list-header-item" onClick={() => toggleSort("date")}>
                                            <span>Fecha</span>
                                            <ArrowUpDown size={14} className="sort-icon" />
                                        </div>
                                        <div className="list-header-item" onClick={() => toggleSort("client")}>
                                            <span>Cliente</span>
                                            <ArrowUpDown size={14} className="sort-icon" />
                                        </div>
                                        <div className="list-header-item" onClick={() => toggleSort("service")}>
                                            <span>Servicio</span>
                                            <ArrowUpDown size={14} className="sort-icon" />
                                        </div>
                                        <div className="list-header-item">
                                            <span>Tipo de servicio</span>
                                        </div>
                                        <div className="list-header-item">
                                            <span>Estado</span>
                                        </div>
                                        <div className="list-header-item">
                                            <span>Acciones</span>
                                        </div>
                                    </div>

                                    {sortedRequests.length > 0 ? (
                                        <div className="requests-list">
                                            {sortedRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className={`request-item ${selectedRequest && selectedRequest.id === request.id ? "selected" : ""}`}
                                                    onClick={() => setSelectedRequest(request)}
                                                >
                                                    <div className="request-date">
                                                        <div className="date-badge">
                                                            <span className="date-day">{request.date.getDate()}</span>
                                                            <span className="date-month">
                                                                {request.date.toLocaleString("es-ES", { month: "short" })}
                                                            </span>
                                                        </div>
                                                        <span className="date-time">{request.time}</span>
                                                    </div>
                                                    <div className="request-client">
                                                        <span className="client-name">{request.clientName}</span>
                                                        <span className="client-email">{request.clientEmail}</span>
                                                    </div>
                                                    <div className="request-service">
                                                        <span className="service-name">{request.serviceName}</span>
                                                        <span className="service-guests">{request.price}€</span>
                                                    </div>
                                                    <div className="request-event-type">
                                                        <span className="event-type">{request.eventType}</span>
                                                    </div>
                                                    <div className="request-status">
                                                        <StatusBadge status={request.status} />
                                                    </div>
                                                    <div className="request-actions">
                                                        <button
                                                            className="action-button view"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedRequest(request)
                                                            }}
                                                        >
                                                            Ver detalles
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">
                                                <Calendar size={48} />
                                            </div>
                                            <h3 className="empty-title">No hay solicitudes</h3>
                                            <p className="empty-description">No se encontraron solicitudes con los filtros actuales.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Calendar View */}
                            {currentView === "calendar" && (
                                <div className="calendar-container">
                                    <div className="calendar-header">
                                        <button className="calendar-nav-button" onClick={goToPreviousMonth}>
                                            <ChevronLeft size={20} />
                                        </button>
                                        <h3 className="calendar-title">{getMonthName(selectedDate)}</h3>
                                        <button className="calendar-nav-button" onClick={goToNextMonth}>
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className="calendar-grid">
                                        {/* Day names */}
                                        {getDayNames().map((day, index) => (
                                            <div key={index} className="calendar-day-name">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Calendar days */}
                                        {generateCalendarDays().map((day, index) => (
                                            <div
                                                key={index}
                                                className={`calendar-day ${!day ? "empty" : ""} ${hasRequests(day) ? "has-events" : ""}`}
                                            >
                                                {day && (
                                                    <>
                                                        <span className="day-number">{day.getDate()}</span>
                                                        {hasRequests(day) && (
                                                            <div className="day-events">
                                                                {getRequestsForDate(day).map((request) => (
                                                                    <div
                                                                        key={request.id}
                                                                        className={`day-event ${request.status}`}
                                                                        onClick={() => setSelectedRequest(request)}
                                                                    >
                                                                        <span className="event-time">{request.time}</span>
                                                                        <span className="event-title">{request.serviceName}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Request Details Panel */}
                            {selectedRequest && (
                                <div className="request-details-panel">
                                    <div className="panel-header">
                                        <h3 className="panel-title">Detalles de la Solicitud</h3>
                                        <button style={{ color: "black" }} className="close-button" onClick={() => setSelectedRequest(null)}>
                                            X
                                        </button>
                                    </div>

                                    <div className="panel-content">
                                        <div className="detail-section">
                                            <h4 className="detail-section-title">Información del Servicio</h4>
                                            <div className="detail-row">
                                                <span className="detail-label">Tipo:</span>
                                                <span className="detail-value">{selectedRequest.isVenue ? "Venue" : "Servicio"}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Nombre:</span>
                                                <span className="detail-value">{selectedRequest.serviceName}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Fecha:</span>
                                                <span className="detail-value">{formatDate(selectedRequest.date)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Hora inicio:</span>
                                                <span className="detail-value">{selectedRequest.time}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Hora fin:</span>
                                                <span className="detail-value">{selectedRequest.finishTime}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Ubicación:</span>
                                                <span className="detail-value">{selectedRequest.location}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Precio:</span>
                                                <span className="detail-value">{selectedRequest.price}€</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Depósito:</span>
                                                <span className="detail-value">{selectedRequest.depositAmount || 0}€</span>
                                            </div>
                                        </div>

                                        <div className="detail-section">
                                            <h4 className="detail-section-title">Información del Cliente</h4>
                                            <div className="client-info">
                                                {selectedRequest.clientProfilePicture && (
                                                    <div className="client-avatar">
                                                        <img
                                                            src={selectedRequest.clientProfilePicture || "/placeholder.svg"}
                                                            alt={selectedRequest.clientName}
                                                            className="client-profile-picture"
                                                        />
                                                    </div>
                                                )}
                                                <div className="client-details">
                                                    <div className="detail-row">
                                                        <span className="detail-label">Nombre:</span>
                                                        <span className="detail-value">{selectedRequest.clientName}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Usuario:</span>
                                                        <span className="detail-value">{selectedRequest.clientUsername}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Email:</span>
                                                        <span className="detail-value">{selectedRequest.clientEmail}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Teléfono:</span>
                                                        <span className="detail-value">{selectedRequest.clientPhone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedRequest.isVenue && selectedRequest.venueDTO && (
                                            <div className="detail-section">
                                                <h4 className="detail-section-title">Información del Venue</h4>
                                                <div className="detail-row">
                                                    <span className="detail-label">ID:</span>
                                                    <span className="detail-value">{selectedRequest.venueDTO.id}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Ciudad:</span>
                                                    <span className="detail-value">{selectedRequest.venueDTO.cityAvailable}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Disponible:</span>
                                                    <span className="detail-value">{selectedRequest.venueDTO.available ? "Sí" : "No"}</span>
                                                </div>
                                            </div>
                                        )}

                                        {!selectedRequest.isVenue && selectedRequest.otherServiceDTO && (
                                            <div className="detail-section">
                                                <h4 className="detail-section-title">Información del Servicio</h4>
                                                <div className="detail-row">
                                                    <span className="detail-label">ID:</span>
                                                    <span className="detail-value">{selectedRequest.otherServiceDTO.id}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Ciudad:</span>
                                                    <span className="detail-value">{selectedRequest.otherServiceDTO.cityAvailable}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Disponible:</span>
                                                    <span className="detail-value">
                                                        {selectedRequest.otherServiceDTO.available ? "Sí" : "No"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="detail-section">
                                            <h4 className="detail-section-title">Estado de la Solicitud</h4>
                                            <div className="status-container">
                                                <StatusBadge status={selectedRequest.status} />
                                                <span className="status-date">Fecha de solicitud: {formatDate(selectedRequest.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="panel-actions">
                                        {selectedRequest.status === "pending" && (
                                            <>

                                            </>
                                        )}

                                        <button className="action-button contact" onClick={() => navigator(`/chat/${selectedRequest.clientId}`)}>
                                            <MessageSquare size={16} />
                                            Contactar Cliente
                                        </button>

                                        {selectedRequest.status === "rejected" && (
                                            <></>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


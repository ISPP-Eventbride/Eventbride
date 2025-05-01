"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  Mail,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import "../../static/resources/css/MyEvents.css"

function MyEvents() {
  const [eventos, setEventos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const navigate = useNavigate()

  // Estados de paginación
  const [page, setPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.ceil(eventos.length / itemsPerPage)

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const [jwtToken] = useState(localStorage.getItem("jwt"))

  // Obtener la lista de eventos
  function getEvents() {
    setIsLoading(true)
    setError(null)

    if (!currentUser || !currentUser.id) {
      setError("No se ha encontrado información del usuario")
      setIsLoading(false)
      return
    }

    fetch(`/api/v1/events/next/${currentUser.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los eventos")
        }
        return response.json()
      })
      .then((data) => {
        setEventos(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error obteniendo eventos:", error)
        setError("No hay eventos todavia.")
        setIsLoading(false)
      })
  }

  // Cargar eventos al montar el componente
  useEffect(() => {
    getEvents()
  }, [])

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0))
    }
  }, [totalPages])

  // Convertir tipo de evento a español
  const tipoDeEvento = (type) => {
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

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const opciones = { year: "numeric", month: "long", day: "numeric" }
    return new Date(fecha).toLocaleDateString("es-ES", opciones)
  }

  // Obtener imagen según tipo de evento
  const getEventImage = (eventType) => {
    switch (eventType) {
      case "WEDDING":
        return "https://imgix.bustle.com/uploads/image/2023/3/24/09d2b351-99fd-49eb-a5b1-9e4ad742109f-24350248-f965-4ac2-8cd5-687c79fac92b.jpeg?w=414&h=275&fit=crop&crop=focalpoint&dpr=2&fp-x=0.356&fp-y=0.3052"
      case "COMMUNION":
        return "https://media.istockphoto.com/id/2046030661/es/foto/comuni%C3%B3n-santo-grial-con-panes-sin-levadura-y-c%C3%A1liz-de-vino-%C3%BAltima-cena-con-corpus-christi-de.jpg?s=612x612&w=0&k=20&c=tVRw3ZhhEY8FIhZWybDC1-J3hB74tkI2LURJq-2Gjto="
      case "CHRISTENING":
        return "https://cdn.pixabay.com/photo/2016/04/20/23/35/religion-1342376_1280.jpg"
      case "BIRTHDAY":
        return "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      case "CORPORATE":
        return "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
      default:
        return "https://via.placeholder.com/400x250"
    }
  }

  // Calcular días restantes hasta el evento
  const calcularDiasRestantes = (fecha) => {
    const hoy = new Date()
    const fechaEvento = new Date(fecha)
    const diferencia = fechaEvento.getTime() - hoy.getTime()
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24))
    return dias
  }

  // Calcular coste total del evento
  const calcularCosteEvento = (evento) => {
    if (!evento || !evento.eventPropertiesDTO) return 0

    let total = 0
    for (let i = 0; i < evento.eventPropertiesDTO.length; i++) {
      const prop = evento.eventPropertiesDTO[i]
      total += prop.setPricePerService || 0
    }
    return total
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

  // Filtrar eventos
  const filteredEvents = eventos.filter((evento) => {
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === "" || evento.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por tipo de evento
    const matchesType = filterType === null || evento.eventType === filterType

    return matchesSearch && matchesType
  })

  const startIndex = page * itemsPerPage
  const currentEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header-container">
        <div className="events-header">
          <h1 className="page-title">Mis Eventos</h1>
          <p className="events-subtitle">Gestiona y organiza todos tus eventos en un solo lugar</p>
        </div>
      </div>

      <div className="actions-container">
        <button className="filter-toggle-button" onClick={toggleFilters}>
          <Search className="button-icon" />
          <span>{filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}</span>
          {filtersVisible ? (
            <ChevronDown className="button-icon-right" style={{ transform: "rotate(180deg)" }} />
          ) : (
            <ChevronDown className="button-icon-right" />
          )}
        </button>

        <button className="new-event-button" onClick={() => navigate("/create-events")}>
          <Plus className="button-icon" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* Categorías de eventos */}
      <div className="categories-panel">
        <button className={`category-button ${!filterType ? "active" : ""}`} onClick={() => setFilterType(null)}>
          <Calendar className="category-icon" />
          <span>Todos</span>
        </button>
        <button
          className={`category-button ${filterType === "WEDDING" ? "active" : ""}`}
          onClick={() => setFilterType("WEDDING")}
        >
          <Calendar className="category-icon" />
          <span>Bodas</span>
        </button>
        <button
          className={`category-button ${filterType === "COMMUNION" ? "active" : ""}`}
          onClick={() => setFilterType("COMMUNION")}
        >
          <Calendar className="category-icon" />
          <span>Comuniones</span>
        </button>
        <button
          className={`category-button ${filterType === "CHRISTENING" ? "active" : ""}`}
          onClick={() => setFilterType("CHRISTENING")}
        >
          <Calendar className="category-icon" />
          <span>Bautizos</span>
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
                <Search className="filter-icon" />
                Nombre del evento
              </label>
              <div className="filter-input-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="filter-button clear-button"
              onClick={() => {
                setSearchTerm("")
                setFilterType(null)
              }}
            >
              <X className="button-icon" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="events-content">
        <h2 className="events-section-title">
          {isLoading
            ? "Cargando eventos..."
            : filteredEvents.length > 0
              ? `${filteredEvents.length} eventos encontrados`
              : "No se encontraron eventos"}
        </h2>

        {/* Grid de eventos */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button className="retry-button" onClick={getEvents}>
              Reintentar
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="no-events-container">
            <div className="no-events-icon">📅</div>
            <h2>No hay eventos disponibles</h2>
            <p>No tienes eventos programados en este momento.</p>
            <button className="create-event-button" onClick={() => navigate("/create-events")}>
              Crear mi primer evento
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {currentEvents.map((evento, index) => {
              const diasRestantes = calcularDiasRestantes(evento.eventDate)
              const costeTotal = calcularCosteEvento(evento)

              return (
                <div key={index} className="event-card hover-shadow">
                  {/* Imagen del evento */}
                  <div className="event-image-container" onClick={() => navigate(`/event/${evento.id}`)}>
                    <img
                      src={getEventImage(evento.eventType) || "/placeholder.svg"}
                      alt={tipoDeEvento(evento.eventType)}
                      className="event-image"
                    />
                    <div className="event-image-overlay"></div>
                    <div className={`event-type-badge ${getEventBadgeColor(evento.eventType)}`}>
                      <Calendar className="badge-icon" />
                      <span>{tipoDeEvento(evento.eventType)}</span>
                    </div>
                    {diasRestantes > 0 && (
                      <div className="days-remaining">
                        <Clock className="days-icon" />
                        <span className="days-number">{diasRestantes}</span>
                        <span className="days-text">días</span>
                      </div>
                    )}
                  </div>

                  {/* Cabecera de la tarjeta */}
                  <div className="event-header">
                    <h3 className="event-name">{evento.name}</h3>
                  </div>

                  {/* Detalles del evento */}
                  <div className="event-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <Calendar className="detail-icon" />
                        <div className="detail-content">
                          <p className="detail-label">Fecha</p>
                          <p className="detail-value">{formatearFecha(evento.eventDate)}</p>
                        </div>
                      </div>

                      <div className="detail-item">
                        <Users className="detail-icon" />
                        <div className="detail-content">
                          <p className="detail-label">Invitados</p>
                          <p className="detail-value">{evento.guests} personas</p>
                        </div>
                      </div>

                      <div className="detail-item">
                        <DollarSign className="detail-icon" />
                        <div className="detail-content">
                          <p className="detail-label">Presupuesto</p>
                          <p className="detail-value">
                            {costeTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="event-actions">
                    <button className="action-button view-button" onClick={() => navigate(`/event/${evento.id}`)}>
                      <ExternalLink className="button-icon" />
                      <span>Ver detalles</span>
                    </button>
                    <button
                      className="action-button invite-button"
                      onClick={() => navigate(`/invitaciones/${evento.id}`)}
                    >
                      <Mail className="button-icon" />
                      <span>Invitaciones</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {filteredEvents.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="pagination-button"
            >
              <ChevronDown size={20} style={{ transform: "rotate(90deg)" }} />
            </button>

            <span className="pagination-info">
              Página {page + 1} de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page + 1 >= totalPages}
              className="pagination-button"
            >
              <ChevronDown size={20} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyEvents

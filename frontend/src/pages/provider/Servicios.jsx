/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "../../apiClient"
import { useNavigate } from "react-router-dom"

import { CheckCircle, MapPin, DollarSign, Users, Clock, ChevronDown, Plus, Edit, Package, Info, AlertCircle, EyeOff, Eye, Loader2 } from "lucide-react"

import "../../static/resources/css/Servicios.css"

import { useAlert } from "../../context/AlertContext.jsx"

const Servicios = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const currentUser = JSON.parse(localStorage.getItem("user"))
    const [jwtToken] = useState(localStorage.getItem("jwt"));

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
                    "Authorization": `Bearer ${jwtToken}`,
                },
                method: "GET",
            })

            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const otherServices = Array.isArray(data?.otherServices) ? data.otherServices.map(otherService => ({ ...otherService, type: "otherService" })) : []
            const venues = Array.isArray(data?.venues) ? data.venues.map(venue => ({ ...venue, type: "venue" })) : []

            const allServices = [...otherServices, ...venues]
            const plan = currentUser.plan || "BASIC"
            const maxAllowed = plan === "PREMIUM" ? 10 : 3

            const availableServices = allServices.filter(s => s.available)
            const excessServiceIds = availableServices.slice(maxAllowed).map(s => s.id)

            /* TODO revisar este valor que se genera y usa a lo largo de la función, no hace bien su trabajo*/
            const markedServices = allServices.map(service => ({
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
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "No se pudo habilitar el servicio");
            }

            setServices((prevItems) =>
                prevItems.map((item) =>
                    item.id === id && item.type === "otherService"
                        ? { ...item, available: !item.available }
                        : item
                )
            );
        } catch (error) {
            console.error("Error al cambiar disponibilidad del servicio:", error);
            showAlert(error.message);
        } finally {
            setSpinner(null)
        }
    };

    const handleVenuesDisable = async (id) => {
        setSpinner(id)
        try {
            const response = await fetch(`/api/venues/disable/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                method: "PATCH",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "No se pudo habilitar el servicio");
            }

            setServices((prevItems) =>
                prevItems.map((item) =>
                    item.id === id && item.type === "venue"
                        ? { ...item, available: !item.available }
                        : item
                )
            );
        } catch (error) {
            console.error("Error al cambiar disponibilidad del servicio:", error);
            showAlert(error.message);
        } finally {
            setSpinner(null)
        }
    };

    const startIndex = page * itemsPerPage;
    const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="mis-servicios-container">
            <h1 className="mis-servicios-title">Mis Servicios</h1>

            {currentUser.plan === "BASIC" && services.filter((s) => s.overLimit).length > 0 && (
                <div className="warning-message">
                    <AlertCircle size={20} className="mr-2" />
                    Has excedido el límite de servicios del plan {currentUser.plan}. Debe desactivar los sobrantes. El máximo permitido es {currentUser.plan == "PREMIUM" ? "10" : "3"}.
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando servicios...</p>
                </div>
            ) : services.length === 0 ? (
                <div className="empty-state">
                    <Info size={48} className="empty-icon" />
                    <h2 className="empty-title">No tienes servicios registrados</h2>
                    <p className="empty-text">Comienza creando tu primer servicio.</p>
                </div>
            ) : (
                <div>
                    <div className="services-list">
                        {currentServices.map((service) => (
                            <div key={service.id} className={`service-item ${service.overLimit ? "over-limit" : ""}`}>
                                <div className="service-header">
                                    <h3 className="service-title">{service.name}</h3>
                                    <span className="service-badge">
                                        {formatServiceType(service.type, service.otherServiceType)}
                                    </span>
                                </div>

                                <div className="service-body">
                                    <div className="service-info">
                                        <CheckCircle size={18} className="info-icon" />
                                        <div>
                                            <span className="info-label">Disponible:</span>
                                            <span className="info-value">
                                                {service.available ? (
                                                    <p style={{ backgroundColor: "#52ba84ca", width: "35%", fontSize: "105%", borderRadius: "7px", textAlign: "center" }}> Sí</p>
                                                ) : (
                                                    <p style={{ backgroundColor: "#d24e4eca", width: "35%", fontSize: "105%", borderRadius: "7px", textAlign: "center" }}> No</p>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="service-info">
                                        <MapPin size={18} className="info-icon" />
                                        <div>
                                            <span className="info-label">Ciudad:</span>
                                            <span className="info-value">{service.cityAvailable}</span>
                                        </div>
                                    </div>

                                    {service.limitedByPricePerGuest && (
                                        <div className="service-info">
                                            <Users size={18} className="info-icon" />
                                            <div>
                                                <span className="info-label">Precio por invitado:</span>
                                                <span className="info-value">{service.servicePricePerGuest}€</span>
                                            </div>
                                        </div>
                                    )}

                                    {service.limitedByPricePerHour && (
                                        <div className="service-info">
                                            <Clock size={18} className="info-icon" />
                                            <div>
                                                <span className="info-label">Precio por hora:</span>
                                                <span className="info-value">{service.servicePricePerHour}€</span>
                                            </div>
                                        </div>
                                    )}

                                    {!service.limitedByPricePerHour && !service.limitedByPricePerGuest && (
                                        <div className="service-info">
                                            <DollarSign size={18} className="info-icon" />
                                            <div>
                                                <span className="info-label">Precio fijo:</span>
                                                <span className="info-value">{service.fixedPrice}€</span>
                                            </div>
                                        </div>
                                    )}

                                    {service.type === "venue" && (
                                        <>
                                            <div className="service-info">
                                                <Users size={18} className="info-icon" />
                                                <div>
                                                    <span className="info-label">Capacidad:</span>
                                                    <span className="info-value">{service.maxGuests} personas</span>
                                                </div>
                                            </div>

                                            <div className="service-info">
                                                <Package size={18} className="info-icon" />
                                                <div>
                                                    <span className="info-label">Superficie:</span>
                                                    <span className="info-value">{service.surface} m²</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {service.type === "otherService" && (
                                        <>
                                            <div className="service-description">
                                                <div>
                                                    <span className="description-label">Información adicional:</span>
                                                    <span className="description-text">{service.extraInformation}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="service-description">
                                        <span className="description-label">Descripción:</span>
                                        <p className="description-text">{service.description}</p>
                                    </div>

                                    <div style={{ marginTop: "5%" }} className="card-info">
                                        <span className="card-text">
                                            <img style={{ height: "25%", width: "100%" }}
                                                src={service.picture || "https://iili.io/3EpzvZx.png"}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://iili.io/3EpzvZx.png";
                                                }}
                                                alt="Imagen del servicio"></img>
                                        </span>
                                    </div>
                                </div>

                                <div className="service-footer">
                                    <button
                                        className={`disable-button ${service.available ? "disable-red" : "enable-green"}`}
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
                                                <span className="spinner"></span>
                                                Procesando...
                                            </>
                                        ) : (<>
                                            {service.available ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {service.available ? "Deshabilitar" : "Habilitar"}
                                        </>)}
                                        { }
                                    </button>

                                    <button
                                        className="edit-button"
                                        onClick={() =>
                                            navigate(`/misservicios/editar/${service.type}/${service.id}/`, {
                                                id: service.id,
                                                serviceType: service.type,
                                            })
                                        }
                                    >
                                        <Edit size={16} />
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '24px 0'
                        }}>
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                            disabled={page === 0}
                            style={{
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            borderRadius: 4,
                            width: 40, height: 40,
                            cursor: page === 0 ? 'not-allowed' : 'pointer',
                            marginRight: 8,
                            padding: 0
                            }}
                        >
                            <ChevronDown size={20} color="black" style={{ transform: 'rotate(90deg)' }} />
                        </button>
                    
                        <span style={{ fontWeight: 'bold', margin: '0 12px' }}>
                            Página {page + 1} de {totalPages}
                        </span>
                    
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                            disabled={page + 1 >= totalPages}
                            style={{
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            borderRadius: 4,
                            width: 40, height: 40,
                            cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer',
                            marginLeft: 8,
                            padding: 0
                            }}
                        >
                            <ChevronDown size={20} color="black" style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                        </div>
                    )}
                </div>
            )}
            {currentUser.plan && (
                services.filter((s) => s.available).length < (currentUser.plan == "PREMIUM" ? 10 : 3) ? (
                    <div className="create-service-container">
                        <button
                            className="create-service-button"
                            onClick={() => navigate("/misservicios/registrar")}
                        >
                            <Plus size={18} />
                            Crear nuevo servicio
                        </button>
                    </div>
                ) : (

                    <div className="warning-message">
                        <AlertCircle size={20} className="mr-2" />
                        Has excedido el límite de servicios activos ({currentUser.plan == "PREMIUM" ? "10" : "3"}) del plan {currentUser.plan}, deshabilita alguno antes de crear más
                    </div>
                )
            )}
        </div>
    )
}

export default Servicios

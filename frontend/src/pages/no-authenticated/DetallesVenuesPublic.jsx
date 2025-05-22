import { FaChevronLeft } from "react-icons/fa";
import { useState, useEffect } from "react";
import apiClient from '../../apiClient';
import { useParams, Link } from "react-router-dom";
import "../../static/resources/css/DetallesServicios.css";

export default function VenueDetailsPagePublic() {
    const { id } = useParams();
    const [serviceDetails, setServiceDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch detalles del servicio
    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        apiClient.get(`/api/venues/${id}`)
            .then(res => setServiceDetails(res.data))
            .catch(err => setError(err))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <p>Cargando detalles...</p>;
    if (error) return <p>Error al cargar detalles</p>;
    if (!serviceDetails) return null;

    return (
        <div className="details-container">
            <div className="details-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link to="/venues-public" className="btn-primary" style={{ backgroundColor: "transparent", color: "black", padding: 0, marginBottom: "1vh", marginRight: "1vh" }}>
                    <FaChevronLeft />
                </Link>
                <h1 style={{ marginBottom: "1vh" }}>{serviceDetails.name}</h1>
            </div>

            <div className="details-wrapper">
                {/* SIDEBAR */}
                <div className="sidebar">
                    <div className="photo-circle">
                        <img
                            src={serviceDetails.picture || "https://iili.io/3EpzvZx.png"}
                            onError={e => { e.target.onerror = null; e.target.src = "https://iili.io/3EpzvZx.png"; }}
                            alt="Imagen del servicio"
                        />
                    </div>
                </div>

                {/* DETALLES*/}
                <div className="details-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Ciudad</span>
                            <span className="info-value">{serviceDetails.cityAvailable}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Precio</span>
                            <span className="info-value">
                                {serviceDetails.limitedByPricePerGuest
                                    ? `${serviceDetails.servicePricePerGuest} €/persona`
                                    : serviceDetails.limitedByPricePerHour
                                        ? `${serviceDetails.servicePricePerHour} €/hora`
                                        : `${serviceDetails.fixedPrice}€`}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Código postal</span>
                            <span className="info-value">{serviceDetails.postalCode}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Capacidad máxima</span>
                            <span className="info-value">{serviceDetails.maxGuests}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Superficie</span>
                            <span className="info-value">{serviceDetails.surface}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Hora de apertura</span>
                            <span className="info-value">{serviceDetails.earliestTime}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Hora de cierre</span>
                            <span className="info-value">{serviceDetails.latestTime}</span>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Descripción</h2>
                        <p>{serviceDetails.description}</p>
                    </div>

                    <div className="info-section">
                    </div>
                </div>
            </div>
        </div>
    );
}

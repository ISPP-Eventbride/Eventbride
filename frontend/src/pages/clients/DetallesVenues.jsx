import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

import { useState, useEffect } from "react";
import apiClient from '../../apiClient';
import { useParams, Link } from "react-router-dom";
import "../../static/resources/css/DetallesServicios.css";

export default function VenueDetailsPage() {
    const { id } = useParams();
    const [serviceDetails, setServiceDetails] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jwtToken, setJwtToken] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cargar JWT
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) setJwtToken(token);
    }, []);

    // Fetch detalles del servicio
    useEffect(() => {
        if (!id || !jwtToken) return;
        setIsLoading(true);
        apiClient
            .get(`/api/venues/${id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })
            .then((res) => setServiceDetails(res.data))
            .catch((err) => setError(err))
            .finally(() => setIsLoading(false));
    }, [id, jwtToken]);


    const renderStars = () =>
        [1, 2, 3, 4, 5].map((n) => {
            const full = n <= Math.floor(rating);
            const half = rating >= n - 0.5 && rating < n;

            return (
                <span
                    key={n}
                    onMouseMove={(e) => {
                        const { left, width } = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        const isHalf = x < width / 2;
                        setRating(isHalf ? n - 0.5 : n);
                    }}
                    onClick={(e) => {
                        const { left, width } = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        const isHalf = x < width / 2;
                        setRating(isHalf ? n - 0.5 : n);
                    }}
                    style={{ cursor: "pointer", marginRight: 6 }}
                >
                    {full ? (
                        <FaStar size={24} color="#37d976" />
                    ) : half ? (
                        <FaStarHalfAlt size={24} color="#37d976" />
                    ) : (
                        <FaRegStar size={24} color="#ccc" />
                    )}
                </span>
            );
        });


    const submitReview = () => {
        console.log("Review:", { id, rating, comment });
        // Aquí puedes hacer una llamada a la API para guardar la reseña
    };

    if (isLoading) return <p>Cargando detalles...</p>;
    if (error) return <p>Error al cargar detalles</p>;
    if (!serviceDetails) return null;

    return (
        <div className="details-container">
            <div className="details-header">
                <h1>{serviceDetails.name}</h1>
            </div>

            <div className="details-wrapper">
                <div className="sidebar">
                    <div className="photo-circle">
                        <img
                            src={serviceDetails.picture || "https://iili.io/3EpzvZx.png"}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://iili.io/3EpzvZx.png";
                              }}
                              alt="Imagen del servicio"
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: "10vh" }}>
                        Valorar
                    </button>

                    <Link className="btn-primary" to="/venues" style={{ backgroundColor: "#f8f9fa", color: "black" }}>
                        Volver
                    </Link>
                </div>

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
                                        : `${serviceDetails.fixedPrice}€ fijo`}
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Código postal</span>
                            <span className="info-value">{serviceDetails.postalCode}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Capacidad máxima</span>
                            <span className="info-value">{serviceDetails.maxGuests} personas</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Superficie</span>
                            <span className="info-value">{serviceDetails.surface} m²</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Hora de apertura</span>
                            <span className="info-value">
                                {new Date(`1970-01-01T${serviceDetails.earliestTime}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })} h
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Hora de cierre</span>
                            <span className="info-value">
                                {new Date(`1970-01-01T${serviceDetails.latestTime}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })} h
                            </span>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Descripción</h2>
                        <p>{serviceDetails.description}</p>
                    </div>

                    <div className="info-section">
                        <h2>Comentarios:</h2>
                    </div>
                </div>
            </div>

            {/* MODAL DE VALORACIÓN */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "#dc3545" }}>
                            &times;
                        </button>
                        <h2>Valorar recinto</h2>
                        <div className="stars-display">{renderStars()}</div>
                        <textarea
                            className="comment-box"
                            style={{ backgroundColor: "white" }}
                            placeholder="Escribe tu reseña aquí..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                            className="btn-primary"
                            style={{ backgroundColor: "#37d976" }}
                            onClick={() => {
                                submitReview();
                                setIsModalOpen(false);
                            }}
                        >
                            Enviar valoración
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

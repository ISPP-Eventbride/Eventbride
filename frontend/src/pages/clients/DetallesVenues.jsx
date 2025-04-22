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
    const [ratings, setRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [alreadyRated, setAlreadyRated] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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

    useEffect(() => {
        if (!id || !jwtToken) return;

        apiClient
            .get(`/api/ratings/venue/${id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` }
            })
            .then((res) => setRatings(res.data))
            .catch((err) => console.error("Error cargando ratings:", err));
    }, [id, jwtToken]);


    useEffect(() => {
        if (!id || !jwtToken) return;

        apiClient
            .get(`/api/ratings/average/venue/${id}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })
            .then((res) => setAverageRating(res.data || 0))
            .catch((err) => console.error("Error al cargar promedio de rating", err));
    }, [id, jwtToken]);


    useEffect(() => {
        if (!id || !jwtToken) return;

        setAlreadyRated(ratings.some((r) => r.user?.id === currentUser.id));
    }, [id, jwtToken, ratings, currentUser.id]);


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
                        <FaStar size={30} color="rgb(255, 186, 209)" />
                    ) : half ? (
                        <FaStarHalfAlt size={30} color="rgb(255, 186, 209)" />
                    ) : (
                        <FaRegStar size={30} color="#ccc" />
                    )}
                </span>
            );
        });


    const submitReview = () => {
        console.log("Review:", { id, rating, comment });
        fetch("/api/ratings", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            method: "POST",
            body: JSON.stringify(
                {
                    stars: rating,
                    comment: comment,
                    createdAt: null,
                    userId: currentUser.id,
                    otherServiceId: null,
                    venueId: serviceDetails.id,
                }
            ),
        })
    };

    const renderCommentStars = (value) =>
        [1, 2, 3, 4, 5].map((n) =>
            n <= Math.floor(value) ? (
                <FaStar key={n} size={16} color="rgb(255, 186, 209)" />
            ) : value >= n - 0.5 ? (
                <FaStarHalfAlt key={n} size={16} color="rgb(255, 186, 209)" />
            ) : (
                <FaRegStar key={n} size={16} color="#ccc" />
            )
        );

    if (isLoading) return <p>Cargando detalles...</p>;
    if (error) return <p>Error al cargar detalles</p>;
    if (!serviceDetails) return null;

    return (
        <div className="details-container">
            <div className="details-header">
                <h1>{serviceDetails.name}</h1>
            </div>
            <Link className="btn-primary" to="/other-services" style={{ backgroundColor: "transparent", color: "black", display: "flex", justifyContent: "flex-end", flexDirection: "row" }}>
                Volver
            </Link>

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

                    {averageRating > 0 && (
                        <div className="stars-display" style={{ marginBottom: "1rem" }}>
                            {[1, 2, 3, 4, 5].map((n) =>
                                n <= Math.floor(averageRating) ? (
                                    <FaStar key={n} size={30} color="rgb(255, 186, 209)" />
                                ) : averageRating >= n - 0.5 ? (
                                    <FaStarHalfAlt key={n} size={30} color="rgb(255, 186, 209)" />
                                ) : (
                                    <FaRegStar key={n} size={30} color="#ccc" />
                                )
                            )}
                        </div>
                    )}
                    {!alreadyRated &&
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: "10vh" }}>
                            Valorar
                        </button>
                    }
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
                                        : `${serviceDetails.fixedPrice}€`}
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
                        {ratings.length === 0 ? (
                            <p style={{ color: "#999" }}>Este servicio aún no tiene valoraciones.</p>
                        ) : (
                            ratings.map((r, i) => (
                                <div key={i} className="comment-block" style={{ marginBottom: "16px" }}>
                                    <div className="stars-display" style={{ marginBottom: "4px" }}>
                                    </div>
                                    <p style={{ margin: 0 }}>
                                        <strong>{r.user?.username || "Anónimo"}:</strong> {r.comment}
                                    </p>
                                    <div className="stars-display2" style={{ marginBottom: "4px" }}>
                                        {renderCommentStars(r.stars)}
                                    </div>
                                    <span style={{ fontSize: "12px", color: "#999" }}>
                                        {new Date(r.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
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
                            style={{ backgroundColor: "rgb(255, 186, 209)" }}
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

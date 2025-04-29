import { FaStar, FaRegStar, FaStarHalfAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

    // Paginação de ratings
    const [ratings, setRatings] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(3);
    const [totalPages, setTotalPages] = useState(0);

    const [averageRating, setAverageRating] = useState(0);
    const [alreadyRated, setAlreadyRated] = useState(false);
    const [canVote, setCanVote] = useState(true);
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
        apiClient.get(`/api/venues/${id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
        })
            .then(res => setServiceDetails(res.data))
            .catch(err => setError(err))
            .finally(() => setIsLoading(false));
    }, [id, jwtToken]);

    // Fetch ratings paginados
    useEffect(() => {
        if (!id || !jwtToken) return;
        apiClient.get(`/api/ratings/venue/${id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
            params: { page, size }
        })
            .then(res => {
                setRatings(res.data.content);
                setTotalPages(res.data.totalPages);
            })
            .catch(err => console.error("Error cargando ratings:", err));
    }, [id, jwtToken, page, size]);

    // Fetch valoración media
    useEffect(() => {
        if (!id || !jwtToken) return;
        apiClient.get(`/api/ratings/average/venue/${id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
        })
            .then(res => setAverageRating(res.data || 0))
            .catch(err => console.error("Error al cargar promedio de rating", err));
    }, [id, jwtToken]);

    // Ver si ya valoró
    useEffect(() => {
        if (!serviceDetails?.id || !currentUser?.id || !jwtToken) return;
        const isVenue = true;

        apiClient.get(`/api/ratings/service/${serviceDetails.id}/isVoted/${currentUser.id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
            params: { isVenue }
        })
            .then(res => {
                setAlreadyRated(res.data === true || res.data === 1);
            })
            .catch(err => {
                console.error("Error al comprobar si ya votó:", err);
                setAlreadyRated(false);
            });

        apiClient.get(`/api/ratings/service/${serviceDetails.id}/canVote/${currentUser.id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
            params: { isVenue }
        })
            .then(res => {
                if (res.data === true || res.data === 1) {
                    setCanVote(true);
                } else {
                    setCanVote(false);
                }
            }
            )
            .catch(() => setCanVote(false));
    }, [serviceDetails, currentUser?.id, jwtToken]);

    const renderStars = () =>
        [1, 2, 3, 4, 5].map(n => {
            const full = n <= Math.floor(rating);
            const half = rating >= n - 0.5 && rating < n;
            return (
                <span key={n}
                    onMouseMove={e => {
                        const { left, width } = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        setRating(x < width / 2 ? n - 0.5 : n);
                    }}
                    onClick={e => {
                        const { left, width } = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - left;
                        setRating(x < width / 2 ? n - 0.5 : n);
                    }}
                    style={{ cursor: "pointer", marginRight: 6 }}
                >
                    {full
                        ? <FaStar size={30} color="#d9be75" />
                        : half
                            ? <FaStarHalfAlt size={30} color="#d9be75" />
                            : <FaRegStar size={30} color="#ccc" />
                    }
                </span>
            );
        });

    const renderCommentStars = value =>
        [1, 2, 3, 4, 5].map(n =>
            n <= Math.floor(value)
                ? <FaStar key={n} size={16} color="#d9be75" />
                : value >= n - 0.5
                    ? <FaStarHalfAlt key={n} size={16} color="#d9be75" />
                    : <FaRegStar key={n} size={16} color="#ccc" />
        );

    const submitReview = () => {
        fetch("/api/ratings", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            method: "POST",
            body: JSON.stringify({
                stars: rating,
                comment,
                createdAt: null,
                userId: currentUser.id,
                otherServiceId: null,
                venueId: serviceDetails.id,
            }),
        })
            .then(() => {
                setPage(0);
                setAlreadyRated(true);

                // Recargar ratings
                return apiClient.get(`/api/ratings/venue/${serviceDetails.id}`, {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                    params: { page: 0, size }
                });
            })
            .then(res => {
                setRatings(res.data.content);
                setTotalPages(res.data.totalPages);

                // Recargar media
                return apiClient.get(`/api/ratings/average/venue/${serviceDetails.id}`, {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                });
            })
            .then(res => {
                setAverageRating(res.data || 0);
            })
            .catch(err => console.error("Error enviando review:", err));
    };

    if (isLoading) return <p>Cargando detalles...</p>;
    if (error) return <p>Error al cargar detalles</p>;
    if (!serviceDetails) return null;

    return (
        <div className="details-container">
            <div className="details-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link to="/venues" className="btn-primary" style={{ backgroundColor: "transparent", color: "black", padding: 0, marginBottom: "1vh", marginRight: "1vh" }}>
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
                    <div className="stars-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
                        <span style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>Valoración media</span>
                        <div className="stars-display" style={{ display: "flex", gap: "0.25rem" }}>
                            {[1, 2, 3, 4, 5].map(n =>
                                n <= Math.floor(averageRating)
                                    ? <FaStar key={n} size={30} color="#d9be75" />
                                    : averageRating >= n - 0.5
                                        ? <FaStarHalfAlt key={n} size={30} color="#d9be75" />
                                        : <FaRegStar key={n} size={30} color="#ccc" />
                            )}
                        </div>
                    </div>
                    {!alreadyRated && canVote && (
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: "10vh" }}>
                            Valorar
                        </button>
                    )}
                </div>

                {/* DETALLES & COMENTARIOS */}
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
                        <h2>Comentarios:</h2>
                        {ratings?.length === 0 ? (
                            <p style={{ color: "#999" }}>Este servicio aún no tiene valoraciones.</p>
                        ) : (
                            ratings.map((r, i) => (
                                <div key={i} className="comment-block" style={{ marginBottom: "16px" }}>
                                    <p style={{ margin: 0 }}>
                                        <strong>{r.user?.username || "Anónimo"}:</strong> {r.comment}
                                    </p>
                                    <div className="stars-display2" style={{ margin: "4px 0" }}>
                                        {renderCommentStars(r.stars)}
                                    </div>
                                    <span style={{ fontSize: "12px", color: "#999" }}>
                                        {new Date(r.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}

                        {/* CONTROLES DE PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 16,
                                }}
                            >
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                                    disabled={page === 0}
                                    className="btn-primary"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "none",
                                        cursor: page === 0 ? "not-allowed" : "pointer",
                                        marginRight: "0.5vh",
                                        width: "0.5vh",
                                    }}
                                >
                                    <FaChevronLeft size={20} style={{ color: "black" }} />
                                </button>
                                <span style={{ fontWeight: "bold" }}>
                                    Página {page + 1} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                                    disabled={page + 1 >= totalPages}
                                    className="btn-primary"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "none",
                                        width: "0.5vh",
                                        padding: "10px 10px",
                                        cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                                    }}
                                >
                                    <FaChevronRight size={20} style={{ color: "black" }} />
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* MODAL DE VALORACIÓN */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="close-button"
                            onClick={() => setIsModalOpen(false)}
                            style={{ backgroundColor: "#dc3545" }}
                        >
                            &times;
                        </button>
                        <h2>Valorar recinto</h2>
                        <div className="stars-display">{renderStars()}</div>
                        <textarea
                            className="comment-box"
                            style={{ backgroundColor: "white", color: "black" }}
                            placeholder="Escribe tu reseña aquí..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <button
                            className="btn-primary"
                            style={{ backgroundColor: "#d9be75" }}
                            onClick={() => { submitReview(); setIsModalOpen(false); }}
                        >
                            Enviar valoración
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

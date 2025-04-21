import { MapPin, DollarSign } from "lucide-react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

import { useState, useEffect } from "react";
import apiClient from '../../apiClient';
import { useParams, Link } from "react-router-dom";
import "../../static/resources/css/DetallesServicios.css";

export default function ServiceDetailsPage() {
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
      .get(`/api/other-services/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((res) => setServiceDetails(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [id, jwtToken]);

  useEffect(() => {
    if (!id || !jwtToken) return;

    apiClient
      .get(`/api/ratings/other-service/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      .then((res) => setRatings(res.data))
      .catch((err) => console.error("Error cargando ratings:", err));
  }, [id, jwtToken]);

  useEffect(() => {
    if (!id || !jwtToken) return;

    apiClient
      .get(`/api/ratings/average/other-service/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((res) => setAverageRating(res.data || 0))
      .catch((err) => console.error("Error al cargar promedio de rating", err));
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
            <FaStar size={30} color="#37d976" />
          ) : half ? (
            <FaStarHalfAlt size={30} color="#37d976" />
          ) : (
            <FaRegStar size={30} color="#ccc" />
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

          {averageRating > 0 && (
            <div className="stars-display" style={{ marginBottom: "1rem" }}>
              {[1, 2, 3, 4, 5].map((n) =>
                n <= Math.floor(averageRating) ? (
                  <FaStar key={n} size={30} color="#37d976" />
                ) : averageRating >= n - 0.5 ? (
                  <FaStarHalfAlt key={n} size={30} color="#37d976" />
                ) : (
                  <FaRegStar key={n} size={30} color="#ccc" />
                )
              )}
            </div>
          )}

          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            Valorar
          </button>
        </div>


        <div className="details-info">
          <div className="info-grid">
            <div className="info-itemm">
              <MapPin size={16} className="icon" />
              <span>
                <strong>Ciudad:</strong> {serviceDetails.cityAvailable}
              </span>
            </div>
            <div className="info-itemm">
              <DollarSign size={16} className="icon" />
              <span>
                <strong>Precio:</strong>{" "}
                {serviceDetails.limitedByPricePerGuest
                  ? `${serviceDetails.servicePricePerGuest}€ / invitado`
                  : serviceDetails.limitedByPricePerHour
                    ? `${serviceDetails.servicePricePerHour}€ / hora`
                    : `${serviceDetails.fixedPrice}€`}
              </span>
            </div>
            <div className="info-itemm">
              <span className="badge">{serviceDetails.otherServiceType}</span>
            </div>
          </div>

          <div className="info-section">
            <h2>Descripción</h2>
            <p>{serviceDetails.description}</p>
          </div>

          {serviceDetails.extraInformation && (
            <div className="info-section">
              <h2>Información adicional</h2>
              <p>{serviceDetails.extraInformation}</p>
            </div>
          )}

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
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Link className="btn-primary" to="/other-services" style={{ backgroundColor: "transparent", color: "black", marginTop: "15vh" }}>
        Volver
      </Link>

      {/* MODAL DE VALORACIÓN */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "#dc3545" }}>
              &times;
            </button>
            <h2>Valorar servicio</h2>
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

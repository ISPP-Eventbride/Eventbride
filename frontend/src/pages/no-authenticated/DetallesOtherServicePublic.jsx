import { FaChevronLeft } from "react-icons/fa";
import { useState, useEffect } from "react";
import apiClient from '../../apiClient';
import { useParams, Link } from "react-router-dom";
import "../../static/resources/css/DetallesServicios.css";

export default function ServiceDetailsPagePublic() {
  const { id } = useParams();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch detalles del servicio u otro servicio
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    apiClient
      .get(`/api/other-services/${id}`)
      .then((res) => setServiceDetails(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [id]);


  if (isLoading) return <p>Cargando detalles...</p>;
  if (error) return <p>Error al cargar detalles</p>;
  if (!serviceDetails) return null;

  return (
    <div className="details-container">
      <div
        className="details-header"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <Link
          to="/other-services-public"
          title="volver a servicios"
          className="btn-primary"
          style={{ backgroundColor: "transparent", color: "black", padding: 0, marginBottom: "1vh", marginRight: "1vh" }}
        >
          <FaChevronLeft />
        </Link>
        <h1 style={{ marginBottom: "1vh" }}>{serviceDetails.name}</h1>
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

          <div
            className="stars-section"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
          </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

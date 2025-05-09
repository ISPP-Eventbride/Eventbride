import { useEffect, useState } from 'react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const jwt = window.localStorage.getItem("jwt");

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"; // Manejo de valores nulos o vacíos
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida"; // Manejo de fechas inválidas
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    // Realiza el fetch de las notificaciones
    fetch("/api/notifications",
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`
        }
      })
      .then((response) => response.json())
      .then((data) => setNotifications(data))
      .catch((error) => console.error('Error fetching notifications:', error));
  }, []);

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const currentNotifications = notifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div style={{ marginTop: 70, padding: '20px', minHeight: '80vh', display: 'flex', flex: 1, flexDirection: 'column' }}>
      {notifications.length > 0 ? (
        currentNotifications.map((notification, idx) => (
          <div
            key={startIndex+idx}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h4>{notification.subject}</h4>
            <p>{notification.message}</p>
            <small style={{ color: '#555' }}>
              {formatDate(notification.createdAt)} {/* Cambiado a createdAt */}
            </small>
          </div>
        ))
      ) : (
        <p>No hay notificaciones disponibles.</p>
      )}
      {notifications.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            disabled={page === 0}
          >
            ← Anterior
          </button>
          <span>Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            disabled={page + 1 >= totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default Notifications;
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import '../../static/resources/css/HistorialVentas.css';

const HistorialVentas = ({ userId }) => {
    const [ventas, setVentas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [withdrawError, setWithdrawError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [jwtToken] = useState(localStorage.getItem("jwt"));

    function getPaymentsForProvider() {
        setIsLoading(true);
        setError(null);

        if (!currentUser || !currentUser.id) {
            setError("No se ha encontrado información del usuario");
            setIsLoading(false);
            return;
        }

        fetch(`/api/payment/provider/${currentUser.id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            method: "GET",
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener los pagos");
                }
                return response.json();
            })
            .then(async data => {
                const pagosConDetalles = await Promise.all(
                    data.map(async (pago) => {
                        let serviceName = "Sin nombre";
                        let eventProp = null;

                        try {
                            // 1. Obtener eventPropertiesDTO
                            const epRes = await fetch(`/api/event-properties/provider/${pago.eventPropertiesId}`, {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${jwtToken}`,
                                }
                            });

                            eventProp = await epRes.json();

                            // 2. Obtener nombre del servicio
                            if (eventProp.venueDTO) {
                                serviceName = eventProp.venueDTO.name || "Venue";
                            } else if (eventProp.otherServiceDTO) {
                                serviceName = eventProp.otherServiceDTO.name || "Otro servicio";
                            }

                        } catch (err) {
                            console.warn(`Error obteniendo detalles para pago ID ${pago.id}:`, err);
                        }

                        return {
                            ...pago,
                            eventPropertiesDTO: eventProp,
                            serviceName
                        };
                    })
                );

                setVentas(pagosConDetalles);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error obteniendo pagos:", error);
                setError("No hay pagos todavía o ha ocurrido un error al cargarlos.");
                setIsLoading(false);
            });
    }

    useEffect(() => {
        getPaymentsForProvider();
    }, [userId]);

    const statusMap = {
        COMMISSION: 'Comisión',
        DEPOSIT: 'Pago reserva',
        PLAN: 'Plan',
        REMAINING: 'Pago restante'
    };

    function parseStatus(status) {
        return statusMap[status] || 'desconocido';
    }

    // Filtrar solo los pagos de tipo DEPOSIT y REMAINING
    const ventasFiltradas = ventas.filter(venta =>
        venta.paymentType === "DEPOSIT" || venta.paymentType === "REMAINING"
    );

    // Calcular el total disponible para retirar (suma de DEPOSIT y REMAINING)
    const totalDisponible = ventasFiltradas.reduce((total, venta) => {
        // Aplicamos el cálculo sin comisiones (amount/1.05)*0.975
        return total + venta.amount;
    }, 0);

    const handleWithdrawRequest = () => {
        setShowConfirmation(true);
    };

    const confirmWithdraw = () => {
        setIsWithdrawing(true);
        setWithdrawError(null);
        setWithdrawSuccess(false);
        setShowConfirmation(false);

        // Realizar la petición al backend para retirar el dinero
        fetch('/api/payment/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
                providerId: currentUser.id,
                amount: totalDisponible,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al procesar la solicitud de retiro');
                }
                return response.json();
            })
            .then(data => {
                setWithdrawSuccess(true);
                setWithdrawAmount(totalDisponible);
                // Actualizar la lista de pagos después de un retiro exitoso
                getPaymentsForProvider();
            })
            .catch(error => {
                console.error('Error en el retiro:', error);
                setWithdrawError(error.message || 'Ha ocurrido un error al procesar tu solicitud de retiro');
            })
            .finally(() => {
                setIsWithdrawing(false);
            });
    };

    const cancelWithdraw = () => {
        setShowConfirmation(false);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando tus ventas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button className="retry-button" onClick={getPaymentsForProvider}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="ventas-container">
            <div className="ventas-header">
                <h2 className="ventas-title">Mis Ventas</h2>
                <div className="ventas-summary">
                    <div className="summary-item">
                        <span className="summary-label">Total disponible:</span>
                        <span className="summary-value">{totalDisponible.toFixed(2)}€</span>
                    </div>
                </div>
            </div>

            {ventasFiltradas.length > 0 ? (
                <div className="tabla-container">
                    <div className="tabla-scroll">
                        <table className="ventas-tabla">
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Cantidad</th>
                                    <th>Fecha del pago</th>
                                    <th>Tipo de pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasFiltradas.map((venta, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                                        <td>
                                            {venta.eventPropertiesDTO?.venueDTO
                                                ? venta.eventPropertiesDTO.venueDTO.name
                                                : venta.eventPropertiesDTO?.otherServiceDTO
                                                    ? venta.eventPropertiesDTO.otherServiceDTO.name
                                                    : 'Sin nombre'}
                                        </td>
                                        <td>{venta.amount}€</td>
                                        <td>{new Date(venta.dateTime).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`payment-type ${venta.paymentType.toLowerCase()}`}>
                                                {parseStatus(venta.paymentType)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="comision-note">
                        A todos los pagos se le aplica una comisión del 2.5% tal y como indican los términos y condiciones.
                    </p>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p>No tienes pagos de reserva o restantes en este momento.</p>
                </div>
            )}

            <div className="withdraw-section">
                <h3 className="withdraw-title">Retirar fondos</h3>
                <div className="withdraw-content">
                    <div className="withdraw-info">
                        <p>Puedes retirar el total acumulado de tus pagos de reserva y restantes.</p>
                        <div className="withdraw-amount">
                            <span className="amount-label">Cantidad disponible:</span>
                            <span className="amount-value">{totalDisponible.toFixed(2)}€</span>
                        </div>
                    </div>

                    {totalDisponible > 0 ? (
                        <button
                            className="withdraw-button"
                            onClick={handleWithdrawRequest}
                            disabled={isWithdrawing || totalDisponible <= 0}
                        >
                            {isWithdrawing ? 'Procesando...' : 'Retirar fondos'}
                        </button>
                    ) : (
                        <p className="no-funds-message">No tienes fondos disponibles para retirar.</p>
                    )}

                    {withdrawSuccess && (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <p>Tu solicitud de retiro por {withdrawAmount.toFixed(2)}€ ha sido procesada correctamente.</p>
                        </div>
                    )}

                    {withdrawError && (
                        <div className="error-message">
                            <div className="error-icon">⚠️</div>
                            <p>{withdrawError}</p>
                        </div>
                    )}
                </div>
            </div>

            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <h3>Confirmar retiro de fondos</h3>
                        <p>¿Estás seguro de que deseas retirar <strong>{totalDisponible.toFixed(2)}€</strong>?</p>
                        <p className="confirmation-note">Esta acción no se puede deshacer.</p>
                        <div className="confirmation-buttons">
                            <button className="cancel-button" onClick={cancelWithdraw}>Cancelar</button>
                            <button className="confirm-button" onClick={confirmWithdraw}>Confirmar retiro</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialVentas;

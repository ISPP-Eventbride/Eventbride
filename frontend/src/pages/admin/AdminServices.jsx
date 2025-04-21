import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import "../../static/resources/css/AdminUsers.css";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [editServiceId, setEditServiceId] = useState(null);
  const [serviceData, setServiceData] = useState({});
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const jwtToken = localStorage.getItem("jwt");

  useEffect(() => {
    getServices();
  }, []);

  function getServices() {
    fetch("/api/services/admin", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Unificamos en un solo array, añadiendo un campo 'type' que distinga si es venue u other-service
        const otherServices = data.flatMap(d =>
          Array.isArray(d.otherServices)
            ? d.otherServices.map(s => ({ ...s, type: "other-services" }))
            : []
        );
        const venues = data.flatMap(d =>
          Array.isArray(d.venues)
            ? d.venues.map(v => ({ ...v, type: "venues" }))
            : []
        );
        const allServices = [...otherServices, ...venues];
        setServices(allServices);
      })
      .catch((err) => console.error("Error obteniendo servicios:", err));
  }

  function startEditing(service) {
    // Al empezar a editar, además de clonar los datos, calculamos 'limitedBy'
    // según los flags limitedByPricePerGuest y limitedByPricePerHour
    const calculatedLimitedBy = service.limitedByPricePerGuest
      ? "perGuest"
      : service.limitedByPricePerHour
      ? "perHour"
      : "fixed";

    setEditServiceId(service.id);
    setServiceData(prev => ({
      ...prev,
      [service.id]: {
        ...service,
        // Añadimos un campo 'limitedBy' para simplificar la lógica
        limitedBy: calculatedLimitedBy,
      }
    }));
  }

  function handleInputChange(e, serviceId) {
    const { name, value, type, checked } = e.target;
    setServiceData(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  }

  // Si quieres un manejador aparte para el select de precio:
  function handleLimitedByChange(e, serviceId) {
    const value = e.target.value;
    setServiceData(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        limitedBy: value,
      },
    }));
  }


 function validateServiceData(service) {
    setError("");                   
    const data = serviceData[service.id];
    const missing = [];

    // 1) Campos comunes
    if (!data.name?.trim())           missing.push("Nombre");
    if (!data.cityAvailable?.trim())  missing.push("Ciudad");
    if (!data.description?.trim())    missing.push("Descripción");

    // 2) Según método de precio
    switch (data.limitedBy) {
      case "perGuest":
        if (data.servicePricePerGuest == null || isNaN(data.servicePricePerGuest) || data.servicePricePerGuest <= 0) {
          missing.push("Precio por invitado");
        }
        break;
      case "perHour":
        if (data.servicePricePerHour == null || isNaN(data.servicePricePerHour) || data.servicePricePerHour <= 0) {
          missing.push("Precio por hora");
        }
        break;
      case "fixed":
        if (data.fixedPrice == null || isNaN(data.fixedPrice) || data.fixedPrice <= 0) {
          missing.push("Precio fijo");
        }
        break;
      default:
        missing.push("Tipo de precio");
    }

    // 3) Campos extra para venues
    if (service.type === "venues") {

      if (!data.postalCode?.trim())   
        missing.push("Código postal");

      if (!data.coordinates?.trim())   
        missing.push("Coordenadas");

      if (!data.address?.trim())      
        missing.push("Dirección");

      if (data.maxGuests == null|| isNaN(data.maxGuests)|| data.maxGuests < 1)     
        missing.push("Máximo de invitados");

      if (data.surface == null || isNaN(data.surface) || data.surface < 1)      
         missing.push("Superficie");

      if (!data.earliestTime)          
        missing.push("Hora de apertura");

      if (!data.latestTime)            
        missing.push("Hora de cierre");

      if(data.earliestTime && data.latestTime && data.earliestTime >= data.latestTime) {
        missing.push("La hora de apertura debe ser anterior a la hora de cierre");
      }
    }

    // 4) Campos extra para other-services
    if (service.type === "other-services") {

      if (!data.otherServiceType?.trim()) 
        missing.push("Tipo de servicio");

      if (!data.extraInformation?.trim()) 
        missing.push("Información adicional");
    }

    if (missing.length) {
      setError(
        "Faltan datos obligatorios: " +
        missing.join(", ")
      );
      return false;
    }
    return true;
  }



  function updateService(service) {
    if (!validateServiceData(service)) return;
  
    const dataToUpdate = { ...serviceData[service.id] };

    dataToUpdate.user = { id: dataToUpdate.userDTO.id };
    delete dataToUpdate.userDTO;

    dataToUpdate.limitedByPricePerGuest = dataToUpdate.limitedBy === "perGuest";
    dataToUpdate.limitedByPricePerHour = dataToUpdate.limitedBy === "perHour";
    delete dataToUpdate.limitedBy;

    dataToUpdate.maxGuests = parseInt(dataToUpdate.maxGuests, 10);
  
    fetch(`/api/${service.type}/admin/${service.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(dataToUpdate),
    })
      .then((res) => res.json())
      .then((updatedServicePartial) => {
        // Fusionamos el objeto original con los datos actualizados que nos devuelve el PUT
        setServices((prev) =>
          prev.map((s) =>
            s.id === updatedServicePartial.id ? { ...s, ...updatedServicePartial } : s
          )
        );
        setEditServiceId(null);
        setError("");
      })
      .catch((err) => {
        console.error("Error actualizando servicio:", err);
        setError("Error actualizando servicio");
      });
  }
  

  function searchServiceById() {
    if (!searchId.trim()) {
      setFilteredServices([]);
      return;
    }
    const found = services.find((s) => String(s.id) === searchId.trim());
    if (found) {
      setFilteredServices([found]);
      setError("");
    } else {
      setFilteredServices([]);
      setError("No se encontró ningún servicio con ese ID.");
    }
  }

  return (
    <>
      {/* Barra de búsqueda */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "6%",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "40%",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Buscar por ID de servicio..."
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              if (!e.target.value.trim()) {
                setFilteredServices([]);
                setError("");
              }
            }}
            style={{
              padding: "10px",
              maxWidth: "40%",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              color: "black",
            }}
          />
          <button
            onClick={searchServiceById}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#007BFF",
              color: "white",
              maxWidth: "20%",
              border: "none",
            }}
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setSearchId("");
              setFilteredServices([]);
              setError("");
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              maxWidth: "20%",
              backgroundColor: "#ccc",
              border: "none",
            }}
          >
            Limpiar
          </button>
        </div>
      </div>
  
      {/* Mensajes de error */}
      {error && (
        <div
          className="error-message"
          style={{
            color: "red",
            padding: "10px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
  
      {/* Listado de servicios (solo si eres ADMIN) */}
      {currentUser?.role === "ADMIN" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {(filteredServices.length > 0 ? filteredServices : services).map(
            (service, index) => {
              const isEditing = editServiceId === service.id;
              const data = serviceData[service.id] || service;
  
              return (
                <div key={index} className="service-container">
                  <h2 className="service-title">Servicio ID: {service.id}</h2>
                  <h3 className="service-title">{data.name}</h3>
                  <h2 className="service-title">De {data.userDTO.email}</h2>
  
                  <div className="service-info">
                    <form
                      style={{ width: "100%" }}
                      onSubmit={(e) => e.preventDefault()}
                    >
                      {/* Nombre */}
                      <div className="form-group">
                        <label>Nombre:</label>
                        <input
                          name="name"
                          value={data.name || ""}
                          required={isEditing === true}
                          onChange={(e) => handleInputChange(e, service.id)}
                          readOnly={!isEditing}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                                    <label htmlFor="available" className="form-label">
                                        Disponibilidad
                                    </label>
                                    <div className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="available"
                                            name="available"
                                            checked={data.available}
                                            onChange={(e) => handleInputChange(e, service.id)}
                                            className="form-checkbox"
                                            disabled={!isEditing}
                                        />
                                        <span>Servicio disponible para reservas</span>
                                    </div>
                                </div>
  
                      {/* Ciudad */}
                      <div className="form-group">
                        <label>Ciudad Disponible:</label>
                        <input
                          name="cityAvailable"
                          value={data.cityAvailable || ""}
                          required={isEditing === true }
                          onChange={(e) => handleInputChange(e, service.id)}
                          readOnly={!isEditing}
                          className="form-input"
                        />
                      </div>
  
                      {/* Descripción */}
                      <div className="form-group">
                        <label>Descripción:</label>
                        <textarea
                          name="description"
                          value={data.description || ""}
                          required={isEditing === true }
                          onChange={(e) => handleInputChange(e, service.id)}
                          readOnly={!isEditing}
                          className="form-input"
                          rows={5}
                        />
                      </div>
  
                      {/* Selección del tipo de precio (solo en edición) */}
                      {isEditing && (
                        <div className="form-group">
                          <label>Tipo de Precio:</label>
                          <select
                            name="limitedBy"
                            value={data.limitedBy || ""}
                            required={isEditing === true }
                            onChange={(e) =>
                              handleLimitedByChange(e, service.id)
                            }
                            className="form-input"
                          >
                            <option value="perGuest">Por invitado</option>
                            <option value="perHour">Por hora</option>
                            <option value="fixed">Precio fijo</option>
                          </select>
                        </div>
                      )}
  
                      {/* Sección de Precios */}
                      {isEditing ? (
                        <>
                          {data.limitedBy === "perGuest" && (
                            <div className="form-group">
                              <label>Precio por Invitado (€):</label>
                              <input
                                type="number"
                                name="servicePricePerGuest"
                                value={data.servicePricePerGuest || 0}
                                min= "1"
                                required={isEditing === true }
                                onChange={(e) =>
                                  handleInputChange(e, service.id)
                                }
                                className="form-input"
                              />
                            </div>
                          )}
                          {data.limitedBy === "perHour" && (
                            <div className="form-group">
                              <label>Precio por Hora (€):</label>
                              <input
                                type="number"
                                name="servicePricePerHour"
                                value={data.servicePricePerHour || 0}
                                min= "1"
                                required={isEditing === true }
                                onChange={(e) =>
                                  handleInputChange(e, service.id)
                                }
                                className="form-input"
                              />
                            </div>
                          )}
                          {data.limitedBy === "fixed" && (
                            <div className="form-group">
                              <label>Precio Fijo (€):</label>
                              <input
                                type="number"
                                name="fixedPrice"
                               
                                value={data.fixedPrice || 0}
                                min= "1"
                                required={isEditing === true }
                                onChange={(e) =>
                                  handleInputChange(e, service.id)
                                }
                                className="form-input"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {service.limitedByPricePerGuest && (
                            <div className="form-group">
                              <label>Precio por Invitado (€):</label>
                              <span
                               className="form-input"
                              >
                                {data.servicePricePerGuest || 0}
                              </span>
                            </div>
                          )}
                          {service.limitedByPricePerHour && (
                            <div className="form-group">
                              <label>Precio por Hora (€):</label>
                              <span
                                className="form-input"
                              >
                                {data.servicePricePerHour || 0}
                              </span>
                            </div>
                          )}
                          {(!service.limitedByPricePerGuest &&
                            !service.limitedByPricePerHour) && (
                            <div className="form-group">
                              <label>Precio Fijo (€):</label>
                              <span
                                className="form-input"
                              >
                                {data.fixedPrice || 0}
                              </span>
                            </div>
                          )}
                        </>
                      )}
  
                      {/* Si es venue, pintamos campos de recinto */}
                      {service.type === "venues" && (
                        <>
                          <div className="form-group">
                            <label>Código Postal:</label>
                            <input
                              name="postalCode"
                              value={data.postalCode || ""}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Coordenadas:</label>
                            <input
                              name="coordinates"
                              value={data.coordinates || ""}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Dirección:</label>
                            <input
                              name="address"
                              value={data.address || ""}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Máximo de Invitados:</label>
                            <input
                              type="number"
                              name="maxGuests"
                              value={data.maxGuests || 0}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Superficie (m²):</label>
                            <input
                              type="number"
                              name="surface"
                              value={data.surface || 0}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Hora de Apertura:</label>
                            <input
                              type="time"
                              name="earliestTime"
                              value={data.earliestTime || ""}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
  
                          <div className="form-group">
                            <label>Hora de Cierre:</label>
                            <input
                              type="time"
                              name="latestTime"
                              value={data.latestTime || ""}
                              required={isEditing === true}
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                            />
                          </div>
                        </>
                      )}
  
                      {/* Si es otro servicio, pintamos los campos extra */}
                      {service.type === "other-services" && (
                        <>
                          <div className="form-group">
                            <label>Tipo de Servicio:</label>
                            <select
                              name="otherServiceType"
                              value={data.otherServiceType || "CATERING"}
                              required={isEditing === true }
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              disabled={!isEditing}
                              className="form-input"
                            >
                              <option value="CATERING">Catering</option>
                              <option value="ENTERTAINMENT">
                                Entretenimiento
                              </option>
                              <option value="DECORATION">
                                Decoración
                              </option>
                            </select>
                          </div>
  
                          <div className="form-group">
                            <label>Información Adicional:</label>
                            <textarea
                              name="extraInformation"
                              value={data.extraInformation || ""}
                              required={isEditing === true}
                              onChange={(e) =>
                                handleInputChange(e, service.id)
                              }
                              readOnly={!isEditing}
                              className="form-input"
                              rows={5}
                            />
                          </div>
                        </>
                      )}
  
                      {/* Botones de editar/guardar */}
                      <div className="button-container" style={{ marginTop: "10px" }}>
                        {isEditing ? (
                          <button
                            className="save-btn"
                            style={{
                              backgroundColor: "#4CAF50",
                              color: "#fff",
                              padding: "8px 16px",
                              border: "none",
                              borderRadius: "8px",
                            }}
                            onClick={() => updateService(service)}
                          >
                            Guardar
                          </button>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => startEditing(service)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <p>No tienes permisos para ver esta sección.</p>
      )}
    </>
  );
  
}

export default AdminServices


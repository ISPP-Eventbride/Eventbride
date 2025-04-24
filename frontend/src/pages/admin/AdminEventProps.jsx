import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "../../static/resources/css/AdminUsers.css";
import { useAlert } from "../../context/AlertContext"

function AdminEventProps() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [jwtToken] = useState(localStorage.getItem("jwt"));
  const { eventId, eventPropId } = useParams();
  const [eventPropData, setEventPropData] = useState({});
  const [editMode, setEditMode] = useState(true);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");


  const { showAlert } = useAlert()

  useEffect(() => {
    getEventProp();
  }, []);

  function getEventProp() {
    fetch(`/api/event-properties/DTO/${eventPropId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setEventPropData(data);
        /*console.log(data);*/
        setFormData({
          requestDate: data.requestDate?.split("T")[0],
          status: data.status || "PENDING",
          startTime: data.startTime ? data.startTime.substring(0, 5) : "00:00:00",
          finishTime: data.finishTime ? data.finishTime.substring(0, 5) : "00:00:00",
        });
      })
      .catch((err) => console.error("Error obteniendo las propiedades:", err));
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function updateEventProp() {
    setError("");
  
    const buildDateTime = (date, time) => {
      const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
      return `${date}T${timeWithSeconds}`;
    };
  
    const startDateTime = buildDateTime(formData.requestDate, formData.startTime);
    const finishDateTime = buildDateTime(formData.requestDate, formData.finishTime);
  
    const start = new Date(startDateTime);
    const finish = new Date(finishDateTime);
  
    if (isNaN(start.getTime()) || isNaN(finish.getTime())) {
      setError("Las fechas u horas introducidas no son válidas.");
      showAlert("Las fechas u horas introducidas no son válidas.")
      return;
    }
  
    if (finish <= start) {
      setError("La hora de finalización debe ser posterior a la hora de inicio.");
      showAlert("La hora de finalización debe ser posterior a la hora de inicio.")
      return;
    }

    /* meter en el payload solo lo esencial que espera el controlador*/
    const payload = {
        startTime: startDateTime,
        endTime: finishDateTime,
        status: formData.status,
    };
  
    /*console.log("Payload enviado:", payload);*/
    fetch(`/api/event-properties/admin/${eventPropId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((updated) => {
        setEventPropData(updated);
        setEditMode(false);
        navigate(`/admin-events`);
        setError("");
      })
      .catch(err => {
        console.error("Error actualizando:", err);
        showAlert(err.message || "Error inesperado")
        setError(err.message || "Error inesperado");
      });
  }

  const statusOptions = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED", "DEPOSIT_PAID"];

  return (
    <div className="form-section" style={{ marginTop: "6%", padding: "20px" }}>


      {error && (
        <div className="error-message" style={{ color: "red", display: "flex", alignItems: "center", gap: "5px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {currentUser?.role === "ADMIN" ?(
        <div className="service-container">
          {eventPropData.otherServiceDTO ? (
            <>
            <h3 className="service-title">
                Editar Servicio: {eventPropData.otherServiceDTO?.name || ""}
            </h3>
                <h3 className="service-title">
                Id del evento asociado: {eventId}
            </h3>
            </>
            ) : eventPropData.venueDTO ? (
            <>
            <h3 className="service-title">
                Editar Recinto: {eventPropData.venueDTO?.name || ""}
            </h3>
            <h3 className="service-title">
                Id del evento asociado: {eventId}
            </h3>
                </>
            ) : (
            <h3 className="service-title">Sin servicio asociado</h3>
          )}
          <div className="service-info" style= {{alignItems: 'center'}}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label>Estado: {editMode && <span className="asterisk">*</span>}</label>
                        <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required={editMode === true}
                        disabled={!editMode}
                        >
                        {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Hora de inicio:{editMode && <span className="asterisk">*</span>}</label>
                        <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required={editMode === true}
                        readOnly={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Hora de finalización:{editMode && <span className="asterisk">*</span>}</label>
                        <input
                        type="time"
                        name="finishTime"
                        min = {formData.earliestTime}
                        value={formData.finishTime}
                        onChange={handleInputChange}
                        required={editMode === true}
                        readOnly={!editMode}
                        />
                    </div>

                    <div className="button-container" style={{ marginTop: "20px" }}>
                        {editMode ? (
                        <button className="save-btn" style={{ backgroundColor: "#4CAF50" }} onClick={updateEventProp}>
                            Guardar
                        </button>
                        ) : (
                        <button className="edit-btn" onClick={() => setEditMode(true)}>
                            Editar
                        </button>
                        )}
                    </div>
                </form>
          </div>
        </div>
      ) : (
        <p>Este servicio no es un servicio adicional o no tienes permisos para editarlo.</p>
      )}
    </div>
  );
}

export default AdminEventProps;



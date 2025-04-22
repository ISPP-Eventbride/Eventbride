"use client"

import {useRef, useState} from "react"
import { useNavigate } from "react-router-dom"
import {
    AlertCircle,
    Clock,
    DollarSign,
    MapPin,
    Save,
    Users,
    Home,
    Info,
    Image,
    FileText,
    Mail,
    Package,
    SquareIcon,
} from "lucide-react"
import "../../static/resources/css/RegistrarServicio.css"

const PicturePattern = /^https?:\/\/\S+\.(?:png|jpg|jpeg|gif|bmp|webp)(?:\?\S*)?$/i;

const RegistrarServicio = () => {
    // Obtener datos user desde localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const [jwtToken] = useState(localStorage.getItem("jwt"));

    const [generalError, setGeneralError] = useState("") //Error si te pasas del numero de servicios permitidos

    const [serviceType, setServiceType] = useState("unselected")
    const [limitedBy, setLimitedBy] = useState("perGuest")
    const [errors] = useState({
        name: "",
        cityAvailable: "",
        servicePricePerGuest: "",
        servicePricePerHour: "",
        fixedPrice: "",
        picture: "",
        description: "",
        otherServiceType: "",
        postalCode: "",
        coordinates: "",
        address: "",
        maxGuests: "",
        surface: "",
        earliestTime: "",
        latestTime: "",
        extraInformation: "",
    })

    const navigate = useNavigate()
    const errorRef = useRef(null);
  const scrollToError = () => {
    errorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

    const [formData, setFormData] = useState({
        name: "",
        available: false,
        cityAvailable: "",
        servicePricePerGuest: 0,
        servicePricePerHour: 0,
        fixedPrice: 0,
        picture: "",
        description: "",
        limitedByPricePerGuest: false,
        limitedByPricePerHour: false,
        otherServiceType: "CATERING",
        postalCode: "",
        coordinates: "",
        address: "",
        maxGuests: 0,
        surface: 0,
        earliestTime: "",
        latestTime: "",
        extraInformation: "",
        user: {
            id: currentUser.id,
        },
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        formData.limitedByPricePerGuest = limitedBy === "perGuest"
        formData.limitedByPricePerHour = limitedBy === "perHour"

        console.log("General error:", generalError)

        fetch("/api/" + serviceType, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            method: "POST",
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                const data = await response.json()
                if (!response.ok) {
                    if (data.error) {
                        setGeneralError(data.error)
                    } else {
                        setGeneralError("Ocurrió un error inesperado")
                    }
                    scrollToError()
                    throw new Error("Solicitud fallida")
                } else {
                    setGeneralError("") // Limpia el mensaje anterior
                    navigate("/misservicios")
                }
            })
            .catch((error) => {
                console.error("Error creando servicio:", error)
            })

    }

    return (
        <div className="service-registration-container" ref={errorRef}>
            <div className="service-registration-header">
                <h1 className="service-registration-title">Registrar Servicio</h1>
                <h2 className="service-registration-subtitle">¿Qué tipo de servicio deseas registrar?</h2>
            </div>

            <select
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="service-type-select"
            >
                <option value="unselected" className="hidden-option" disabled>
                    Selecciona un tipo de servicio
                </option>
                <option value="venues">Recinto para eventos</option>
                <option value="other-services">Otro tipo de servicio</option>
            </select>

            {serviceType !== "unselected" && (
                <div className="form-container">
                    {generalError && (
                        <div className="error-message general-error">
                            <AlertCircle size={16} className="mr-2" />
                            {generalError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>

                        <div className="form-section">
                            <h3 className="form-section-title">Información básica del servicio</h3>

                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    <Package size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                    Nombre del servicio <span className="asterisk">*</span>
                                </label>
                                {errors.name && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        {errors.name}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    minLength="1"
                                    maxLength="500"
                                    className="form-input"
                                    placeholder="Ej: Salón de eventos El Dorado"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cityAvailable" className="form-label">
                                        <MapPin size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Ciudad disponible <span className="asterisk">*</span>
                                    </label>
                                    {errors.cityAvailable && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.cityAvailable}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        id="cityAvailable"
                                        name="cityAvailable"
                                        value={formData.cityAvailable}
                                        onChange={handleChange}
                                        required
                                        minLength="1"
                                        maxLength="30"
                                        className="form-input"
                                        placeholder="Ej: Madrid"
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
                                            checked={formData.available}
                                            onChange={handleChange}
                                            className="form-checkbox"
                                        />
                                        <span>Servicio disponible para reservas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="limitedBy" className="form-label">
                                    <DollarSign size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                    Tipo de tarifa <span className="asterisk">*</span>
                                </label>
                                <select
                                    id="limitedBy"
                                    value={limitedBy}
                                    onChange={(e) => setLimitedBy(e.target.value)}
                                    required
                                    className="form-select"
                                >
                                    <option value="perGuest">Por invitado</option>
                                    <option value="perHour">Por hora</option>
                                    <option value="fixed">Precio fijo</option>
                                </select>
                            </div>

                            {limitedBy === "perGuest" && (
                                <div className="form-group">
                                    <label htmlFor="servicePricePerGuest" className="form-label">
                                        <Users size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Precio por invitado (€) <span className="asterisk">*</span>
                                    </label>
                                    {errors.servicePricePerGuest && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.servicePricePerGuest}
                                        </div>
                                    )}
                                    <input
                                        type="number"
                                        id="servicePricePerGuest"
                                        name="servicePricePerGuest"
                                        value={formData.servicePricePerGuest}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="form-input"
                                        placeholder="Ej: 25.50"
                                    />
                                </div>
                            )}

                            {limitedBy === "perHour" && (
                                <div className="form-group">
                                    <label htmlFor="servicePricePerHour" className="form-label">
                                        <Clock size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Precio por hora (€) <span className="asterisk">*</span>
                                    </label>
                                    {errors.servicePricePerHour && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.servicePricePerHour}
                                        </div>
                                    )}
                                    <input
                                        type="number"
                                        id="servicePricePerHour"
                                        name="servicePricePerHour"
                                        value={formData.servicePricePerHour}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="form-input"
                                        placeholder="Ej: 100.00"
                                    />
                                </div>
                            )}

                            {limitedBy === "fixed" && (
                                <div className="form-group">
                                    <label htmlFor="fixedPrice" className="form-label">
                                        <DollarSign size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Precio fijo (€) <span className="asterisk">*</span>
                                    </label>
                                    {errors.fixedPrice && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.fixedPrice}
                                        </div>
                                    )}
                                    <input
                                        type="number"
                                        id="fixedPrice"
                                        name="fixedPrice"
                                        value={formData.fixedPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="form-input"
                                        placeholder="Ej: 500.00"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="picture" className="form-label">
                                    <Image size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                    URL de la imagen <span className="asterisk">*</span>
                                </label>
                                {errors.picture && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        {errors.picture}
                                    </div>
                                )}
                                <input
                                    type="url"
                                    id="picture"
                                    name="picture"
                                    value={formData.picture}
                                    onChange={handleChange}
                                    required
                                    pattern={PicturePattern.source}
                                    minLength="1"
                                    maxLength="1000"
                                    className="form-input"
                                    placeholder="Ej: https://ejemplo.com/imagen.jpg"
                                    onInvalid={e => {
                                        const val = e.target.value;
                                        if (!val) {
                                          e.target.setCustomValidity("La URL es obligatoria");
                                        } else {
                                          e.target.setCustomValidity(
                                            "La URL debe empezar por http(s):// y terminar en .png|.jpg|…"
                                          );
                                        }
                                    }}
                                    onInput={e => e.target.setCustomValidity("")}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="form-label">
                                    <FileText size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                    Descripción <span className="asterisk">*</span>
                                </label>
                                {errors.description && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        {errors.description}
                                    </div>
                                )}
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    minLength="1"
                                    maxLength="5000"
                                    className="form-input"
                                    rows={4}
                                    placeholder="Describe tu servicio con detalle..."
                                />
                            </div>
                        </div>

                        {serviceType === "venues" && (
                            <div className="form-section">
                                <h3 className="form-section-title">Información específica del recinto</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="address" className="form-label">
                                            <Home size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Dirección <span className="asterisk">*</span>
                                        </label>
                                        {errors.address && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.address}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            minLength="1"
                                            maxLength="50"
                                            className="form-input"
                                            placeholder="Ej: Calle Principal 123"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="postalCode" className="form-label">
                                            <Mail size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Código postal <span className="asterisk">*</span>
                                        </label>
                                        {errors.postalCode && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.postalCode}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            required
                                            minLength="1"
                                            maxLength="5"
                                            className="form-input"
                                            placeholder="Ej: 28001"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="coordinates" className="form-label">
                                        <MapPin size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Coordenadas <span className="asterisk">*</span>
                                    </label>
                                    {errors.coordinates && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.coordinates}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        id="coordinates"
                                        name="coordinates"
                                        value={formData.coordinates}
                                        onChange={handleChange}
                                        required
                                        minLength="1"
                                        maxLength="30"
                                        className="form-input"
                                        placeholder="Ej: 40.4168, -3.7038"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="maxGuests" className="form-label">
                                            <Users size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Máximo de invitados <span className="asterisk">*</span>
                                        </label>
                                        {errors.maxGuests && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.maxGuests}
                                            </div>
                                        )}
                                        <input
                                            type="number"
                                            id="maxGuests"
                                            name="maxGuests"
                                            value={formData.maxGuests}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="form-input"
                                            placeholder="Ej: 100"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="surface" className="form-label">
                                            <SquareIcon size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Superficie (m²) <span className="asterisk">*</span>
                                        </label>
                                        {errors.surface && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.surface}
                                            </div>
                                        )}
                                        <input
                                            type="number"
                                            id="surface"
                                            name="surface"
                                            value={formData.surface}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="form-input"
                                            placeholder="Ej: 200"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="earliestTime" className="form-label">
                                            <Clock size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Hora de apertura <span className="asterisk">*</span>
                                        </label>
                                        {errors.earliestTime && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.earliestTime}
                                            </div>
                                        )}
                                        <input
                                            type="time"
                                            id="earliestTime"
                                            name="earliestTime"
                                            value={formData.earliestTime}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="latestTime" className="form-label">
                                            <Clock size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                            Hora de cierre <span className="asterisk">*</span>
                                        </label>
                                        {errors.latestTime && (
                                            <div className="error-message">
                                                <AlertCircle size={14} />
                                                {errors.latestTime}
                                            </div>
                                        )}
                                        <input
                                            type="time"
                                            id="latestTime"
                                            name="latestTime"
                                            min = {formData.earliestTime}
                                            value={formData.latestTime}
                                            onChange={e => {
                                                handleChange(e);
                                                const input = e.target;
                                                // pongo el custom message si es anterior o igual
                                                if (formData.earliestTime && input.value <= formData.earliestTime) {
                                                  input.setCustomValidity(
                                                    "La hora de cierre debe ser posterior a la de apertura"
                                                  );
                                                } else {
                                                  input.setCustomValidity("");
                                                }
                                                // fuerzo repintado de la validación en caliente
                                                input.reportValidity();
                                              }}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="submit-button">
                                    <Save size={18} />
                                    Registrar recinto
                                </button>
                            </div>
                        )}

                        {serviceType === "other-services" && (
                            <div className="form-section">
                                <h3 className="form-section-title">Información específica del servicio</h3>

                                <div className="form-group">
                                    <label htmlFor="otherServiceType" className="form-label">
                                        <Package size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Tipo de servicio <span className="asterisk">*</span>
                                    </label>
                                    {errors.otherServiceType && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.otherServiceType}
                                        </div>
                                    )}
                                    <select
                                        id="otherServiceType"
                                        name="otherServiceType"
                                        value={formData.otherServiceType}
                                        onChange={handleChange}
                                        required
                                        className="form-select"
                                    >
                                        <option value="CATERING">Catering</option>
                                        <option value="ENTERTAINMENT">Entretenimiento</option>
                                        <option value="DECORATION">Decoración</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="extraInformation" className="form-label">
                                        <Info size={16} className="inline-block mr-2" style={{ color: "#d9be75" }} />
                                        Información adicional <span className="asterisk">*</span>
                                    </label>
                                    {errors.extraInformation && (
                                        <div className="error-message">
                                            <AlertCircle size={14} />
                                            {errors.extraInformation}
                                        </div>
                                    )}
                                    <textarea
                                        id="extraInformation"
                                        name="extraInformation"
                                        value={formData.extraInformation}
                                        onChange={handleChange}
                                        required
                                        minLength="1"
                                        maxLength="5000"
                                        className="form-input"
                                        rows={4}
                                        placeholder="Proporciona detalles adicionales sobre tu servicio..."
                                    />
                                </div>

                                <button type="submit" className="submit-button">
                                    <Save size={18} />
                                    Registrar servicio
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    )
}

export default RegistrarServicio

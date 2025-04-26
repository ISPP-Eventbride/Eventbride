"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react" // Importa un icono de alerta (puedes usar cualquier librería de iconos que tengas)
import "../../static/resources/css/EditProfile.css"
import { useAlert } from "../../context/AlertContext"

const dniPattern = /^[0-9]{8}[A-Za-z]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telephonePattern = /^[0-9]{9}$/;
const profilePicturePattern = /^https?:\/\/\S+\.(?:png|jpg|jpeg|gif|bmp|webp)(?:\?\S*)?$/i;

function EditProfile() {
    const [userData, setUserData] = useState({
        id: "",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        telephone: "",
        dni: "",
        profilePicture: "",
        role: "",
        plan: "",
        paymentPlanDate: "",
        expirePlanDate: "",
        receivesEmails: false,
    })
    const [editing, setEditing] = useState(false)
    const [jwtToken, setJwtToken] = useState("")
    const [originalUsername, setOriginalUsername] = useState("")
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
      oldPassword: "",
      newPassword: "",
    });
    const { showAlert } = useAlert()

    useEffect(() => {
        // Get JWT token from localStorage
        const token = localStorage.getItem("jwt")
        if (token) {
            setJwtToken(token)
        }

        // Get user data from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        if (storedUser && storedUser.id) {
            setUserData(storedUser)
            setOriginalUsername(storedUser.username) // Guardar el username original
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const getRoleText = (role) => {
        switch (role) {
            case "ADMIN":
                return "Administrador"
            case "CLIENT":
                return "Cliente"
            case "SUPPLIER":
                return "Proveedor"
            default:
                return role
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("jwt")
        localStorage.removeItem("user")
        window.location.href = "/login"
    }

    const updateUser = async () => {
        // Validación similar a Register.jsx
        if (!userData.firstName || userData.firstName.length > 40) {
<<<<<<< HEAD
            showAlert("El nombre no puede estar vacío ni tener más de 40 caracteres.");
            return;
        }

=======
          showAlert("El nombre no puede estar vacío ni tener más de 40 caracteres.");
          return;
        } 
>>>>>>> 375771581ef87feb4d335180b1e81296719dbc8c
        if (!userData.lastName || userData.lastName.length > 40) {
            showAlert("El apellido no puede estar vacío ni tener más de 40 caracteres.");
            return;
        }
<<<<<<< HEAD

=======
>>>>>>> 375771581ef87feb4d335180b1e81296719dbc8c
        if (!userData.username || userData.username.length > 50) {
            showAlert("El nombre de usuario no puede estar vacío ni tener más de 50 caracteres.");
            return;
        }
<<<<<<< HEAD

        const dniPattern = /^[0-9]{8}[A-Za-z]$/;
=======
      
       
>>>>>>> 375771581ef87feb4d335180b1e81296719dbc8c
        if (!dniPattern.test(userData.dni)) {
            showAlert("El DNI es incorrecto. Debe tener 8 números seguidos de una letra.");
            return;
        }
<<<<<<< HEAD

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
=======
      
        
>>>>>>> 375771581ef87feb4d335180b1e81296719dbc8c
        if (!emailPattern.test(userData.email)) {
            showAlert("El correo electrónico no es válido.");
            return;
        }
<<<<<<< HEAD

        const telephonePattern = /^[0-9]{9}$/;
        if (!telephonePattern.test(userData.telephone)) {
            showAlert("El teléfono debe contener exactamente 9 dígitos.");
=======
      
        
        if (!telephonePattern.test(userData.telephone)) {
          showAlert("El teléfono debe contener exactamente 9 dígitos.");
          return;
        }

        
        if (userData.profilePicture && !profilePicturePattern.test(userData.profilePicture)) {
          showAlert("La URL de la foto de perfil no es válida. Debe ser una URL de imagen.");
          return;
        }
      
        try {
          const userDataToUpdate = {
            ...userData,
            password: "no-password",
          };
            
          const response = await fetch(`/api/users/${userData.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(userDataToUpdate),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            const errorMessage =  data.telephone || data.dniValido || data.message || data.error || "Error al actualizar el perfil.";
            throw new Error(errorMessage);
          }
      
          localStorage.setItem("user", JSON.stringify(data));
          setUserData(data);
          setEditing(false);
      
          if (originalUsername !== userData.username) {
            showAlert("Has cambiado tu nombre de usuario. Por favor, inicia sesión nuevamente.");
            handleLogout();
>>>>>>> 375771581ef87feb4d335180b1e81296719dbc8c
            return;
        }

        try {
            const userDataToUpdate = {
                ...userData,
                password: "no-password",
            };

            const response = await fetch(`/api/users/${userData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(userDataToUpdate),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || "Error al actualizar el perfil.";
                throw new Error(errorMessage);
            }

            localStorage.setItem("user", JSON.stringify(data));
            setUserData(data);
            setEditing(false);

            if (originalUsername !== userData.username) {
                showAlert("Has cambiado tu nombre de usuario. Por favor, inicia sesión nuevamente.");
                handleLogout();
                return;
            }

            showAlert("Perfil actualizado con éxito");
            window.location.href = "/profile";
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            showAlert(error.message || "Error al actualizar el perfil.");
        }
    };



    const formatDateTime = (dateString) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        })
    }
    const handleChangePassword = async () => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(passwordData.newPassword)) {
          showAlert("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
          return;
        }
      
        try {
          const response = await fetch(`/api/users/change-password/${userData.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(passwordData),
          });
      
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || result.message || "Error al cambiar la contraseña.");
          }
      
          showAlert("Contraseña actualizada correctamente.");
          setShowPasswordModal(false);
          setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (error) {
          showAlert(error.message);
        }
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-header">
                <h1>Mi Perfil</h1>
                <p>Gestiona tu información personal y configuración de cuenta</p>
            </div>

            <div className="edit-profile-wrapper">
                <div className="sidebar">
                    <div className="profile-pic-container">
                        {userData.profilePicture?.trim() ? (
                            <img src={userData.profilePicture || "/placeholder.svg"} alt="Foto de perfil" className="profile-image" />
                        ) : (
                            <div className="profile-placeholder">
                                {userData.firstName && userData.lastName
                                    ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
                                    : "??"}
                            </div>
                        )}
                    </div>

                    <div className="sidebar-actions">
                        <button className="action-button primary-button" onClick={() => setEditing(true)} disabled={editing}>
                            Editar Perfil
                        </button>

                        {userData.role === "SUPPLIER" && userData.plan === "BASIC" && (
                            <button className="action-button secondary-button" onClick={() => window.location.href = "/profile/plan"} style={{ background: "linear-gradient(45deg, #f0e4a2, #eece6c, #f1ac34)", color: "black" }}>
                                Ver Planes
                            </button>
                        )}
                        <button
                            className="action-button secondary-button"
                            onClick={() => setShowPasswordModal(true)}
                            >
                            Editar Contraseña
                        </button>

                        <button className="action-button danger-button" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
                <div className="profile-info">
                    {editing && (
                        <div className="warning-banner">
                            <div className="warning-icon">
                                <AlertCircle size={20} />
                            </div>
                            <p>
                                <strong>Atención:</strong> Si cambias tu nombre de usuario, deberás iniciar sesión nuevamente.
                            </p>
                        </div>
                    )}
                    {!editing ? (
                        <div className="info-container">
                            <div className="info-section">
                                <h2>Información Personal</h2>
                                <div
                                    className="info-grid"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "1.5rem",
                                        wordBreak: "break-word",
                                    }}
                                >

                                    <div className="info-item">
                                        <span className="info-label">Nombre</span>
                                        <span className="info-value">{userData.firstName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Apellido</span>
                                        <span className="info-value">{userData.lastName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Usuario</span>
                                        <span className="info-value">{userData.username}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{userData.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Teléfono</span>
                                        <span className="info-value">{userData.telephone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">DNI</span>
                                        <span className="info-value">{userData.dni}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Recibe Emails</span>
                                        <span className="info-value">{userData.receivesEmails ? "Sí" : "No"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h2>Detalles de Cuenta</h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Rol</span>
                                        <span className="info-value">{getRoleText(userData.role)}</span>
                                    </div>

                                    {userData.role === "SUPPLIER" && (
                                        <div className="info-item">
                                            <span className="info-label">Plan</span>
                                            <span className="info-value">{userData.plan || "Básico"}</span>
                                        </div>
                                    )}

                                    {userData.plan === "PREMIUM" && (
                                        <>
                                            <div className="info-item">
                                                <span className="info-label">Fecha de pago</span>
                                                <span className="info-value">{formatDateTime(userData.paymentPlanDate)}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Vence el</span>
                                                <span className="info-value">{formatDateTime(userData.expirePlanDate)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="edit-form-container">
                            <h2>Editar Perfil</h2>
                            <form onSubmit={(e) => e.preventDefault()} className="form-edit">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">Nombre</label>
                                        <input id="firstName" name="firstName" value={userData.firstName} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Apellido</label>
                                        <input id="lastName" name="lastName" value={userData.lastName} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="username">Usuario</label>
                                        <input id="username" name="username" value={userData.username} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input id="email" name="email" type="email" value={userData.email} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="telephone">Teléfono</label>
                                        <input id="telephone" name="telephone" value={userData.telephone} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dni">DNI</label>
                                        <input id="dni" name="dni" value={userData.dni} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="profilePicture">URL de Foto de Perfil</label>
                                    <input
                                        id="profilePicture"
                                        name="profilePicture"
                                        value={userData.profilePicture}
                                        onChange={handleInputChange}
                                        placeholder="https://ejemplo.com/mi-foto.jpg"
                                    />
                                </div>
                                <div
                                    className="form-group full-width"
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="receivesEmails"
                                        name="receivesEmails"
                                        style={{ transform: "scale(1.2)" }}
                                        checked={userData.receivesEmails}
                                        onChange={handleInputChange}
                                    />
                                    <label
                                        htmlFor="receivesEmails"
                                        style={{
                                            margin: 0,
                                            fontSize: "1rem",
                                            cursor: "pointer",
                                            userSelect: "none",
                                        }}
                                    >
                                        Quiero recibir notificaciones por email
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-button" onClick={() => setEditing(false)}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="save-button" onClick={updateUser}>
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal">
                    <h3>Cambiar contraseña</h3>

                    <div className="form-group">
                        <label htmlFor="oldPassword">Contraseña actual</label>
                        <input
                        id="oldPassword"
                        type="password"
                        placeholder="Introduce tu contraseña actual"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Nueva contraseña</label>
                        <input
                        id="newPassword"
                        type="password"
                        placeholder="Introduce la nueva contraseña"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button onClick={handleChangePassword} className="save-button">Guardar</button>
                        <button onClick={() => setShowPasswordModal(false)} className="cancel-button">Cancelar</button>
                    </div>
                    </div>
                </div>
                )}
        </div >
    )
}

export default EditProfile


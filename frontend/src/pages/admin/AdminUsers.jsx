/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react"
import "../../static/resources/css/AdminUsers.css";
import { useAlert } from "../../context/AlertContext"

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [searchId, setSearchId] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState({
        id: "",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        telephone: "",
        dni: "",
        role: "",
        profilePicture: "",
        plan: "",
        paymentPlanDate: "",
        expirePlanDate: "",
        receivesEmails: false,
    });
    const { showAlert } = useAlert()
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const jwtToken = localStorage.getItem("jwt");
    const navigate = useNavigate();

    const roleMap = {
        CLIENT: "Cliente",
        SUPPLIER: "Proveedor",
        ADMIN: "Admin"
    };
    const planMap = {
        BASIC: "Básico",
        PREMIUM: "Premium"
    };

    async function handleChangePassword() {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(passwordData.newPassword)) {
          showAlert("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
          return;
        }
      
        try {
          const response = await fetch(`/api/users/change-password/${selectedUserId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(passwordData),
          });
      
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || result.message || "Error al cambiar la contraseña.");
      
          showAlert("Contraseña actualizada correctamente.");
          setShowPasswordModal(false);
          setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (error) {
          showAlert(error.message);
        }
      }

    useEffect(() => {
        getUsers();
    }, []);

    function getUsers() {
        fetch("api/users/DTO", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            method: "GET",
        })
            .then(response => {
                if (!response.ok) throw new Error("Error en la solicitud de usuarios");
                return response.json();
            })
            .then(data => {
                const rolePriority = { CLIENT: 1, SUPPLIER: 2, ADMIN: 3 };
                const sortedUsers = data.sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
                setUsers(sortedUsers);
            })
            .catch(error => console.error("Error obteniendo usuarios:", error));
    }

    function searchUserById() {
        if (!searchId.trim()) {
            setFilteredUsers([]);
            return;
        }
        const found = users.find((u) => String(u.id) === searchId.trim());
        if (found) {
            setFilteredUsers([found]);
            setError("");
        } else {
            setFilteredUsers([]);
            setError("No se encontró ningún usuario con ese ID.");
        }
    }

    function startEditing(user) {
        setEditUserId(user.id);
        setUserData({ ...user });
    }

    async function updateUser() {
        if (!editUserId || !validateUserData(userData)) return;
      
        const userDataToUpdate = { ...userData, password: "password" };
      
        try {
          const response = await fetch(`/api/users/admin/${editUserId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            method: "PUT",
            body: JSON.stringify(userDataToUpdate),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            const errorMessage = data.telephone || data.dniValido || data.message || data.error || "Error al actualizar el perfil.";
            throw new Error(errorMessage);
          }
      
          setUsers(prevUsers => prevUsers.map(u => u.id === data.id ? data : u));
          setEditUserId(null);
          setError("");
          showAlert("Usuario actualizado con éxito");
        } catch (error) {
          console.error("Error:", error);
          setError(error.message);
          showAlert(error.message);
        }
    }

    function validateUserData(userData) {
        setError("");

        if (!userData.firstName || !userData.lastName || !userData.username || !userData.email || !userData.dni) {
            setError("Por favor, complete todos los campos obligatorios.");
            return false;
        }

        if (userData.firstName.length > 40 || userData.lastName.length > 40 || userData.username.length > 50) {
            setError("Uno de los campos excede la longitud máxima permitida.");
            return false;
        }

        const dniPattern = /^[0-9]{8}[A-Za-z]$/;
        if (!dniPattern.test(userData.dni)) {
            setError("El DNI es incorrecto. Debe tener 8 números seguidos de una letra.");
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userData.email)) {
            setError("El correo electrónico no es válido.");
            return false;
        }

        const telephonePattern = /^[0-9]{9}$/;
        if (!telephonePattern.test(userData.telephone)) {
            setError("El teléfono debe tener 9 números.");
            return false;
        }

        return true;
    }

    function handleInputChange(e) {
        const { name, value } = e.target;

        if (name === "dni") {
            const digits = value.replace(/\D/g, '');
            const letters = value.replace(/[^A-Za-z]/g, '');
            let newDni = digits.substring(0, 8);
            if (digits.length >= 8 && letters.length > 0) {
                newDni += letters.charAt(letters.length - 1).toUpperCase();
            }
            setUserData(prev => ({ ...prev, [name]: newDni }));
        } else if (name === "telephone") {
            const digits = value.replace(/\D/g, '').substring(0, 9);
            setUserData(prev => ({ ...prev, [name]: digits }));
        } else {
            setUserData(prev => ({ ...prev, [name]: value }));
        }
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "6%", marginBottom: "20px", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "40%", width: "100%" }}>
                    <input
                        type="text"
                        placeholder="Buscar por ID de usuario..."
                        value={searchId}
                        onChange={(e) => {
                            setSearchId(e.target.value);
                            if (!e.target.value.trim()) {
                                setFilteredUsers([]);
                                setError("");
                            }
                        }}
                        style={{
                            padding: "10px",
                            maxWidth: "40%",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            backgroundColor: "white",
                            color: "black"
                        }}
                    />
                    <button
                        onClick={searchUserById}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            backgroundColor: "#007BFF",
                            color: "white",
                            maxWidth: "20%",
                            border: "none"
                        }}
                    >
                        Buscar
                    </button>
                    <button
                        onClick={() => {
                            setSearchId("");
                            setFilteredUsers([]);
                            setError("");
                        }}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            maxWidth: "20%",
                            backgroundColor: "#ccc",
                            border: "none"
                        }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>
    
            {error && (
                <div className="error-message" style={{ color: "red", padding: "10px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
    
            <div className="user-grid">
                {(filteredUsers.length > 0 ? filteredUsers : users).map((user, index) => (
                    <div key={index} className="service-container">
                        <h2 className="service-title">Usuario ID: {user.id}</h2>
                        <h2 className="service-title">{user.firstName} {user.lastName}</h2>
                        <div className="service-info">

                            <form style={{ width: "100%" }} onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label>Nombre: {editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="text" 
                                    name="firstName" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.firstName : user.firstName} 
                                    onChange={handleInputChange}
                                    readOnly = {editUserId !== userData.id}  

                                />
                                </div>
                                <div className="form-group">
                                    <label>Apellido:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="text" 
                                    name="lastName" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.lastName : user.lastName} 
                                    onChange={handleInputChange} 
                                    readOnly = {editUserId !== userData.id} 
                                />
                                </div>
                                <div className="form-group">
                                    <label>Usuario:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="text" 
                                    name="username" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.username : user.username} 
                                    onChange={handleInputChange}
                                    readOnly = {editUserId !== userData.id} 
                                />
                                </div>
                                <div className="form-group">
                                    <label>Email:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="email" 
                                    name="email" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.email : user.email} 
                                    onChange={handleInputChange} 
                                    readOnly = {editUserId !== userData.id} 
                                />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="tel" 
                                    name="telephone" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.telephone : user.telephone} 
                                    onChange={handleInputChange} 
                                    readOnly = {editUserId !== userData.id}  
                                />
                                </div>
                                <div className="form-group">
                                    <label>DNI:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <input type="text" 
                                    name="dni" 
                                    required = {editUserId === user.id} 
                                    value={userData.id === user.id ? userData.dni : user.dni} 
                                    onChange={handleInputChange} 
                                    readOnly = {editUserId !== userData.id}  
                                />
                                </div>
                                <div>
                                    <label>Recibe correos:</label>
                                    <input
                                        type="checkbox"
                                        name="receiveEmails"
                                        checked={userData.id === user.id ? userData.receivesEmails : user.receivesEmails}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUserData((prevData) => ({
                                                ...prevData,
                                                receivesEmails: checked,
                                            }));
                                        }}
                                        disabled = {editUserId !== userData.id} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rol:{editUserId === user.id && <span className="asterisk">*</span>}</label>
                                    <select name="role" 
                                        value={userData.id === user.id ? userData.role : user.role} 
                                        onChange={handleInputChange}
                                        required = {editUserId === user.id}
                                        disabled = {editUserId !== userData.id}
                                    >
                                        {Object.keys(roleMap).map(role => (
                                            <option key={role} value={role}>{roleMap[role]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Foto de perfil:</label>
                                    <img src={user.profilePicture} alt="Foto" className="service-image" />
                                </div>
                                <div className="button-container">
                                    {editUserId === user.id ? (
                                        <>
                                            <button className="save-btn" style={{ backgroundColor: "#4CAF50" }} onClick={updateUser}>Guardar</button>
                                            <button className="edit-btn" style={{ backgroundColor: "#ffc107", marginTop: "10px" }}
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setShowPasswordModal(true);
                                                }}>
                                                Cambiar Contraseña
                                            </button>
                                        </>
                                    ) : (
                                        <button className="edit-btn" onClick={() => startEditing(user)}>Editar</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
    
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Cambiar contraseña</h3>
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
        </>
    );
    
}

export default AdminUsers;
import {useState} from "react";
import apiClient from "../../apiClient.js";
import {LogIn} from "lucide-react";
import "../../static/resources/css/ChangePassword.css"
import {useAlert} from "../../context/AlertContext.jsx";

function ChangePasswordRegistration () {
  const [form, setForm] = useState({ email: ""});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const {showAlert} = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/change-password-request/${form.email}`);
      if(response.status===400){
        const data = await response.json()
        throw new Error(data.error)
      }
      showAlert("Correo enviado")
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h1 className="change-password-title">Cambiar contraseña</h1>
      <p className="change-password-description">
        Escribe tu correo para enviarte por correo el formulario de cambiar contraseña
      </p>
      {error && <p className="change-password-description" style={{ color: 'red' }}>{error}</p>}

      <form className="change-password-form">
        <label className="change-password-label" htmlFor="email">Email</label>
        <input
          className="change-password-input"
          type="email"
          id="email"
          name="email"
          placeholder="Ingresa tu email de la cuenta"
          value={form.email}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className={`change-password-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <span className="change-password-spinner"></span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Enviar correo</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

}

export default ChangePasswordRegistration;

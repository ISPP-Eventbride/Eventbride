import {useState} from "react";
import apiClient from "../../apiClient.js";
import {LogIn} from "lucide-react";
import {useAlert} from "../../context/AlertContext.jsx";
import {useParams} from "react-router-dom";
import "../../static/resources/css/ChangePassword.css"

function ChangePassword(){
  const [form, setForm] = useState({ oldPassword: "", newPassword: ""});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { showAlert } = useAlert()

  const {token} = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log(form)
    try {
      const response = await fetch(`/api/users/change-password/token/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json()
      if(data?.error){
        throw new Error(data.error).message;
      }
      if(response.status!==200){
        throw new Error("Ha ocurrido un error").message
      }
      showAlert(data?.message)
    } catch (err) {
      setError(err);
      showAlert(err)
      console.warn(err)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h1 className="change-password-title">Cambiar contraseña</h1>
      <p className="change-password-description">La nueva contraseña</p>
      <form className="change-password-form">
        <label className="change-password-label" htmlFor="oldPassword">Contraseña:</label>
        <input
          className="change-password-input"
          type="password"
          id="oldPassword"
          name="oldPassword"
          placeholder="******"
          value={form.oldPassword}
          onChange={handleChange}
          required
        />

        <label className="change-password-label" htmlFor="newPassword">Repite la contraseña:</label>
        <input
          className="change-password-input"
          type="password"
          id="newPassword"
          name="newPassword"
          placeholder="******"
          value={form.newPassword}
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
              <span>Cambiar contraseña</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;

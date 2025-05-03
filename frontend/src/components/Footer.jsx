/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { Mail, MapPin, Instagram, Linkedin, Music2 } from "lucide-react"
import "../static/resources/css/Footer.css"

// eslint-disable-next-line react/prop-types
function Footer({ user }) {
    return (
        <div className="footer-wrapper">
            <footer className="site-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>EventBride</h3>
                        <p>En Eventbride transformamos tus momentos especiales en celebraciones únicas y sin preocupaciones.</p>
                        <div className="social-icons">
                            <Link to="https://www.instagram.com/eventbride_svq/">
                                <Instagram size={18} />
                            </Link>
                            <Link to="https://www.linkedin.com/company/eventbride/">
                                <Linkedin size={18} />
                            </Link>
                            <Link to="https://www.tiktok.com/@eventbride">
                                <Music2 size={18} />
                            </Link>
                        </div>
                    </div>

                    {
                        user &&
                            user.role === "CLIENT" ? (
                            <div className="footer-section">
                                <h3>Enlaces Rápidos</h3>
                                <ul>
                                    <li>
                                        <Link to="/">Inicio</Link>
                                    </li>
                                    <li>
                                        <Link to="/venues">Recintos</Link>
                                    </li>
                                    <li>
                                        <Link to="/other-services">Servicios</Link>
                                    </li>
                                    <li>
                                        <Link to="/events">Eventos</Link>
                                    </li>
                                </ul>
                            </div>
                        ) : ""
                    }

                    <div className="footer-section">
                        <h3>Contacto</h3>
                        <ul className="contact-info">
                            <li>
                                <MapPin size={16} /> Escuela Superior de Ingeniería Informática, Sevilla
                            </li>
                            <li>
                                <Mail size={16} /> eventbride6@gmail.com
                            </li>
                            <li>
                                <Link to="/faqs">FAQ´s</Link>
                            </li>
                            <li>
                                <Link to="/terminos-y-condiciones">Terminos y condiciones</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p style={{ color: "#474747" }}>© {new Date().getFullYear()} Eventbride. Todos los derechos reservados. <a href="/terminos-y-condiciones">Nuestros términos y condiciones</a></p>
                </div>
            </footer>
        </div>
    )
}

export default Footer


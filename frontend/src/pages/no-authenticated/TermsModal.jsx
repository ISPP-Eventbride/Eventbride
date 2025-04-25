import {
  Scroll, UserCheck, UserPlus, CreditCard,
  Calendar, Star, AlertTriangle, Copyright,
  Shield, PenTool, CheckCircle2
} from "lucide-react";
import "../../static/resources/css/Register.css";
import "../../static/resources/css/Terms.css";
import PropTypes from "prop-types";
import { useEffect } from "react";

const TermsModal = ({ onClose }) => {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const modal = document.getElementById("terms-modal");
      if (modal && !modal.contains(e.target)) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className="terms-modal-overlay">
      <div className="modal-content terms-container" id="terms-modal">
        <div className="terms-modal-header">
          <Scroll className="terms-icon" size={36} />
          <h1>Términos y Condiciones</h1>
        </div>

        <div className="terms-content">

          {/* Secciones */}
          <section className="terms-section">
            <div className="section-header"><Scroll className="section-icon" /><h2>Objeto del Acuerdo</h2></div>
            <div className="section-content">
              <p>Este documento regula el uso de la plataforma Eventbride, que conecta a usuarios interesados en organizar eventos (bodas, bautizos, comuniones, etc.) con proveedores que ofrecen servicios y espacios (lugares, catering, música, espectáculos, etc.) para dichos eventos.</p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><UserCheck className="section-icon" /><h2>Aceptación de los Términos</h2></div>
            <div className="section-content">
              <p>
                Para poder hacer uso de Eventbride, tanto usuarios como proveedores deben aceptar los términos y
                condiciones aquí definidos, así como comprometerse a cumplir estos en su totalidad, pudiendo vetarse el
                acceso a la plataforma a aquellos usuarios que los incumplan activamente.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><UserPlus className="section-icon" /><h2>Registro y Uso de la Plataforma</h2></div>
            <div className="section-content">
              <p>
                Los usuarios deberán proporcionar información veraz y mantener la confidencialidad de sus credenciales de
                acceso. Los proveedores deberán registrar su negocio y ofrecer una descripción precisa y actualizada de
                los servicios y espacios disponibles. Ambos se comprometen a utilizar la plataforma de manera responsable
                y en cumplimiento con la normativa vigente.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><CreditCard className="section-icon" /><h2>Procesamiento de Pagos</h2></div>
            <div className="section-content">
              <p>
                Eventbride facilita las transacciones a través de pasarelas de pago, utilizando PayPal para garantizar un
                proceso seguro y confiable. Los pagos se realizan directamente entre el usuario y el proveedor, actuando
                Eventbride únicamente como intermediario en la gestión del pago. Asimismo, acepta que la calidad,
                ejecución y resultados de los servicios dependen exclusivamente del proveedor, eximiendo a la plataforma
                de cualquier garantía o responsabilidad al respecto.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><Calendar className="section-icon" /><h2>Reservas, Cancelaciones y Reembolsos</h2></div>
            <div className="section-content">
              <p>
                Las condiciones específicas de reserva y reembolso se definirán en el acuerdo entre el usuario y el
                proveedor, siempre en línea con nuestras políticas generales.
              </p>
              <ul className="terms-list">
                <li>Bodas: la cancelación gratuita debe realizarse al menos 5 meses antes de la fecha del evento.</li>
                <li>Bautizos: la cancelación gratuita debe realizarse al menos 2 meses antes del evento.</li>
                <li>Comuniones: la cancelación gratuita debe realizarse al menos 3 meses antes del evento.</li>
              </ul>
              <p>
                En caso de que el proveedor cancele el servicio, el cliente recibirá el reembolso completo del pago
                realizado. Los gastos de gestión de la aplicación no serán devueltos en ningún caso. Sin importar cuál de
                las dos partes cancele el evento.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><Star className="section-icon" /><h2>Valoración de Servicios</h2></div>
            <div className="section-content">
              <p>
                Los usuarios podrán calificar y dejar reseñas sobre la atención y calidad de los servicios recibidos a
                través de un sistema de valoración integrado en la plataforma. Las valoraciones serán públicas y
                contribuirán a la reputación de los proveedores, permitiendo a otros usuarios tomar decisiones informadas.
                Eventbride se reserva el derecho de moderar o eliminar valoraciones que contengan contenido ofensivo o que
                no cumplan con las políticas de uso establecidas.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><AlertTriangle className="section-icon" /><h2>Caso de Incumplimiento de los Servicios</h2></div>
            <div className="section-content">
              <p>
                En el supuesto de que el proveedor no preste el servicio contratado, la plataforma limitará su actuación a
                eliminar la oferta correspondiente de la aplicación. Eventbride no interviene en la resolución de disputas
                derivadas del incumplimiento, siendo el usuario quien deberá iniciar las reclamaciones y gestionar
                cualquier procedimiento legal o de mediación directamente con el proveedor.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><Copyright className="section-icon" /><h2>Propiedad Intelectual y Uso de Contenidos</h2></div>
            <div className="section-content">
              <p>
                Todo el contenido, diseño, logotipos y marcas de Eventbride son propiedad exclusiva de la plataforma.
                Queda prohibida la reproducción, distribución o modificación de dichos elementos sin autorización previa.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><Shield className="section-icon" /><h2>Protección de Datos</h2></div>
            <div className="section-content">
              <p>
                Eventbride se compromete a tratar los datos personales de usuarios y proveedores conforme a la legislación
                vigente en materia de protección de datos, garantizando su confidencialidad y seguridad.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><CheckCircle2 className="section-icon" /><h2>Uso Aceptable</h2></div>
            <div className="section-content">
              <p>
                Eventbride se compromete a tratar los datos personales de usuarios y proveedores conforme a la legislación
                vigente en materia de protección de datos, garantizando su confidencialidad y seguridad.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <div className="section-header"><PenTool className="section-icon" /><h2>Modificaciones</h2></div>
            <div className="section-content">
              <p>
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación en la plataforma.
              </p>
            </div>
          </section>
        </div>

        <div>
          <button onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

TermsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TermsModal;

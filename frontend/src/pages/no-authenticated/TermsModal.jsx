"use client"

import {
  Scroll,
  UserCheck,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Copyright,
  Shield,
  PenTool,
  CheckCircle2,
} from "lucide-react"
import "../../static/resources/css/Register.css"
import "../../static/resources/css/Terms.css"
import PropTypes from "prop-types"
import { useEffect } from "react"

const TermsModal = ({ onClose }) => {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const modal = document.getElementById("terms-modal")
      if (modal && !modal.contains(e.target)) {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [onClose])

  return (
    <div className="terms-modal-overlay" style={{ overflow: "hidden" }}>
      <div className="modal-content terms-container overflow-auto" id="terms-modal">

        <div className="terms-content">
          {/* Secciones */}
          <section className="terms-section" id="id0">
            <div className="section-header">
              <Scroll className="section-icon" />
              <h2>Introducción</h2>
            </div>
            <div className="section-content">
              <p>
                <strong>
                  Eventbride nace con la intención de simplificar y profesionalizar la organización de eventos sociales
                  significativos como bodas, bautizos y comuniones.
                </strong>{" "}
                Nuestra misión es facilitar la conexión entre los organizadores de eventos y los proveedores más
                adecuados, fomentando una experiencia positiva, eficiente y personalizada para ambas partes. Este
                acuerdo regula los aspectos legales y contractuales del uso de nuestra plataforma, y representa nuestro
                compromiso con la transparencia, la confianza y la calidad del servicio.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id1">
            <div className="section-header">
              <UserCheck className="section-icon" />
              <h2>Aceptación de los Términos</h2>
            </div>
            <div className="section-content">
              <p>
                Este Acuerdo establece los términos legales que regulan el uso de la plataforma Eventbride. Define la
                relación contractual entre Eventbride y sus usuarios, estableciendo los derechos y obligaciones de ambas
                partes, así como las normas de uso de la plataforma y los planes de suscripción disponibles. Antes de
                acceder o utilizar cualquiera de las funciones de Eventbride, el usuario debe proporcionar un
                consentimiento explícito, informado y voluntario, aceptando los términos mediante una casilla claramente
                identificada u otro mecanismo de confirmación equivalente.
              </p>
              <p>
                No se establecerá ninguna relación contractual sin esta acción previa. Se recomienda a los usuarios
                descargar y revisar estos términos con antelación y contactar con nosotros para cualquier aclaración
                antes de aceptarlos.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id2">
            <div className="section-header">
              <UserPlus className="section-icon" />
              <h2>Descripción del Servicio</h2>
            </div>
            <div className="section-content">
              <p>
                Eventbride es una plataforma en línea diseñada para facilitar la organización de eventos sociales,
                incluyendo bodas, bautizos y comuniones y excluyendo a cualquier otro tipo de celebración. Conecta a
                usuarios (organizadores del evento) con proveedores que ofrecen espacios y servicios relacionados como
                catering, música, decoración, entre otros.
              </p>
              <p>
                La plataforma permite buscar, comparar, reservar y gestionar servicios. Eventbride puede evolucionar con
                el tiempo incorporando nuevas funcionalidades o ajustes. En tal caso, los usuarios serán notificados
                previamente, y será necesaria la aceptación explícita de los nuevos términos para poder continuar usando
                la plataforma Eventbride.
              </p>
              <p>
                <strong>Tipos de servicios que pueden encontrarse en la plataforma incluyen:</strong>
              </p>
              <ul>
                <li>Recintos: salones de celebraciones, haciendas, jardines, etc.</li>
                <li>Catering: menús personalizados, opciones vegetarianas/veganas, repostería especial.</li>
                <li>Entretenimiento: DJs, grupos de música, animadores infantiles, magos.</li>
                <li>Servicios auxiliares: fotógrafos, decoración, cortadores de jamón.</li>
              </ul>
              <p>
                <strong>Gestión de reservas:</strong> La plataforma proporciona herramientas para gestionar la
                contratación de todos los servicios de un evento de manera centralizada. También se podrá contactar con
                los proveedores de manera individual a través del chat disponible.
              </p>
            </div>
          </section>
          <section className="terms-section" id="id3">
            <div className="section-header">
              <CheckCircle2 className="section-icon" />
              <h2>Uso del Servicio</h2>
            </div>
            <div className="section-content">
              <h3>Uso legal</h3>
              <p>
                El usuario debe utilizar la plataforma únicamente con fines legales y conforme a la normativa aplicable.
              </p>
              <h3>Información precisa</h3>
              <p>
                El usuario es responsable de mantener su información completa y actualizada. Eventbride colaborará para
                resolver problemas derivados de datos incorrectos, pero no se hará responsable de los daños ocasionados
                por información fuera de su conocimiento o control. Toda la información proporcionada por el usuario
                debe ser veraz.
              </p>
              <h3>Seguridad</h3>
              <p>
                El usuario debe proteger sus credenciales de acceso y notificar inmediatamente a Eventbride sobre
                cualquier sospecha o conocimiento de acceso no autorizado.
              </p>
              <h3>Conductas prohibidas</h3>
              <p>
                No se tolerará ningún comportamiento malicioso, fraudulento o abusivo, incluyendo pero no limitándose a
                spam, suplantación de identidad, manipulación del sistema y uso de lenguaje violento o malsonante contra
                otros usuarios, el equipo de Eventbride o a la hora de proporcionar cualquier información que será
                mostrada públicamente en la plataforma (como el nombre de un servicio, por ejemplo).
              </p>
            </div>
          </section>

          <section className="terms-section" id="id4">
            <div className="section-header">
              <UserPlus className="section-icon" />
              <h2>Cuentas de Usuario</h2>
            </div>
            <div className="section-content">
              <p>
                Para acceder a las funcionalidades principales de Eventbride, el usuario debe crear una cuenta. Al
                registrarse, se compromete a proporcionar información veraz y válida. Si sus datos cambian, deberá
                actualizarlos sin demora.
              </p>
              <p>
                Eventbride brindará asistencia en la corrección de problemas derivados de datos desactualizados, pero no
                asumirá responsabilidad por daños ocasionados como consecuencia de no mantener actualizada la
                información.
              </p>
              <p>
                <strong>Existen dos tipos de cuentas de usuario:</strong>
              </p>
              <ul>
                <li>
                  <strong>Clientes:</strong> usuarios que organizan un evento y buscan contratar servicios.
                </li>
                <li>
                  <strong>Proveedores:</strong> usuarios que ofrecen servicios y productos relacionados con eventos.
                </li>
              </ul>
              <p>Cada rol tiene acceso a funcionalidades diferentes adaptadas a sus necesidades.</p>
              <p>
                <strong>Además:</strong>
              </p>
              <p>
                El uso compartido de cuentas está prohibido. Cada cuenta debe estar asociada a una persona física o
                jurídica responsable. Eventbride se reserva el derecho de suspender cuentas si se detecta uso
                fraudulento o compartido sin autorización previa, previo aviso al usuario.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id5">
            <div className="section-header">
              <Shield className="section-icon" />
              <h2>Política de Privacidad</h2>
            </div>
            <div className="section-content">
              <h3>Información que Recopilamos</h3>
              <ul>
                <li>
                  Información de contacto de los clientes, como nombre, dirección de correo electrónico, dni, foto de
                  perfil y número de teléfono.
                </li>
                <li>
                  Información de pago de los clientes, como detalles de la tarjeta de crédito o información de
                  facturación.
                </li>
                <li>Información de pago de los proveedores para suscripciones y cobros.</li>
                <li>Información sobre los servicios y establecimientos ofrecidos por los proveedores.</li>
                <li>
                  Información sobre los invitados confirmados al evento, como nombre, correo electrónico y número de
                  teléfono.
                </li>
              </ul>
              <h3>Uso de la Información</h3>
              <p>Utilizamos la información recopilada para los siguientes propósitos:</p>
              <ul>
                <li>Gestionar eventos y servicios contratados.</li>
                <li>Prestar los servicios según el plan del proveedor.</li>
                <li>Comunicar sobre la cuenta, transacciones y cambios.</li>
                <li>Mejorar y personalizar la experiencia del usuario.</li>
                <li>Cumplir obligaciones legales y regulatorias.</li>
              </ul>
              <h3>Protección de la Información</h3>
              <p>
                Se aplican medidas de cifrado y control de acceso para proteger la información personal de accesos no
                autorizados.
              </p>
              <h3>Compartir Información</h3>
              <p>Eventbride no comparte datos salvo en estos casos:</p>
              <ul>
                <li>Con consentimiento expreso.</li>
                <li>Con proveedores bajo acuerdos de confidencialidad.</li>
                <li>Por requerimiento legal.</li>
              </ul>
              <h3>Retención de Datos</h3>
              <p>
                Los datos se conservan durante el tiempo necesario o legalmente establecido. Tras cancelar la cuenta, se
                aplicará lo dispuesto por la Ley Orgánica 3/2018.
              </p>
              <h3>Derechos de Privacidad</h3>
              <p>
                Los usuarios pueden solicitar acceso, rectificación, eliminación y restricción del procesamiento de sus
                datos.
              </p>
              <h3>Cambios en la Política de Privacidad</h3>
              <p>
                Cualquier cambio significativo será notificado y deberá ser aceptado por el usuario antes de su
                aplicación.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id6">
            <div className="section-header">
              <CreditCard className="section-icon" />
              <h2>Pago</h2>
            </div>
            <div className="section-content">
              <h3>Métodos de pago</h3>
              <p>
                Se aceptan pagos mediante tarjeta de crédito/débito, PayPal y otras pasarelas seguras que puedan
                integrarse.
              </p>
              <p>
                Todos los pagos serán procesados mediante proveedores certificados que cumplen con la normativa PCI DSS.
              </p>

              <h3>Plazos de pago y confirmación de eventos</h3>
              <p>El plazo para pagar un evento será de hasta:</p>
              <ul>
                <li>4 meses antes en bodas</li>
                <li>3 meses antes en comuniones</li>
                <li>1 mes antes en bautizos</li>
              </ul>
              <p>Si no se confirma el pago en esos plazos, el evento será cancelado.</p>

              <h3>Planes de suscripción para proveedores</h3>
              <ul className="nested-list">
                <li>
                  <strong>Plan Básico:</strong>
                  <ul className="nested-list">
                    <li>Precio: Gratis</li>
                    <li>Servicios que puede registrar: 3</li>
                    <li>No pueden promocionar sus servicios</li>
                  </ul>
                </li>
                <li>
                  <strong>Plan Premium:</strong>
                  <ul className="nested-list">
                    <li>Precio: 50 €/mes</li>
                    <li>Servicios que puede registrar: 10</li>
                    <li>Pueden promocionar sus servicios</li>
                  </ul>
                </li>
              </ul>

              <h3>Cancelación por parte del cliente</h3>
              <ul>
                <li>Antes del pago completo: cancelación gratuita.</li>
                <li>Señal pagada: no se reembolsa.</li>
                <li>Tras pago completo y hasta 2 semanas antes del evento: se reembolsa 50%.</li>
                <li>Menos de 2 semanas antes: no se reembolsa.</li>
              </ul>

              <h3>Cancelación por parte del proveedor</h3>
              <ul>
                <li>Antes del cobro completo: sin penalización.</li>
                <li>Señal cobrada: debe devolverse íntegramente.</li>
                <li>Tras cobro completo:</li>
                <ul>
                  <li>Hasta 3 semanas antes: reembolso total</li>
                  <li>Menos de 3 semanas: +20% indemnización</li>
                  <li>Entre 3 y 2 semanas: +30% indemnización</li>
                  <li>Entre 2 y 1 semana: +35% indemnización</li>
                  <li>1 semana o menos: +40% indemnización</li>
                </ul>
                <li>Eventbride no aplica comisiones sobre indemnizaciones.</li>
              </ul>

              <h3>Contacto para gestión de cancelaciones</h3>
              <p>
                Escribir a <strong>eventbride6@gmail.com</strong> con el asunto: "Cancelación del servicio [NOMBRE DEL
                SERVICIO] para el evento del día [FECHA DEL EVENTO]".
              </p>
            </div>
          </section>

          <section className="terms-section" id="id7">
            <div className="section-header">
              <Copyright className="section-icon" />
              <h2>Propiedad Intelectual</h2>
            </div>
            <div className="section-content">
              <p>
                Todo el contenido, marca y código fuente de Eventbride está protegido por leyes de propiedad intelectual
                y derechos de autor. El usuario recibe una licencia limitada, no exclusiva e intransferible para
                utilizar la plataforma con su propósito previsto. Se prohíbe su reproducción, distribución o exhibición
                pública sin autorización previa.
              </p>
              <p>
                El contenido subido por los usuarios seguirá siendo propiedad del usuario, pero al subirlo a Eventbride
                se concede una licencia gratuita y no exclusiva para usarlo con fines promocionales y operativos dentro
                de la plataforma.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id8">
            <div className="section-header">
              <AlertTriangle className="section-icon" />
              <h2>Terminación</h2>
            </div>
            <div className="section-content">
              <p>
                Este Acuerdo puede finalizarse en cualquier momento por mutuo acuerdo entre el usuario y Eventbride.
                Cualquiera de las partes puede proponer la terminación de éste con 30 días de preaviso por escrito. La
                terminación solo será efectiva cuando ambas partes hayan accedido a la misma y resuelto cualquier
                obligación pendiente.
              </p>
              <p>
                El incumplimiento de cualquier cláusula por parte del usuario supondrá la terminación del mismo, previo
                aviso.
              </p>
              <p>
                Tras la terminación y si el usuario desea cancelar la cuenta, Eventbride se compromete a eliminar todos
                los datos conforme a la Ley Orgánica de Protección de Datos de Carácter Personal (Ley Orgánica 3/2018).
              </p>
            </div>
          </section>

          <section className="terms-section" id="id9">
            <div className="section-header">
              <AlertTriangle className="section-icon" />
              <h2>Limitación de Responsabilidad</h2>
            </div>
            <div className="section-content">
              <p>
                Eventbride asume responsabilidad legal por daños derivados de actos u omisiones por los que sea
                legalmente responsable, incluyendo:
              </p>
              <ul>
                <li>Incumplimiento de servicios contratados</li>
                <li>Vulneración de la legislación de consumo</li>
                <li>Violaciones de datos personales</li>
                <li>Servicios defectuosos o negligencia</li>
              </ul>
              <p>
                En relaciones B2B, y solo cuando lo permita la ley, Eventbride podrá proponer un límite de
                responsabilidad proporcional al importe pagado en los últimos 6 meses como comisiones o el Plan Premium,
                si procede.
              </p>
              <p>
                Eventbride actúa como intermediario entre usuarios y proveedores. No se responsabiliza por la calidad o
                cumplimiento de los servicios, aunque facilitará mecanismos de evaluación y resolución de incidencias.
                Ante incumplimientos graves, podrá eliminar la oferta y prohibir el uso de la plataforma.
              </p>
              <p>
                Para incidencias, contactar a <strong>eventbride6@gmail.com</strong> con el asunto "Incidencia del
                servicio [NOMBRE DEL SERVICIO] para el evento del día [FECHA DEL EVENTO]".
              </p>
            </div>
          </section>
          <section className="terms-section" id="id10">
            <div className="section-header">
              <PenTool className="section-icon" />
              <h2>Cambios en el Acuerdo</h2>
            </div>
            <div className="section-content">
              <p>
                Los cambios importantes en este Acuerdo serán comunicados con al menos 15 días de antelación y solo
                entrarán en vigor tras el consentimiento explícito del usuario.
              </p>
              <p>
                Los usuarios que no acepten los cambios pueden finalizar el Acuerdo sin coste ni penalización antes de
                que entren en vigor.
              </p>
              <p>
                Actualizaciones menores (formato, redacción) que no afecten a los derechos y responsabilidades de los
                usuarios y del equipo de Eventbride podrán aplicarse sin aviso formal.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id11">
            <div className="section-header">
              <Scroll className="section-icon" />
              <h2>Ley Aplicable</h2>
            </div>
            <div className="section-content">
              <p>
                Este Acuerdo se interpretará y aplicará conforme a las leyes del país de residencia del usuario,
                incluyendo todos los derechos y recursos de protección del consumidor, sean renunciables o no. En ningún
                caso la ley aplicable reducirá ni limitará la protección del consumidor.
              </p>
              <p>
                Cuando sea legal y aplicable, la relación contractual podrá regirse también por la ley española,
                especialmente en contextos profesionales o B2B. Esto nunca limitará los derechos obligatorios del
                consumidor.
              </p>
              <p>Las disputas podrán presentarse ante:</p>
              <ul>
                <li>Los tribunales del país de residencia del usuario (si reside en la UE), o</li>
                <li>
                  Los tribunales de Sevilla (España), si el usuario lo elige voluntariamente y sin perjuicio de sus
                  derechos legales.
                </li>
              </ul>
            </div>
          </section>

          <section className="terms-section" id="id12">
            <div className="section-header">
              <CheckCircle2 className="section-icon" />
              <h2>Acuerdo de Nivel de Servicio (SLA)</h2>
            </div>
            <div className="section-content">
              <p>
                Eventbride se compromete a ofrecer un servicio estable, eficiente y de calidad para todos sus usuarios,
                independientemente del tipo de cuenta que posean.
              </p>
              <h3>Compromisos generales</h3>
              <p>
                Garantizamos el mismo nivel de soporte técnico, atención al cliente y mantenimiento del sistema tanto
                para cuentas gratuitas como para cuentas Premium.
              </p>
              <h3>Métricas a considerar</h3>
              <ul>
                <li>Disponibilidad del servicio (uptime)</li>
                <li>Tiempo de respuesta del sistema</li>
                <li>Tiempo de resolución de incidencias</li>
                <li>Tiempo de respuesta del soporte técnico</li>
              </ul>
              <h3>Indicadores a nivel de servicio</h3>
              <ul>
                <li>Disponibilidad mensual mínima garantizada: 98.5%</li>
                <li>Tiempo máximo de respuesta del sistema: 3 segundos</li>
                <li>Tiempo de primera respuesta del soporte técnico: menos de 24 horas laborales</li>
                <li>Tiempo máximo de resolución de incidencias críticas: 72 horas</li>
              </ul>
              <h3>Objetivos a nivel de servicio</h3>
              <ul>
                <li>Garantizar estabilidad y disponibilidad</li>
                <li>Minimizar tiempo de inactividad</li>
                <li>Atención al cliente eficiente</li>
                <li>Supervisión proactiva del sistema</li>
              </ul>
              <h3>Soporte</h3>
              <p>
                Todos los usuarios tendrán acceso a los mismos canales y tiempos de respuesta. Se prestará soporte por
                email o desde la pestaña de soporte técnico.
              </p>
              <h3>Compensaciones</h3>
              <ul>
                <li>
                  <strong>Usuarios con Plan Premium:</strong> podrán solicitar extensiones gratuitas proporcionales al
                  impacto sufrido o informes técnicos completos.
                </li>
                <li>
                  <strong>Usuarios gratuitos:</strong> podrán recibir créditos promocionales, acceso temporal a
                  funciones Premium o prioridad en soporte, según evaluación técnica.
                </li>
              </ul>
              <p>
                Las compensaciones se otorgarán previa solicitud y verificación técnica. No limitan el derecho a
                reclamar por otras vías si procede.
              </p>
            </div>
          </section>

          <section className="terms-section" id="id13">
            <div className="section-header">
              <UserCheck className="section-icon" />
              <h2>Información de Contacto</h2>
            </div>
            <div className="section-content">
              <p>
                Si tiene alguna duda sobre este acuerdo, por favor contáctenos en nuestro correo de información{" "}
                <strong>info@eventbride.fun</strong> con el asunto "Acuerdo de Cliente".
              </p>
              <p>
                Como usuario, acepta este Acuerdo únicamente a través de una acción voluntaria y consciente. Ningún
                término será aplicable sin su consentimiento informado y explícito.
              </p>
            </div>
          </section>
        </div>

        <div>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

TermsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default TermsModal

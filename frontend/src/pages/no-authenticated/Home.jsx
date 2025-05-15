import { useState, useEffect } from "react"
import { Calendar, Users, ChevronRight, Clock, Palette, ArrowRight, Briefcase, Building, Bell, Wallet, Shield, Heart } from 'lucide-react'
import "../../static/resources/css/Home.css"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState({ role: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        setCurrentUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error retrieving user data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const HeroSection = () => (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Celebraciones inolvidables, organizadas sin esfuerzo</h1>
          <p className="hero-description">
            Planifica bodas, bautizos y comuniones con nuestra plataforma digital que conecta con los mejores
            proveedores del sector.
          </p>
          <div className="hero-buttons">
            {currentUser.role === 'CLIENT' ? (
              <>
                <a href="/create-events" className="primary-button" style={{ background: '#d9be75', color: "white" }}>
                  Crear evento <ArrowRight size={16} className="button-icon" />
                </a>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070"
            alt="Celebración de boda elegante"
            className="hero-image"
          />
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-number">10,000+</span>
          <span className="stat-label">Eventos organizados</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">500+</span>
          <span className="stat-label">Proveedores verificados</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Clientes satisfechos</span>
        </div>
      </div>
    </section>
  )

  // CLIENT VIEW
  if (currentUser.role === "CLIENT") {
    return (
      <div className="site-wrapper">
        <main className="main-content">
          <HeroSection />

          <section className="features-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Organiza tu evento perfecto</h2>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Calendar className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Organizar Eventos</h3>
                  <p className="feature-description">
                    Crea y gestiona tus eventos con nuestras herramientas de planificación intuitivas.
                  </p>
                  <a href="/create-events" className="feature-link">
                    Crear evento <ChevronRight size={14} />
                  </a>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Briefcase className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Contratar Servicios</h3>
                  <p className="feature-description">
                    Explora y contrata los mejores servicios para tu evento, todos en un solo lugar.
                  </p>
                  <a href="/services" className="feature-link">
                    Ver servicios <ChevronRight size={14} />
                  </a>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Building className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Reservar Recintos</h3>
                  <p className="feature-description">
                    Encuentra y reserva el lugar perfecto para tu celebración especial.
                  </p>
                  <a href="/venues" className="feature-link">
                    Explorar recintos <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="process-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Cómo funciona</h2>
              </div>

              <div className="process-steps">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3 className="step-title">Define tu evento</h3>
                    <p className="step-description">
                      Selecciona el tipo de evento, fecha y número de invitados para comenzar.
                    </p>
                  </div>
                </div>

                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3 className="step-title">Selecciona servicios</h3>
                    <p className="step-description">
                      Explora y elige entre cientos de proveedores verificados para tu evento.
                    </p>
                  </div>
                </div>

                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3 className="step-title">Personaliza detalles</h3>
                    <p className="step-description">
                      Ajusta cada aspecto de tu evento según tus preferencias y necesidades.
                    </p>
                  </div>
                </div>

                <div className="process-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3 className="step-title">¡Disfruta tu día!</h3>
                    <p className="step-description">
                      Relájate mientras nosotros coordinamos todo para tu celebración perfecta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="container">
              <div className="cta-content">
                <h2 className="cta-title">¿Listo para crear tu evento perfecto?</h2>
                <p className="cta-description">
                  Comienza a planificar hoy mismo y haz que tu celebración sea inolvidable
                </p>
                <a href="/create-events" className="cta-button">
                  Crear mi evento <ArrowRight size={16} className="button-icon" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // SUPPLIER VIEW
  if (currentUser.role === "SUPPLIER") {
    return (
      <div className="site-wrapper">
        <main className="main-content">
          <section className="hero-section supplier-hero">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">Haz crecer tu negocio de eventos</h1>
                <p className="hero-description">
                  Conecta con clientes potenciales, gestiona tus servicios y aumenta tus ingresos con nuestra plataforma
                  especializada.
                </p>
                {currentUser.role === 'SUPPLIER' ? (
                  <>
                    <a href="/misservicios/registrar" className="primary-button" style={{ background: '#b48c3c', color: "white" }}>
                      Registrar servicio <ArrowRight size={16} className="button-icon" />
                    </a>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070"
                  alt="Proveedor de eventos"
                  className="hero-image"
                />
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">+40%</span>
                <span className="stat-label">Aumento en ventas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Clientes potenciales</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Visibilidad online</span>
              </div>
            </div>
          </section>

          <section className="features-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Gestiona tu negocio eficientemente</h2>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Briefcase className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Gestionar Servicios</h3>
                  <p className="feature-description">
                    Añade, edita y administra todos tus servicios desde un único panel de control.
                  </p>
                  <a href="/misservicios" className="feature-link">
                    Mis servicios <ChevronRight size={14} />
                  </a>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Bell className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Gestionar Solicitudes</h3>
                  <p className="feature-description">
                    Recibe y responde a solicitudes de clientes interesados en tus servicios.
                  </p>
                  <a href="/solicitudes" className="feature-link">
                    Ver solicitudes <ChevronRight size={14} />
                  </a>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Wallet className="feature-icon" />
                  </div>
                  <h3 className="feature-title">Retirar Fondos</h3>
                  <p className="feature-description">
                    Gestiona tus ingresos y retira fondos de manera segura y rápida.
                  </p>
                  <a href="/misVentas" className="feature-link">
                    Mis finanzas <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="container">
              <div className="cta-content">
                <h2 className="cta-title">Expande tu alcance con nuevos servicios</h2>
                <p className="cta-description">
                  Añade nuevos servicios a tu catálogo y llega a más clientes potenciales
                </p>
                <a href="/misservicios/registrar" className="cta-button">
                  Añadir nuevo servicio <ArrowRight size={16} className="button-icon" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // ADMIN VIEW
  if (currentUser.role === "ADMIN") {
    return (
      <div className="site-wrapper">
        <main className="main-content">
          <section className="hero-section admin-hero">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">Panel de Administración</h1>
                <p className="hero-description">
                  Gestiona todos los aspectos de la plataforma desde un único lugar centralizado.
                </p>
              </div>
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070"
                  alt="Panel de administración"
                  className="hero-image"
                />
              </div>
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Gestión de la Plataforma</h2>
              </div>

              <div className="admin-grid">
                <div className="admin-card">
                  <div className="admin-icon-wrapper">
                    <Users className="admin-icon" />
                  </div>
                  <h3 className="admin-title">Usuarios</h3>
                  <p className="admin-description">Gestiona usuarios, roles y permisos en la plataforma.</p>
                  <a href="/admin-users" className="admin-link">
                    Gestionar usuarios <ChevronRight size={14} />
                  </a>
                </div>

                <div className="admin-card">
                  <div className="admin-icon-wrapper">
                    <Briefcase className="admin-icon" />
                  </div>
                  <h3 className="admin-title">Servicios</h3>
                  <p className="admin-description">Supervisa y modera todos los servicios ofrecidos.</p>
                  <a href="/admin-services" className="admin-link">
                    Gestionar servicios <ChevronRight size={14} />
                  </a>
                </div>

                <div className="admin-card">
                  <div className="admin-icon-wrapper">
                    <Calendar className="admin-icon" />
                  </div>
                  <h3 className="admin-title">Eventos</h3>
                  <p className="admin-description">Visualiza y gestiona todos los eventos creados.</p>
                  <a href="/admin-events" className="admin-link">
                    Gestionar eventos <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // DEFAULT VIEW (no role)
  return (
    <div className="site-wrapper">
      <main className="main-content">
        <HeroSection />

        <section className="services-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Servicios para cada momento especial</h2>
              <p className="section-description">Todo lo que necesitas para crear celebraciones inolvidables</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">¿Por qué elegir Eventbride?</h2>
              <p className="section-description">Ventajas que nos diferencian</p>
            </div>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <Shield className="benefit-icon" />
                </div>
                <h3 className="benefit-title">Proveedores Verificados</h3>
                <p className="benefit-description">
                  Todos nuestros proveedores pasan por un riguroso proceso de verificación para garantizar calidad.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <Clock className="benefit-icon" />
                </div>
                <h3 className="benefit-title">Ahorro de Tiempo</h3>
                <p className="benefit-description">
                  Organiza tu evento en menos tiempo gracias a nuestras herramientas digitales.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <Palette className="benefit-icon" />
                </div>
                <h3 className="benefit-title">Personalización Total</h3>
                <p className="benefit-description">
                  Adapta cada detalle de tu evento según tus preferencias y necesidades.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <Heart className="benefit-icon" />
                </div>
                <h3 className="benefit-title">Atención Personalizada</h3>
                <p className="benefit-description">
                  Soporte dedicado durante todo el proceso de organización de tu evento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Cómo funciona</h2>
              <p className="section-description">Organizar tu evento nunca ha sido tan sencillo</p>
            </div>

            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Regístrate</h3>
                  <p className="step-description">
                    Crea tu cuenta gratuita en nuestra plataforma en menos de un minuto.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">Define tu evento</h3>
                  <p className="step-description">Selecciona el tipo de evento, fecha y número de invitados.</p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Explora servicios</h3>
                  <p className="step-description">Descubre y contrata los mejores proveedores para tu celebración.</p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3 className="step-title">¡Disfruta!</h3>
                  <p className="step-description">Relájate mientras nosotros nos encargamos de coordinar todo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Comienza a planificar tu evento hoy</h2>
              <p className="cta-description">Regístrate gratis y descubre todas las herramientas que tenemos para ti</p>
              <div className="cta-buttons">
                <a href="/register" className="cta-button">
                  Crear cuenta <ArrowRight size={16} className="button-icon" />
                </a>
                <a href="/services" className="cta-secondary">
                  Explorar servicios
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


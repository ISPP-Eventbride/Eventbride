package com.eventbride.notification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.event.Event.EventType;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.invitation.Invitation;
import com.eventbride.notification.Notification.NotificationType;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    JavaMailSender mailSender;

    @Transactional
    public List<Notification> getAllNotificationsForUser(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return notificationRepository.findByUserId(user.get().getId());
    }

    @Transactional
    public void createNotification(Notification.NotificationType type, User user, Event event,
            EventProperties eventProperties, Invitation invitation) {
        Notification notification = new Notification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(user);
        switch (type) {
            case REQUEST_CANCELLED_PROVIDER:
                notification.setType(NotificationType.REQUEST_CANCELLED_PROVIDER);
                notification.setSubject("Solicitud de reserva cancelada");
                notification.setMessage("Tu solicitud de reserva de "
                        + (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + " ha sido cancelada por el proveedor.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case REQUEST_CANCELLED_AUTO:
                notification.setType(NotificationType.REQUEST_CANCELLED_AUTO);
                notification.setSubject("Solicitud de reserva cancelada");
                notification.setMessage("Tu solicitud de reserva de "
                        + (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + " ha sido cancelada automáticamente ya que otro usuario ha reservado en la misma franja. Pruebe a solicitar una nueva o a buscar otro servicio.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case EVENT_CREATED:
                notification.setType(NotificationType.EVENT_CREATED);
                notification.setSubject("Evento creado");
                notification.setMessage(
                        "Tu evento " + event.getName() + " ha sido creado con éxito.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case PAYMENT_REMINDER:
                notification.setType(NotificationType.PAYMENT_REMINDER);
                notification.setSubject("Recordatorio de pago");
                notification.setMessage("Le recordamos que tienes un pago pendiente para tu evento "
                        + event.getName()
                        + ". Por favor, realiza el pago lo antes posible para evitar problemas.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case NEW_MESSAGE:
                notification.setType(NotificationType.NEW_MESSAGE);
                notification.setSubject("Nuevo mensaje");
                notification.setMessage("Has recibido un mensaje, revisa tus chats.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case REQUEST_CONFIRMED:
                notification.setType(NotificationType.REQUEST_CONFIRMED);
                notification.setSubject("Solicitud de reserva confirmada");
                notification.setMessage("Tu solicitud reserva de "
                        + (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + " ha sido confirmada. Paga la señal cuanto antes para terminar de reservarlo. ¡Que no te lo quiten!");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case NEW_REQUEST:
                notification.setType(NotificationType.NEW_REQUEST);
                notification.setSubject("Nueva solicitud de reserva");
                notification.setMessage("Has recibido una nueva solicitud de tu servicio "
                        + (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + ". Revisa la petición y áceptala para permitir al cliente pagar la señal o recházala en caso de no poder ofrecer el servicio.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case NEW_DEPOSIT_PAYMENT:
                notification.setType(NotificationType.NEW_DEPOSIT_PAYMENT);
                notification.setSubject("Nuevo pago de señal");
                notification.setMessage("El usuario ha pagado la señal de tu reserva de " +
                        (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + ". Estamos procesando el pago. Si no lo recibes en los próximos días, por favor, contacta con el soporte de EventBride.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case NEW_REMAINING_PAYMENT:
                notification.setType(NotificationType.NEW_REMAINING_PAYMENT);
                notification.setSubject("Nuevo pago final");
                notification.setMessage("El usuario ha pagado el monto restante para la contratación de tu servicio " +
                        (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                                : eventProperties.getVenue().getName())
                        + " para el evento " + event.getName()
                        + ". Estamos procesando el pago. Si no lo recibes en los próximos días, por favor, contacta con el soporte de EventBride.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case EVENT_DELETED:
                notification.setType(NotificationType.EVENT_DELETED);
                notification.setSubject("Evento eliminado");
                notification.setMessage("Tu evento " + event.getName() + " ha sido eliminado.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case INVITATION_CONFIRMED:
                notification.setType(NotificationType.INVITATION_CONFIRMED);
                notification.setSubject("Confirmación de invitación");
                notification.setMessage(invitation.getFirstName() + " " + invitation.getLastName() + " ha aceptado tu invitación para el evento " + event.getName() + ".\n" +
                        "Recuerda que puedes ver la lista de invitados en tu perfil.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case INVITATION_DELETED:
                notification.setType(NotificationType.INVITATION_DELETED);
                notification.setSubject("Eliminación de invitación");
                notification.setMessage(" Has eliminado la invitación de " + invitation.getFirstName() + " " + invitation.getLastName() + " para el evento " + event.getName() + ".\n" +
                        "Recuerda que puedes ver la lista de invitados en tu perfil.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case PLAN_EXPIRED:
                notification.setType(NotificationType.PLAN_EXPIRED);
                notification.setSubject("Plan expirado");
                notification.setMessage("Tu plan premium ha expirado. Por favor, renueva tu suscripción.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case PLAN_UPGRADED:
                notification.setType(NotificationType.PLAN_UPGRADED);
                notification.setSubject("Plan Mejorado");
                notification.setMessage("Tu plan ha sido mejorado al plan premium.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            case EVENTPROPERTIES_DELETED:
                notification.setType(NotificationType.EVENTPROPERTIES_DELETED);
                notification.setSubject("Eliminación de servicio");
                notification.setMessage("Has eliminado el servicio " + (eventProperties.getOtherService() != null ? eventProperties.getOtherService().getName()
                        : eventProperties.getVenue().getName()) + " para el evento " + event.getName() + ".\n" +
                        "Recuerda que puedes ver la lista de servicios en tu perfil.");
                sendEmailNotification(user, notification.getSubject(), notification.getMessage());
                break;
            default:
                throw new RuntimeException("Unknown notification type: " + type);
        }
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendEmailNotification(User to, String subject, String body) {
        if (Boolean.TRUE.equals(to.getReceivesEmails())) { // Manejar null de forma segura
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("eventbride6@gmail.com");
            mailMessage.setTo(to.getEmail());
            mailMessage.setSubject(subject);
            mailMessage.setText("Hola " + to.getFirstName() + ",\n" + body + "\n\n Saludos, \n EventBride");
            mailSender.send(mailMessage);
        }
    }

    @Scheduled(cron = "0 0 8 * * *") // Ejecuta todos los días a las 8:00 AM
    @Transactional
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();

        // Bodas: 4 meses antes
        LocalDate weddingStart = today.plusMonths(4);
        LocalDate weddingEnd = today.plusMonths(4).plusDays(2);
        List<Event> weddings = eventRepository.findByTypeAndEventDateBetween(EventType.WEDDING , weddingStart, weddingEnd);
        sendRemindersForEvents(weddings);

        // Bautizos: 1 mes antes
        LocalDate christeningStart = today.plusMonths(1);
        LocalDate christeningEnd = today.plusMonths(1).plusDays(2);
        List<Event> christenings = eventRepository.findByTypeAndEventDateBetween(EventType.CHRISTENING, christeningStart,
                christeningEnd);
        sendRemindersForEvents(christenings);

        // Comuniones: 2 meses antes
        LocalDate communionStart = today.plusMonths(2);
        LocalDate communionEnd = today.plusMonths(2).plusDays(2);
        List<Event> communions = eventRepository.findByTypeAndEventDateBetween(EventType.COMMUNION, communionStart, communionEnd);
        sendRemindersForEvents(communions);
    }

    private void sendRemindersForEvents(List<Event> events) {
        for (Event event : events) {
            User user = event.getUser();
            createNotification(Notification.NotificationType.PAYMENT_REMINDER, user, event, null,null);
        }
    }

}

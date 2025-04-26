package com.eventbride.invitation;

import com.eventbride.dto.EventDTO;
import com.eventbride.dto.InvitationDTO;
import com.eventbride.email.EmailService;
import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.notification.Notification;
import com.eventbride.notification.NotificationService;
import com.eventbride.user.User;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.task.TaskExecutionProperties.Simple;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.Optional;

@Service
public class InvitationService {

	@Autowired
	private InvitationRepository invitationRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private JavaMailSender mailSender;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private EmailService emailService;
	
	@Transactional()
	public Invitation createVoidInvitation(Integer eventId, Integer maxGuests, User user, String guestEmail, String confirmationLink) throws IllegalArgumentException {

		// Comprobamos que en las eventpropeties del evento exista una venue
		Event event = eventRepository.findById(eventId).orElse(null);

		if (event == null) {
			throw new IllegalArgumentException("El evento no existe");
		}

		if(!event.getUser().getId().equals(user.getId())) {
			throw new IllegalArgumentException("El evento no te pertenece");
		}

		boolean hasVenue = event.getEventProperties().stream()
				.anyMatch(eventProperties -> eventProperties.getVenue() != null);

		if (!hasVenue) {
			throw new IllegalArgumentException("No se puede crear una invitación para un evento sin venue");
		}

		Invitation invitation = new Invitation();
		invitation.setMaxGuests(maxGuests);
		invitation.setEmail(guestEmail);
		invitation.setEvent(event);
		invitation.setInvitationType(Invitation.InvitationType.SENT);
		
		// Guarda primero la invitación para obtener el ID generado
		Invitation savedInvitation = invitationRepository.save(invitation);
		
		// Ahora puedes usar ese ID en el enlace de confirmación
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setFrom("eventbride6@gmail.com");
		mailMessage.setTo(guestEmail);
		mailMessage.setSubject("Invitación a evento");
		mailMessage.setText("Hola, \nHas sido invitado al evento: " + event.getName() +
				". \nEl evento se llevará a cabo en la fecha: " + event.getEventDate() +
				", en "
				+ event.getEventProperties().stream()
						.filter(eventProperties -> eventProperties.getVenue() != null).findFirst().get().getVenue().getName()
				+ ", con dirección "
				+ event.getEventProperties().stream()
						.filter(eventProperties -> eventProperties.getVenue() != null).findFirst().get().getVenue().getAddress()
				+ ". \n Para confirmar su asistencia debe acceder al siguiente enlace: "
				+ confirmationLink + "/" + savedInvitation.getId() + ". \nMuchas gracias!");
		
		emailService.sendEmail(mailMessage);
		
		return savedInvitation;
	}

	public Invitation getInvitationById(Integer invitationId) throws IllegalArgumentException {
		Optional<Invitation> invitationOpt = invitationRepository.findById(invitationId);

		if (!invitationOpt.isPresent()) {
			throw new IllegalArgumentException("La invitación no existe");
		}

		Invitation invitation = invitationOpt.get();
		Event event = invitation.getEvent();

		return invitation;
	}

	@Transactional
	public Invitation fillInvitation(Invitation invitation) throws IllegalArgumentException {

		Invitation existingInvitation = invitationRepository.findById(invitation.getId()).orElse(null);

		if (invitation.getNumberOfGuests() > existingInvitation.getMaxGuests()) {
			throw new IllegalArgumentException("Se supera el límite de invitados");
		}

		if(existingInvitation.getInvitationType().equals(Invitation.InvitationType.ACCEPTED)) {
			throw new IllegalArgumentException("La invitación ya ha sido aceptada");
		}

		if(invitation.getLastName().trim().equals("") || invitation.getFirstName().trim().equals("")) {
			throw new IllegalArgumentException("Faltan datos en la invitación");
		}

		BeanUtils.copyProperties(invitation, existingInvitation, "id", "event", "invitationType", "email");
		existingInvitation.setInvitationType(Invitation.InvitationType.ACCEPTED);
		notificationService.createNotification(Notification.NotificationType.INVITATION_CONFIRMED,
				existingInvitation.getEvent().getUser(), existingInvitation.getEvent(), null, invitation);
		// ENVIAR CORREO
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setFrom("eventbride6@gmail.com");
		mailMessage.setTo(existingInvitation.getEmail());
		mailMessage.setSubject("Invitación a evento");
		mailMessage.setText("Hola " + existingInvitation.getFirstName() + " " + existingInvitation.getLastName() +
				". \nHas confirmado tu asistencia al evento: " + existingInvitation.getEvent().getName() +
				". \nEl evento se llevará a cabo en la fecha: " + existingInvitation.getEvent().getEventDate() +
				", en "
				+ existingInvitation.getEvent().getEventProperties().stream()
						.filter(eventProperties -> eventProperties.getVenue() != null).findFirst().get().getVenue()
						.getName()
				+
				", con dirección "
				+ existingInvitation.getEvent().getEventProperties().stream()
						.filter(eventProperties -> eventProperties.getVenue() != null).findFirst().get().getVenue()
						.getAddress()
				+
				". \nMuchas gracias!");

		emailService.sendEmail(mailMessage);
		

		return invitationRepository.save(existingInvitation);
	}

	@Transactional(readOnly = true)
	public List<InvitationDTO> getInvitationByEventId(Integer eventId, User user) throws IllegalArgumentException {

		Event event = eventRepository.findById(eventId).orElse(null);

		if(event == null) {
			throw new IllegalArgumentException("El evento no existe");
		}

		if(!event.getUser().getId().equals(user.getId())) {
			throw new IllegalArgumentException("El evento no te pertenece");
		}
		List<Invitation> invitations = invitationRepository.findByEventId(eventId);
		return InvitationDTO.fromEntities(invitations);
	}

	@Transactional(readOnly = true)
	public List<Invitation> getInvitationByEventIdNotDTO(Integer eventId, User user) throws IllegalArgumentException {

		Event event = eventRepository.findById(eventId).orElse(null);

		if(event == null) {
			throw new IllegalArgumentException("El evento no existe");
		}

		if(!event.getUser().getId().equals(user.getId())) {
			throw new IllegalArgumentException("El evento no te pertenece");
		}
		List<Invitation> invitations = invitationRepository.findByEventId(eventId);
		return invitations;
	}

	public void deleteInvitations(List<Invitation> i) {
		invitationRepository.deleteAll(i);
	}

	public void deleteInvitationById(Integer invitationId, User user) throws IllegalArgumentException{
		Invitation invitation = invitationRepository.findById(invitationId).orElse(null);

		if(invitation == null){
			throw new IllegalArgumentException("La invitación no existe");
		}

		if(!invitation.getEvent().getUser().getId().equals(user.getId())){
			throw new IllegalArgumentException("No tienes permiso para eliminar esta invitación");
		}

		invitationRepository.deleteById(invitationId);
		notificationService.createNotification(Notification.NotificationType.INVITATION_DELETED,
				invitation.getEvent().getUser(), invitation.getEvent(), null, invitation);
	}

}

package com.eventbride.invitation;

import com.eventbride.config.jwt.services.UserManagementService;
import com.eventbride.dto.InvitationDTO;
import com.eventbride.event.Event;
import com.eventbride.model.MessageResponse;
import com.eventbride.otherService.OtherService;
import com.eventbride.user.User;
import com.eventbride.user.UserService;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invitation")
public class InvitationController {

	@Autowired
	private InvitationService invitationService;

	@Autowired
	private UserService userService;

	@PostMapping("/create/{id}")
	public ResponseEntity<?> createInvitation(@PathVariable int id, @RequestBody int maxGuests, @RequestBody String guestEmail, @RequestBody String confirmationEmail) throws IllegalArgumentException{
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Optional<User> user = userService.getUserByUsername(auth.getName());
	
		if (!user.isPresent()) {
			throw new IllegalArgumentException("El usuario no existe");
		}
	
		Invitation res = invitationService.createVoidInvitation(id, maxGuests, user.get(), guestEmail, confirmationEmail);
		InvitationDTO invitationDTO = new InvitationDTO(res);
		return new ResponseEntity<>(invitationDTO, HttpStatus.CREATED);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getInvitation(@PathVariable int id) throws IllegalArgumentException {

		Invitation invitation = invitationService.getInvitationById(id);
		InvitationDTO invitationDTO = new InvitationDTO(invitation);
		return new ResponseEntity<>(invitationDTO, HttpStatus.OK);
	}

	@GetMapping("/eventInvitations/{eventId}")
	public ResponseEntity<?> getInvitationsByEvent(@PathVariable int eventId) throws IllegalArgumentException {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Optional<User> user = userService.getUserByUsername(auth.getName());

		if (!user.isPresent()) {
			throw new IllegalArgumentException("El usuario no existe");
		}

		List<InvitationDTO> invitations = invitationService.getInvitationByEventId(eventId, user.get());

		return new ResponseEntity<>(invitations, HttpStatus.OK);
	}

	@PutMapping
	public ResponseEntity<?> fillInvitation(@RequestBody @Valid Invitation invitation) throws IllegalArgumentException {
		Invitation res = invitationService.fillInvitation(invitation);
		InvitationDTO invitationDTO = new InvitationDTO(invitation);
		return new ResponseEntity<>(invitationDTO, HttpStatus.CREATED);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteInvitation(@PathVariable int id) throws IllegalArgumentException {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Optional<User> user = userService.getUserByUsername(auth.getName());

		if (!user.isPresent()) {
			throw new IllegalArgumentException("El usuario no existe");
		}

		invitationService.deleteInvitationById(id, user.get());
		return new ResponseEntity<>(new MessageResponse("Se ha eliminado la invitación correctamente"), HttpStatus.OK);
	}

}

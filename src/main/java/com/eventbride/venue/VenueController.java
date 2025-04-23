package com.eventbride.venue;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import com.eventbride.dto.VenueDTO;
import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventPropertiesService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

	@Autowired
	private VenueService venueService;

	@Autowired
	private EventService eventService;

	@Autowired
	private EventPropertiesService eventPropertiesService;

	@GetMapping
	public ResponseEntity<List<VenueDTO>> getAllVenues() {
		List<Venue> venues = venueService.getAllVenues();
		if (venues.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(VenueDTO.fromEntities(venues));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Venue> getVenueById(@PathVariable Integer id) {
		return venueService.getVenueById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/filter")
	public ResponseEntity<List<VenueDTO>> getFilteredVenues(
			@RequestParam(required = false) String city,
			@RequestParam(required = false) Integer maxGuests,
			@RequestParam(required = false) Double surface) {
		List<Venue> filteredVenues = venueService.getFilteredVenues(city, maxGuests, surface);
		return ResponseEntity.ok(VenueDTO.fromEntities(filteredVenues));

	}

	@PostMapping
	public ResponseEntity<?> createVenue(@Valid @RequestBody Venue venue) throws IllegalArgumentException {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

		if (!roles.contains("SUPPLIER")) {
			throw new IllegalArgumentException("No tienes permisos para crear este venue.");
		}
		if (venue.getEarliestTime().isAfter(venue.getLatestTime()) || venue.getEarliestTime().equals(venue.getLatestTime())) {
			throw new IllegalArgumentException("La hora de apertura no puede ser posterior o igual a la hora de cierre.");
		}
		Venue newVenue = venueService.save(venue);
		return ResponseEntity.ok(new VenueDTO(newVenue));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateVenue(@PathVariable Integer id, @Valid @RequestBody Venue venue) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

		if (!roles.contains("SUPPLIER")) {
			return new ResponseEntity<>("No tienes permisos para editar este venue.", HttpStatus.FORBIDDEN);
		}
		if (venue.getEarliestTime().isAfter(venue.getLatestTime()) || venue.getEarliestTime().equals(venue.getLatestTime())) {
			throw new IllegalArgumentException("La hora de apertura no puede ser posterior o igual a la hora de cierre.");
		}

		try {
			Venue updatedVenue = venueService.update(id, venue);
			return ResponseEntity.ok(new VenueDTO(updatedVenue));
		} catch (RuntimeException e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteVenue(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();

		System.out.println("Authorities: " + authorities);

		boolean hasSupplierRole = authorities.stream()
				.map(GrantedAuthority::getAuthority)
				.anyMatch(role -> role.equals("SUPPLIER") || role.equals("ROLE_SUPPLIER"));

		if (hasSupplierRole) {
			venueService.deleteVenue(id);
			return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
		}

		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();

		ex.getBindingResult().getFieldErrors().forEach(error -> {
			errors.put(error.getField(), error.getDefaultMessage());
		});

		return ResponseEntity.badRequest().body(errors);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, String>> handleJsonParseError(HttpMessageNotReadableException ex) {
		Map<String, String> errorDetails = new HashMap<>();

		Throwable cause = ex.getCause();
		if (cause instanceof JsonMappingException jsonMappingException) {
			for (JsonMappingException.Reference reference : jsonMappingException.getPath()) {
				String fieldName = reference.getFieldName();
				errorDetails.put(fieldName,
						"El campo '" + fieldName + "' tiene un formato incorrecto o un valor no válido.");
			}
			errorDetails.put("error", "El formato del JSON es incorrecto o faltan datos obligatorios.");
		} else if (cause instanceof JsonParseException) {
			errorDetails.put("error", "Error de sintaxis en el JSON. Verifica la estructura.");
		} else {
			errorDetails.put("error", "El formato del JSON es incorrecto o faltan datos obligatorios.");
		}

		return ResponseEntity.badRequest().body(errorDetails);
	}

	@DeleteMapping("/admin/{id}")
	public ResponseEntity<?> deleteService(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		if (roles.contains("ADMIN")) {
			venueService.deleteVenue(id);
			return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@PutMapping("/admin/{id}")
	public ResponseEntity<?> updateVenueAdmin(@PathVariable Integer id, @Valid @RequestBody Venue venueDetails) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		if (roles.contains("ADMIN")) {
			if (venueDetails.getEarliestTime().isAfter(venueDetails.getLatestTime()) || venueDetails.getEarliestTime().equals(venueDetails.getLatestTime())) {
				throw new IllegalArgumentException("La hora de apertura no puede ser posterior o igual a la hora de cierre.");
			}
			try {
				Venue updatedVenue = venueService.updateVenue(id, venueDetails);
				return new ResponseEntity<>(new VenueDTO(updatedVenue), HttpStatus.OK);
			} catch (RuntimeException e) {
				return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			}
		}
		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@PatchMapping("/disable/{id}")
	public ResponseEntity<?> toggleVenueAvailability(@PathVariable Integer id) {
		Optional<Venue> optionalService = venueService.getVenueById(id);
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();

		if (optionalService.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("error", "Servicio no encontrado"));
		}

		Venue service = optionalService.get();

		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).toList();

		boolean isAdmin = roles.contains("ADMIN") || roles.contains("ROLE_ADMIN");

		boolean isSupplierAndOwner = (roles.contains("SUPPLIER") || roles.contains("ROLE_SUPPLIER"))
				&& service.getUser() != null
				&& service.getUser().getUsername().equals(username);

		if (!isAdmin && !isSupplierAndOwner) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "No tienes permisos para modificar este servicio"));
		}

		// Asegurarse que no se puede hacer disable si existen eventos asociados al
		// recinto
		boolean eventoPorVenir = false;

		for (Event e : eventService.findAll()) {
			for (EventProperties ep : e.getEventProperties()) {
				if (ep.getVenue() != null && ep.getVenue().getId() == service.getId()) {
					if (e.getEventDate().isAfter(LocalDate.now())) {
						eventoPorVenir = true;
						break;
					}
				}
			}
		}

		if (eventoPorVenir) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("error",
							"No puedes deshabilitar servicios asociados a eventos que todavia no se han celebrado"));
		}

		service.setAvailable(!service.getAvailable());
		venueService.save(service);
		return ResponseEntity.ok(Map.of("available", service.getAvailable()));
	}

}

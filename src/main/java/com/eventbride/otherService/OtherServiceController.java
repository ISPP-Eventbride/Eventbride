package com.eventbride.otherService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.eventbride.dto.OtherServiceDTO;
import com.eventbride.dto.publics.OtherServicePublicDTO;
import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventPropertiesService;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.eventbride.otherService.OtherService.OtherServiceType;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.Venue;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/other-services")
public class OtherServiceController {

	@Autowired
	private OtherServiceService otherServiceService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private EventPropertiesService eventPropertiesService;

	@Autowired
	private EventService eventService;

	@GetMapping
	public List<OtherServicePublicDTO> getAllOtherServices() {
		List<OtherService> otherServices = otherServiceService.getAllOtherServices().stream()
				.filter(s -> s.getAvailable() == true).toList();
		return OtherServicePublicDTO.fromEntities(otherServices);
	}

	@GetMapping("/{id}")
	public OtherService getOtherServiceById(@PathVariable("id") Integer id) {
		Optional<OtherService> otherSer = otherServiceService.getOtherServiceById(id);
		return otherSer.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
	}

	@GetMapping("/filter")
	public List<OtherServicePublicDTO> getFilteredOtherServices(
			@RequestParam(required = false) String name,
			@RequestParam(required = false) String city,
			@RequestParam(required = false) OtherServiceType type) {
		List<OtherService> otherServices = otherServiceService.getFilteredOtherServices(name, city, type).stream()
		.filter(s -> s.getAvailable() == true).toList();
		return OtherServicePublicDTO.fromEntities(otherServices);
	}

	@PostMapping
	public ResponseEntity<?> createOtherService(@Valid @RequestBody OtherService otherService) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

		if (!roles.contains("SUPPLIER")) {
			throw new IllegalArgumentException("No tienes permisos para crear este servicio.");
		}

		OtherService newOtherService = otherServiceService.createOtherService(otherService);
		return ResponseEntity.ok(new OtherServiceDTO(newOtherService));
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteOtherService(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();

		Optional<OtherService> optionalService = otherServiceService.getOtherServiceById(id);
		if (optionalService.isEmpty()) {
			return new ResponseEntity<>("Servicio no encontrado", HttpStatus.NOT_FOUND);
		}

		OtherService service = optionalService.get();

		if (!service.getUser().getUsername().equals(username)) {
			return new ResponseEntity<>("No tienes permisos para eliminar este servicio", HttpStatus.UNAUTHORIZED);
		}

		// Asegurarse que no se puede hacer disable si existen eventos asociados al
		// servicio
		boolean eventoPorVenir = false;
		for (Event e : eventService.findAll()) {
			for (EventProperties ep : e.getEventProperties()) {
				if (ep.getOtherService() != null && ep.getOtherService().getId() == service.getId()) {
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

		otherServiceService.deleteOtherService(id);
		return new ResponseEntity<>("Eliminado correctamente", HttpStatus.OK);
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

	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateServiceUser(@PathVariable Integer id,
			@Valid @RequestBody OtherService updatedService) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

		if (roles.contains("SUPPLIER")) {
			try {
				Optional<OtherService> existingServiceOptional = otherServiceService.getOtherServiceById(id);
				if (existingServiceOptional.isEmpty()) {
					return new ResponseEntity<>("Service not found", HttpStatus.NOT_FOUND);
				}

				OtherService existingService = existingServiceOptional.get();

				UserDetails userDetails = (UserDetails) auth.getPrincipal();
				String username = userDetails.getUsername();

				Optional<User> loggedUserOptional = userRepository.findByUsername(username);
				if (loggedUserOptional.isEmpty()) {
					return new ResponseEntity<>("User not found", HttpStatus.UNAUTHORIZED);
				}

				User loggedUser = loggedUserOptional.get();

				if (!existingService.getUser().getId().equals(loggedUser.getId())) {
					return new ResponseEntity<>("You are not allowed to update this service", HttpStatus.FORBIDDEN);
				}

				updatedService.setId(id);
				OtherService savedService = otherServiceService.updateOtherService(id, updatedService);
				return new ResponseEntity<>(new OtherServiceDTO(savedService), HttpStatus.OK);
			} catch (RuntimeException e) {
				return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			}
		}

		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@PutMapping("/admin/{id}")
	public ResponseEntity<?> updateService(@PathVariable Integer id, @Valid @RequestBody OtherService updatedService) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		if (roles.contains("ADMIN")) {
			try {
				Optional<OtherService> existingServiceOptional = otherServiceService.getOtherServiceById(id);
				if (existingServiceOptional.isEmpty()) {
					return new ResponseEntity<>("Service not found", HttpStatus.NOT_FOUND);
				}
				updatedService.setId(id);
				OtherService savedService = otherServiceService.updateOtherService(id, updatedService);
				return new ResponseEntity<>(new OtherServiceDTO(savedService), HttpStatus.OK);
			} catch (RuntimeException e) {
				return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			}
		}
		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@DeleteMapping("/admin/{id}")
	public ResponseEntity<?> deleteService(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		if (roles.contains("ADMIN")) {
			otherServiceService.deleteOtherService(id);
			return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@PatchMapping("/disable/{id}")
	public ResponseEntity<?> toggleOtherServiceAvailability(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();

		Optional<OtherService> optionalService = otherServiceService.getOtherServiceById(id);
		if (optionalService.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("error", "Servicio no encontrado"));
		}

		OtherService service = optionalService.get();

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

		service.setAvailable(!service.getAvailable());
		otherServiceService.save(service);
		return ResponseEntity.ok(Map.of("available", service.getAvailable()));
	}

}

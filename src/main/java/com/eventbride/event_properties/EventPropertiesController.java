package com.eventbride.event_properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.eventbride.dto.EventPropertiesDTO;
import com.eventbride.dto.EventPropertiesMapper;
import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.event.EventService;
import com.eventbride.event_properties.EventProperties.Status;
import com.eventbride.user.User;
import com.eventbride.user.UserService;
import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherServiceService;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;

import java.nio.file.attribute.UserPrincipal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/event-properties")
public class EventPropertiesController {

    private final UserService userService;
    private final EventService eventService;
    private final EventPropertiesService eventPropertiesService;
    private final OtherServiceService otherServiceService;
    private final VenueService venueService;
    private final EventPropertiesMapper eventPropertiesMapper;
    private final EventPropertiesRepository eventPropertiesRepository;

    @Autowired
    public EventPropertiesController(EventPropertiesService eventPropertiesService, UserService userService,
            EventService eventService, OtherServiceService otherServiceService, VenueService venueService,
            EventPropertiesMapper eventPropertiesMapper, EventPropertiesRepository eventPropertiesRepository) {
        this.eventPropertiesService = eventPropertiesService;
        this.userService = userService;
        this.eventService = eventService;
        this.otherServiceService = otherServiceService;
        this.venueService = venueService;
        this.eventPropertiesMapper = eventPropertiesMapper;
        this.eventPropertiesRepository = eventPropertiesRepository;
    }

    private Boolean getOwned(Integer id) {
        // DEBEMOS COMPROBAR QUE EL EVENT ASOCIADO ES DEL USUARIO
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> user = userService.getUserByUsername(auth.getName());

        if (!user.isPresent()) {
            throw new IllegalArgumentException("El usuario no existe");
        }

        List<Event> ownedEvents = eventService.findEventsByUserId(user.get().getId());
        Boolean owned = ownedEvents.stream()
                .anyMatch(e -> e.getEventProperties().stream().anyMatch(ep -> ep.getId().equals(id)));

        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        return !roles.contains("ADMIN") && !owned;
    }

    @GetMapping
    public List<EventProperties> findAllEvents() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        if (!roles.contains("ADMIN")) {
            throw new IllegalArgumentException("No tienes permisos para ver estos datos. https://blog.scrt.ch/wp-content/uploads/2015/03/jurassicpark_magicword1.png");
        }
        return eventPropertiesService.findAll();
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateService(@PathVariable Integer id,
            @Valid @RequestBody EventProperties updatedService) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        if (roles.contains("ADMIN")) {
            try {
                Optional<EventProperties> existingServiceOptional = eventPropertiesService.findByIdOptional(id);
                if (existingServiceOptional.isEmpty()) {
                    return new ResponseEntity<>("Service not found", HttpStatus.NOT_FOUND);
                }
                EventProperties existingService = existingServiceOptional.get();
                existingService.setStartTime(updatedService.getStartTime());
                existingService.setEndTime(updatedService.getEndTime());
                existingService.setStatus(updatedService.getStatus());
                Event evento = eventPropertiesRepository.findEventByEventPropertiesId(id);
                EventProperties savedService = eventPropertiesService.updateEventProperties(existingService, id);
                return new ResponseEntity<>(eventPropertiesMapper.toDTO(savedService, evento), HttpStatus.OK);
            } catch (RuntimeException e) {
                return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/DTO/{id}")
    public EventPropertiesDTO findById(@PathVariable("id") Integer id) {
        // Comprobamos que el evento asociado a ese eventPropertie esta asociado al
        // usuario
        if (getOwned(id)) {
            throw new IllegalArgumentException("Este pago no se puede realizar");
        }

        return eventPropertiesService.findByIdDTO(id);
    }

    @GetMapping("/provider/{id}")
    public EventPropertiesDTO findByIdProvider(@PathVariable("id") Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        User user = userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Integer userId = user.getId();

        EventPropertiesDTO eventprop = eventPropertiesService.findByIdDTO(id);

        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        if (!roles.contains("SUPPLIER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        Event evento = eventService.findById(eventprop.getEventDTO().getId());
        if (evento == null) {
            throw new IllegalArgumentException("El evento no existe");
        }

        if (eventprop.getEventDTO() == null) {
            throw new IllegalArgumentException("Este EventProperties no tiene un Event asociado");
        }

        if (!roles.contains("ADMIN") && !roles.contains("SUPPLIER")) {
            throw new IllegalArgumentException("El servicio no te pertenece");
        }

        if (roles.contains("SUPPLIER")) {
            if (eventprop.getOtherServiceDTO() != null) {
                if (eventprop.getOtherServiceDTO().getUserDTO().getId() != userId) {
                    throw new IllegalArgumentException("El servicio no te pertenece");
                }
            }
            if (eventprop.getVenueDTO() != null) {
                if (eventprop.getVenueDTO().getUserDTO().getId() != userId) {
                    throw new IllegalArgumentException("El recinto no te pertenece");
                }
            }
        }
        return eventPropertiesService.findByIdDTO(id);
    }

    @GetMapping("/requests/{userId}")
    public List<List<Object>> getAllEventPropertiesAfterNow(@PathVariable("userId") Integer userId,
            @AuthenticationPrincipal User userPrincipal) {
        if (!userPrincipal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver estos datos");
        }
        List<List<Object>> result = eventPropertiesService.findAllEventPropertiesAfterNow(userId);
        return result;
    }

    @PutMapping("/{eventId}/add-otherservice/{otherServiceId}")
    public ResponseEntity<?> addOtherServiceToEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer otherServiceId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        User user = userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Integer userId = user.getId();

        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        if (!roles.contains("ADMIN") && !roles.contains("CLIENT")) {
            throw new IllegalArgumentException("El evento no te pertenece");
        }

        Event event = Optional.ofNullable(eventService.findById(eventId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
        if (!event.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El evento no te pertenece");
        }

        OtherService o = otherServiceService.getAllOtherServices()
                .stream()
                .filter(e -> e.getId().equals(otherServiceId)) // Usar equals() en lugar de ==
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));

        if (o.getAvailable()) {
            Event updatedEvent = eventPropertiesService.addOtherServiceToEvent(eventId, otherServiceId, startDate,
                    endDate);
            return ResponseEntity.ok(updatedEvent);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No puedes deshabilitar servicios asociados a eventos"));
        }
    }

    @PutMapping("/{eventId}/add-venue/{venueId}")
    public ResponseEntity<?> addVenueToEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer venueId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        User user = userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Integer userId = user.getId();

        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        if (!roles.contains("ADMIN") && !roles.contains("CLIENT")) {
            throw new IllegalArgumentException("El evento no te pertenece");
        }

        // Verificar que el evento existe y que le pertenece al usuario autenticado
        Event event = Optional.ofNullable(eventService.findById(eventId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
        if (!event.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El evento no te pertenece");
        }

        Venue venue = venueService.getAllVenues()
                .stream()
                .filter(v -> v.getId().equals(venueId)) // Usar equals() para comparar Integer
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue no encontrado"));

        if (!venue.getAvailable()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No puedes asignar un venue deshabilitado a un evento"));
        }
        if(startDate.isAfter(endDate) || startDate.isEqual(endDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "La fecha de inicio no puede ser posterior o igual a la fecha de fin"));
        }
        if(startDate.toLocalTime().isBefore(venue.getEarliestTime()) || endDate.toLocalTime().isAfter(venue.getLatestTime())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "La fecha de inicio o fin no puede estar fuera del horario del venue"));
        }

        Event updatedEvent = eventPropertiesService.addVenueToEvent(eventId, venueId, startDate, endDate);
        return ResponseEntity.ok(updatedEvent);
    }

    // q se crea un payment y q el eventproperties de ese payment sea el que se ha
    // cancelado
    @PutMapping("/cancel/{eventPropertieID}")
    public ResponseEntity<Void> cancelEventPropertie(@PathVariable Integer eventPropertieID) {
        EventProperties evenProp = eventPropertiesService.findById(eventPropertieID);
        LocalDate fechaEvento = evenProp.getStartTime().toLocalDate();
        if (evenProp.getVenue() != null) {
            eventPropertiesService.getEventsPropsToCancelVenue(fechaEvento, evenProp.getVenue().getId(),
                    evenProp.getId());
        } else {
            eventPropertiesService.getEventsPropsToCancelOtherService(fechaEvento, evenProp.getOtherService().getId(),
                    evenProp.getId());
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{eventPropertiesId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<EventProperties> acceptService(@PathVariable("eventPropertiesId") Integer eventPropertiesId) {
        EventProperties updateEventProperties = eventPropertiesService.findById(eventPropertiesId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        User user = userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Integer userId = user.getId();

        if (updateEventProperties == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (!roles.contains("ADMIN") && !roles.contains("SUPPLIER")) {
            throw new IllegalArgumentException("El servicio no te pertenece");
        }

        if (updateEventProperties.getVenue() != null) {
            if (!updateEventProperties.getVenue().getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El venue no pertenece al usuario autenticado");
            }
        } else if (updateEventProperties.getOtherService() != null) {
            if (!updateEventProperties.getOtherService().getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "El otherService no pertenece al usuario autenticado");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se encuentra un servicio asociado al evento");
        }

        updateEventProperties.setStatus(EventProperties.Status.APPROVED);
        return new ResponseEntity<>(
                this.eventPropertiesService.updateEventProperties(updateEventProperties, eventPropertiesId),
                HttpStatus.OK);
    }

    @DeleteMapping("/{eventPropertiesId}")
    public void rejectService(@PathVariable("eventPropertiesId") Integer eventPropertiesId) {
        EventProperties eventProperties = eventPropertiesService.findById(eventPropertiesId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        User user = userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Integer userId = user.getId();

        if (!roles.contains("ADMIN") && !roles.contains("SUPPLIER")) {
            throw new IllegalArgumentException("El servicio no te pertenece");
        }

        if (eventProperties.getVenue() != null) {
            if (!eventProperties.getVenue().getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El venue no pertenece al usuario autenticado");
            }
        } else if (eventProperties.getOtherService() != null) {
            if (!eventProperties.getOtherService().getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "El otherService no pertenece al usuario autenticado");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se encuentra un servicio asociado al evento");
        }
        if (eventProperties != null) {
            Venue venue = eventProperties.getVenue();
            OtherService otherService = eventProperties.getOtherService();
            eventProperties.setOtherService(null);
            eventProperties.setVenue(null);
            EventProperties eventPropertiesSaved = eventPropertiesService.save(eventProperties);
            eventPropertiesService.deleteEventProperties(eventPropertiesSaved.getId(), venue, otherService);
        }
    }

    @Transactional
    @DeleteMapping("/client/{eventPropertiesId}")
    public ResponseEntity<Void> clientCancelEventProperty(@PathVariable Integer eventPropertiesId) {
        EventProperties eventProperty = eventPropertiesService.findById(eventPropertiesId);
        
        if (eventProperty == null) {
            return ResponseEntity.notFound().build();
        }

        if (getOwned(eventPropertiesId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        if (!Status.PENDING.equals(eventProperty.getStatus()) && !Status.APPROVED.equals(eventProperty.getStatus()) && !Status.CANCELLED.equals(eventProperty.getStatus())) {
            return ResponseEntity.badRequest().build();
        }
        
        if (eventProperty.getVenue() != null) {
            eventPropertiesService.clientCancelVenue(eventPropertiesId);
        } else if (eventProperty.getOtherService() != null) {
            eventPropertiesService.clientCancelOtherService(eventPropertiesId);
        } else {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending/{userId}")
    public List<EventPropertiesDTO> getPendingEventPropertiesByUserId(@PathVariable("userId") Integer userId,
            @AuthenticationPrincipal User userPrincipal) {
        if (!userPrincipal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver estos datos");
        }

        return eventPropertiesService.findEventPropertiesPendingByUserId(userId);
    }

    @PutMapping("/status/pending/{eventPropertiesId}")
    public ResponseEntity<EventProperties> updateStatusPending(
            @PathVariable("eventPropertiesId") Integer eventPropertiesId) {
        EventProperties eventProperties = eventPropertiesService.findById(eventPropertiesId);

        if (eventProperties != null && !getOwned(eventPropertiesId)) {
            eventProperties.setStatus(EventProperties.Status.PENDING);
            return new ResponseEntity<>(eventPropertiesService.save(eventProperties), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

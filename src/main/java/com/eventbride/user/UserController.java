package com.eventbride.user;

import com.eventbride.event.EventService;
import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherServiceService;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueService;
import com.eventbride.event.Event;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

import com.eventbride.dto.UserChatDTO;
import com.eventbride.dto.UserDTO;

import org.springframework.beans.factory.annotation.Autowired;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private EventService eventService;

    @Autowired
    private VenueService venueService;

    @Autowired
    private OtherServiceService otherServiceService;

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals(role));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() throws IllegalArgumentException {
        if (!hasRole("ADMIN")) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/DTO")
    public ResponseEntity<List<UserDTO>> getAllUsersDTO() throws IllegalArgumentException {
        if (!hasRole("ADMIN")) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        List<UserDTO> users = userService.getAllUsersDTO();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) throws IllegalArgumentException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!hasRole("ADMIN")) {
            if(!username.equals(user.getUsername())){
                throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
            }

            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/chat/{id}")
    public ResponseEntity<UserChatDTO> getUserByIdChat(@PathVariable Integer id) throws IllegalArgumentException {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return ResponseEntity.ok(UserChatDTO.fromEntity(user));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody User updatedUser)
            throws IllegalArgumentException {
        if (!hasRole("ADMIN")) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (updatedUser.getProfilePicture() == null || updatedUser.getProfilePicture().trim().isEmpty()) {
            updatedUser.setProfilePicture(
                    "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.es%2Ficono-gratis%2Fimagen-de-usuario-con-fondo-negro_17004&psig=AOvVaw2uqkuLeXpbAgKF0TwS8o6j&ust=1743779005580000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCJCG9pORvIwDFQAAAAAdAAAAABAT");
        }

        updatedUser.setId(id);
        User savedUser = userService.updateUser(id, updatedUser);
        return new ResponseEntity<>(new UserDTO(savedUser), HttpStatus.OK);
    }

    /**
     * Eliminar un usuario por ID.
     */
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable("id") Integer id) throws IllegalArgumentException {
        if (!hasRole("ADMIN")) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        if (userService.getUserById(id) != null) {
            List<Event> events = eventService.findEventsByUserId(id);
            for (Event e : events) {
                e.setUser(null);
            }
            eventService.saveAll(events);

            List<Venue> venues = venueService.getVenuesByUserId(id);
            for (Venue v : venues) {
                v.setUser(null);
            }
            venueService.saveAll(venues);

            List<OtherService> otherServices = otherServiceService.getOtherServiceByUserId(id);
            for (OtherService os : otherServices) {
                os.setUser(null);
            }
            otherServiceService.saveAll(otherServices);

            userService.deleteUser(id);
        }
    }

	/**
	 * Eliminar tu usuario
	 */
	@DeleteMapping("/")
	public ResponseEntity<?> deleteMyUser() throws IllegalArgumentException {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Optional<User> existingUser = userService.getUserByUsername(auth.getName());

		if (!existingUser.isPresent()) {
			throw new IllegalArgumentException("No has iniciado sesión con alguna cuenta.");
		}

		User user = existingUser.get();

		try {
			List<Venue> venues = venueService.getVenuesByUserId(user.getId());
			for (Venue v : venues) {
				v.setUser(null);
			}
			venueService.saveAll(venues);

			List<OtherService> otherServices = otherServiceService.getOtherServiceByUserId(user.getId());
			for (OtherService os : otherServices) {
				os.setUser(null);
			}
			otherServiceService.saveAll(otherServices);
			String uuid = UUID.randomUUID().toString();

			user.setDni("AAAAAAAAY");
			user.setEmail(uuid + "@anonymous.com");
			user.setFirstName("Anonymous");
			user.setLastName("Anonymous");
			user.setTelephone(123123123);
			user.setUsername(uuid);
			user.setPaymentPlanDate(null);
			user.setExpirePlanDate(null);
			user.setProfilePicture("https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg");
			user.setPassword(uuid);
			userService.save(user);
		}
		catch (Exception e) {
			return new ResponseEntity<>(Map.of("error",e.getMessage()), HttpStatus.BAD_REQUEST);
		}
		return new ResponseEntity<>(Map.of("success",true), HttpStatus.OK);
	}

    @GetMapping("/planExpired")
    public ResponseEntity<?> checkUserPlan() throws IllegalArgumentException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> existingUser = userService.getUserByUsername(auth.getName());
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();

        List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        if (!roles.contains("SUPPLIER")) {
            return existingUser.map(user -> new ResponseEntity<>(new UserDTO(user), HttpStatus.OK))
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        }

        if (existingUser.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        User savedUser = userService.downgradeUserPlan(existingUser.get());
        return new ResponseEntity<>(new UserDTO(savedUser), HttpStatus.OK);
    }

    /**
     * Editar el perfil de un usuario por ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOwnProfile(@PathVariable Integer id, @Valid @RequestBody User updatedUser)
            throws IllegalArgumentException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String username = auth.getName();
        if (!existingUser.getUsername().equals(username)) {
            throw new IllegalArgumentException("No puedes modificar el perfil de otro usuario");
        }

        updatedUser.setId(id);
        User savedUser = userService.updateUser(id, updatedUser);

        return new ResponseEntity<>(new UserDTO(savedUser), HttpStatus.OK);
    }

    @PutMapping("/premium/{id}")
    public ResponseEntity<?> updatePlanToPremium(@PathVariable Integer id, @RequestBody String expirationDate)
            throws IllegalArgumentException {
        User targetUser = userService.getUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = hasRole("ADMIN");
        boolean isSupplier = hasRole("SUPPLIER");

        if (!isAdmin && !isSupplier) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        if (isSupplier) {
            User currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

            if (!targetUser.getId().equals(currentUser.getId())) {
                throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
            }
        }

        LocalDate date = LocalDate.parse(expirationDate.replace("\"", ""));
        User savedUser = userService.setPremium(id, date);

        return new ResponseEntity<>(new UserDTO(savedUser), HttpStatus.OK);
    }

    @GetMapping("/getAdmin")
    public ResponseEntity<?> getAdmin() throws Exception {
        User user = userService.getUserByRole("ADMIN");
        return new ResponseEntity<>(user.getId(), HttpStatus.OK);
    }

}

package com.eventbride.user;

import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueRepository;
import com.eventbride.venue.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.eventbride.service.Service;
import com.eventbride.dto.ChangePasswordDTO;
import com.eventbride.dto.UserDTO;
import com.eventbride.notification.Notification;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.notification.NotificationService;
import com.eventbride.user.User.Plan;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import java.util.Set;
@org.springframework.stereotype.Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;
	@Autowired
	private OtherServiceRepository otherServiceRepository;

	@Autowired
	private VenueRepository	venueRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsersDTO() {
        List<User> users = userRepository.findAll();
        return UserDTO.fromEntities(users);
    }

    @Transactional
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    @Transactional
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User registerUser(User user)  throws IllegalArgumentException{
        if (user.getId() != null) {
            throw new IllegalArgumentException("No se puede registrar un usuario con ID preexistente");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("El username ya está en uso");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        if (user.getProfilePicture()==null || user.getProfilePicture()==""){
            user.setProfilePicture("https://cdn-icons-png.flaticon.com/512/17/17004.png");
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Integer id, User userDetails) throws IllegalArgumentException {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Validaciones de unicidad
        if (!user.getUsername().equals(userDetails.getUsername()) &&
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso");
        }

        if (!user.getEmail().equals(userDetails.getEmail()) &&
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está en uso");
        }

        if (!user.getDni().equals(userDetails.getDni()) &&
            userRepository.existsByDni(userDetails.getDni())) {
            throw new IllegalArgumentException("El DNI ya está registrado");
        }

        // Validar formato del teléfono
        if (!String.valueOf(userDetails.getTelephone()).matches("^[6789]\\d{8}$")) {
            throw new IllegalArgumentException("El teléfono debe tener 9 dígitos y comenzar por 6, 7, 8 o 9");
        }

        // Actualizar campos
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setTelephone(userDetails.getTelephone());
        user.setDni(userDetails.getDni());
        user.setRole(userDetails.getRole());
        user.setPlan(userDetails.getPlan());
        user.setPaymentPlanDate(userDetails.getPaymentPlanDate());
        user.setExpirePlanDate(userDetails.getExpirePlanDate());
        user.setProfilePicture(
            (userDetails.getProfilePicture() == null || userDetails.getProfilePicture().isBlank())
            ? "https://cdn-icons-png.flaticon.com/512/17/17004.png"
            : userDetails.getProfilePicture()
        );
        user.setReceivesEmails(userDetails.getReceivesEmails());

        // Validar restricciones con Bean Validation (@AssertTrue incluida)
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        for (ConstraintViolation<User> v : violations) {
            throw new IllegalArgumentException(v.getMessage());
        }

        return userRepository.save(user);
    }


    @Transactional
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public User save(User user) throws DataAccessException {
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Integer id, ChangePasswordDTO cpDTO, Boolean isAdmin) throws IllegalArgumentException {  
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    
        if (!isAdmin && !passwordEncoder.matches(cpDTO.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }
    
        String newPassword = cpDTO.getNewPassword();
        if (newPassword == null || !newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número");
        }
    
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User downgradeUserPlan(User user)  throws IllegalArgumentException {
		LocalDate date = LocalDate.now();
		if(user.getPlan().equals(Plan.PREMIUM) && user.getExpirePlanDate().isBefore(date)){
			user.setPlan(Plan.BASIC);
			user.setPaymentPlanDate(null);
			user.setExpirePlanDate(null);

			List<OtherService> otherServices = otherServiceRepository.findByUserId(user.getId());
			List<Venue> venues = venueRepository.findByUserId(user.getId());

			List<Service> services = new ArrayList<>();
			services.addAll(otherServices);
			services.addAll(venues);

			// Poner todos a false
			services.stream().forEach(s ->{
				s.setAvailable(false);
			});

			services.stream().limit(3).forEach(s ->{
				s.setAvailable(true);
			});

			// Se guardan en la base de datos
			otherServiceRepository.saveAll(otherServices);
			venueRepository.saveAll(venues);

			return userRepository.save(user);
		}
		return user;
    }

    public User setPremium(Integer id, LocalDate expirationDate)  throws IllegalArgumentException {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setPlan(User.Plan.PREMIUM);
        user.setPaymentPlanDate(LocalDate.now());
        user.setExpirePlanDate(expirationDate);
        notificationService.createNotification(Notification.NotificationType.PLAN_UPGRADED, user, null, null, null);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserByRole(String role ) throws IllegalArgumentException {
        return userRepository.findByRole(role).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    public Optional<User> getUserByEmail(String currentEmail) {
        return userRepository.findByEmail(currentEmail);
    }

}

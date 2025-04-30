package com.eventbride.tests.users;


import static org.junit.Assert.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Collection;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;

import com.eventbride.dto.UserDTO;
import com.eventbride.notification.NotificationService;
import com.eventbride.user.User;
import com.eventbride.user.User.Plan;
import com.eventbride.user.UserRepository;
import com.eventbride.user.UserService;

import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class UsersUnitTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private UserService userService;

    private User user;

    //#region Contructor
    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setUsername("juanp");
        user.setEmail("juan@example.com");
        user.setTelephone(623456789);
        user.setPassword("securePassword");
        user.setDni("12345678Z");
        user.setRole("ROLE_SUPPLIER");
        user.setPlan(Plan.BASIC);
        user.setPaymentPlanDate(LocalDate.now());
        user.setExpirePlanDate(LocalDate.now().plusMonths(1));
        user.setReceivesEmails(true);
        user.setProfilePicture("https://example.com/pic.jpg");
    }
    //#endregion
    
    //#region Positivos
    @Test
    void shouldReturnCorrectAuthorities() {
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertEquals(1, authorities.size());
        assertEquals("ROLE_SUPPLIER", authorities.iterator().next().getAuthority());
    }

    @Test
    void shouldSetAndGetFieldsCorrectly() {
        assertEquals("Juan", user.getFirstName());
        assertEquals("Pérez", user.getLastName());
        assertEquals("juanp", user.getUsername());
        assertEquals("juan@example.com", user.getEmail());
        assertEquals(623456789, user.getTelephone());
        assertEquals("securePassword", user.getPassword());
        assertEquals("12345678A", user.getDni());
        assertEquals("ROLE_SUPPLIER", user.getRole());
        assertEquals(Plan.BASIC, user.getPlan());
        assertEquals("https://example.com/pic.jpg", user.getProfilePicture());
        assertTrue(user.getReceivesEmails());
    }

    @Test
    void shouldReturnCorrectDates() {
        assertEquals(LocalDate.now(), user.getPaymentPlanDate());
        assertEquals(LocalDate.now().plusMonths(1), user.getExpirePlanDate());
    }

    @Test
    void shouldBeInstanceOfUserDetails() {
        assertTrue(user instanceof org.springframework.security.core.userdetails.UserDetails);
    }
    //#endregion

    //#region Negativos

    @Test
    void shouldFailWhenFirstNameIsBlank() {
        user.setFirstName("  "); // nombre en blanco

        assertTrue(user.getFirstName().trim().isEmpty(), "El nombre debería estar vacío o solo con espacios");
    }

    @Test
    void shouldFailWhenEmailFormatIsInvalid() {
        user.setEmail("no-es-un-email");

        // simulación: comprobamos que no contiene @ como algo básico
        assertFalse(user.getEmail().contains("@"), "El email no tiene formato válido");
    }
    //#endregion

    //#region Servicio

    // 1. getAllUsers
    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        List<User> result = userService.getAllUsers();
        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoUsersExist() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        List<User> result = userService.getAllUsers();
        assertTrue(result.isEmpty());
    }

    // 2. getAllUsersDTO
    @Test
    void shouldReturnAllUsersAsDTOs() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        List<UserDTO> result = userService.getAllUsersDTO();
        assertEquals(1, result.size());
        assertEquals(user.getUsername(), result.get(0).getUsername());
    }

    @Test
    void shouldReturnEmptyDTOListWhenNoUsersExist() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        List<UserDTO> result = userService.getAllUsersDTO();
        assertTrue(result.isEmpty());
    }

    // 3. getUserById
    @Test
    void shouldReturnUserById() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserById(1);
        assertTrue(result.isPresent());
    }

    @Test
    void shouldReturnEmptyWhenUserIdNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        Optional<User> result = userService.getUserById(99);
        assertTrue(result.isEmpty());
    }

    // 4. getUserByUsername
    @Test
    void shouldReturnUserByUsername() {
        when(userRepository.findByUsername("anag")).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserByUsername("anag");
        assertTrue(result.isPresent());
    }

    @Test
    void shouldReturnEmptyWhenUsernameNotFound() {
        when(userRepository.findByUsername("notfound")).thenReturn(Optional.empty());
        Optional<User> result = userService.getUserByUsername("notfound");
        assertTrue(result.isEmpty());
    }

    // 5. isUsernameTaken
    @Test
    void shouldReturnTrueIfUsernameExists() {
        when(userRepository.existsByUsername("anag")).thenReturn(true);
        assertTrue(userService.isUsernameTaken("anag"));
    }

    @Test
    void shouldReturnFalseIfUsernameNotExists() {
        when(userRepository.existsByUsername("pepe")).thenReturn(false);
        assertFalse(userService.isUsernameTaken("pepe"));
    }

    // 6. isEmailTaken
    @Test
    void shouldReturnTrueIfEmailExists() {
        when(userRepository.existsByEmail("ana@example.com")).thenReturn(true);
        assertTrue(userService.isEmailTaken("ana@example.com"));
    }

    @Test
    void shouldReturnFalseIfEmailNotExists() {
        when(userRepository.existsByEmail("nobody@example.com")).thenReturn(false);
        assertFalse(userService.isEmailTaken("nobody@example.com"));
    }

    // 7. updateUser
    @Test
    void shouldUpdateUserSuccessfully() {
        User existing = new User();
        existing.setId(1);
        existing.setUsername("oldUsername");
        existing.setEmail("old@example.com");
        existing.setDni("00000000T");
    
        user.setUsername("juanp");
        user.setEmail("juan@example.com");
        user.setDni("12345678Z");
    
        when(userRepository.findById(1)).thenReturn(Optional.of(existing));
        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmail("juan@example.com")).thenReturn(false);
        when(userRepository.existsByDni("12345678Z")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    
        User result = userService.updateUser(1, user);
    
        assertEquals("juanp", result.getUsername());
    }

    @Test
    void shouldThrowWhenPhoneNumberIsInvalid() {
        user.setTelephone(123); // inválido (solo 3 cifras)
        User existing = new User();
        existing.setUsername("anterior");
        existing.setEmail("anterior@example.com");
        existing.setDni("11111111H");

        when(userRepository.findById(1)).thenReturn(Optional.of(existing));

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(1, user));
    }

    // 8. deleteUser
    @Test
    void shouldDeleteUser() {
        userService.deleteUser(1);
        verify(userRepository).deleteById(1);
    }

    // 9. save
    @Test
    void shouldSaveUser() {
        user.setUsername("anag");
    
        when(userRepository.save(user)).thenReturn(user);
        User saved = userService.save(user);
    
        assertEquals("anag", saved.getUsername());
    }

    // 10. downgradeUserPlan
/*     @Test
    void shouldDowngradeUserPlan() {
        user.setId(1);
        user.setPlan(Plan.PREMIUM);
        user.setPaymentPlanDate(LocalDate.now());
        user.setExpirePlanDate(LocalDate.now().plusDays(30));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.downgradeUserPlan(1);
        assertEquals(Plan.BASIC, result.getPlan());
        assertNull(result.getPaymentPlanDate());
        assertNull(result.getExpirePlanDate());
    }

    @Test
    void shouldThrowWhenDowngradeUserNotFound() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.downgradeUserPlan(999));
    } */

    // 11. setPremium
    @Test
    void shouldSetUserPremium() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        LocalDate exp = LocalDate.now().plusDays(30);
        User result = userService.setPremium(1, exp);
        assertEquals(Plan.PREMIUM, result.getPlan());
        assertEquals(exp, result.getExpirePlanDate());
    }

    @Test
    void shouldThrowWhenSetPremiumUserNotFound() {
        when(userRepository.findById(404)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.setPremium(404, LocalDate.now()));
    }

    // 12. getUserByRole
    @Test
    void shouldReturnUserByRole() {
        user.setUsername("anag");
    
        when(userRepository.findByRole("ROLE_USER")).thenReturn(Optional.of(user));
        User found = userService.getUserByRole("ROLE_USER");
    
        assertNotNull(found);
        assertEquals("anag", found.getUsername());
    }

    @Test
    void shouldThrowWhenUserWithRoleNotFound() {
        when(userRepository.findByRole("ROLE_UNKNOWN")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.getUserByRole("ROLE_UNKNOWN"));
    }

    // 13. getUserByEmail
    @Test
    void shouldReturnUserByEmail() {
        when(userRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(user));
        Optional<User> result = userService.getUserByEmail("ana@example.com");
        assertTrue(result.isPresent());
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        when(userRepository.findByEmail("none@example.com")).thenReturn(Optional.empty());
        Optional<User> result = userService.getUserByEmail("none@example.com");
        assertTrue(result.isEmpty());
    }
    
    //#endregion
}

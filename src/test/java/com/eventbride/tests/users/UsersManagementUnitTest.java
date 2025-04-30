package com.eventbride.tests.users;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.config.jwt.services.UserManagementService;
import com.eventbride.dto.ReqRes;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UsersManagementUnitTest {

    @InjectMocks
    private UserManagementService userManagementService;

    @Mock
    private UserRepository userRepo;

    @Mock
    private JWTUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    private ReqRes registrationRequest;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setUsername("testuser");
        user.setPassword("Abc123456");
        user.setEmail("test@example.com");

        registrationRequest = new ReqRes();
        registrationRequest.setFirstName("Test");
        registrationRequest.setLastName("User");
        registrationRequest.setUsername("testuser");
        registrationRequest.setEmail("test@example.com");
        registrationRequest.setPassword("Abc123456");
        registrationRequest.setTelephone(623456789);
        registrationRequest.setDni("12345678Z");
        registrationRequest.setRole("USER");
        registrationRequest.setReceivesEmails(true);
    }

    //#region Servicio

    // 1.registro
    @Test
    void shouldRegisterUserSuccessfully() {
        user.setId(1);
        user.setReceivesEmails(true);
    
        when(passwordEncoder.encode("Abc123456")).thenReturn("encodedPassword");
        when(userRepo.save(any(User.class))).thenReturn(user);
    
        ReqRes response = userManagementService.register(registrationRequest);
    
        assertEquals(200, response.getStatusCode());
        assertEquals("Usuario guardado exitosamente", response.getMessage());
        assertNotNull(response.getUser());
    }
    

    @Test
    void shouldReturn400IfUserAlreadyExists() {
        when(passwordEncoder.encode("1234")).thenReturn("encodedPassword");
        when(userRepo.save(any(User.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate"));

        ReqRes response = userManagementService.register(registrationRequest);

        assertEquals(400, response.getStatusCode());
        assertEquals("El usuario con este nombre de usuario, correo electrónico y DNI ya existe.", response.getError());
    }

    // 2.login
    @Test
    void shouldLoginSuccessfully() {
        when(userRepo.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");
        when(jwtUtils.generateRefreshToken(any(HashMap.class), eq(user))).thenReturn("refresh-token");

        ReqRes loginReq = new ReqRes();
        loginReq.setUsername("testuser");
        loginReq.setPassword("1234");

        ReqRes response = userManagementService.login(loginReq);

        assertEquals(200, response.getStatusCode());
        assertEquals("Inicio de sesión exitoso", response.getMessage());
        assertEquals("jwt-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }

    @Test
    void shouldReturn500IfLoginFails() {
        ReqRes loginReq = new ReqRes();
        loginReq.setUsername("wrong");
        loginReq.setPassword("bad");

        when(authenticationManager.authenticate(any())).thenThrow(new RuntimeException("Invalid credentials"));

        ReqRes response = userManagementService.login(loginReq);

        assertEquals(500, response.getStatusCode());
        assertEquals("Invalid credentials", response.getMessage());
    }

    //#endregion
}

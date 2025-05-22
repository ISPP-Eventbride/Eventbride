package com.eventbride.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eventbride.user.User;
import com.eventbride.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // TODO: Arreglar el método login porque sólo devuelve un usuario cuando las
    // credenciales son correctas, pero no inicia sesión en la aplicación.

    @Autowired
    private UserService userService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> user = userService.getUserByUsername(request.getUsername());

        if (user.isPresent() && passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }
    }

    // POSIBLE MÉTODO QUE ARREGLA EL LOGIN
    // @PostMapping("/login")
    // public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // try {
    // Authentication authentication = authenticationManager.authenticate(
    // new UsernamePasswordAuthenticationToken(request.getUsername(),
    // request.getPassword()));
    // SecurityContextHolder.getContext().setAuthentication(authentication);
    // Optional<User> user = userService.getUserByUsername(request.getUsername());
    // return ResponseEntity.ok(user.get());
    // } catch (AuthenticationException e) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales
    // incorrectas");
    // }
    // }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Optional<User> user = userService.getUserByUsername(userDetails.getUsername());
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Verifica que el usuario esté autenticado y que no sea anónimo
        if (authentication != null &&
            authentication.isAuthenticated() &&
            authentication.getPrincipal() instanceof UserDetails) {
            return ResponseEntity.ok("Token válido");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido o expirado");
    }

}

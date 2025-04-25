package com.eventbride.config.jwt.services;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.dto.ReqRes;
import com.eventbride.dto.UserDTO;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ReqRes register(ReqRes registrationRequest) {
        ReqRes resp = new ReqRes();
        try {
            User user = new User();

            user.setFirstName(registrationRequest.getFirstName());
            user.setLastName(registrationRequest.getLastName());
            user.setUsername(registrationRequest.getUsername());
            user.setEmail(registrationRequest.getEmail());
            user.setTelephone(registrationRequest.getTelephone());
            user.setPaymentPlanDate(null);
            user.setExpirePlanDate(null);
            String plainPassword = registrationRequest.getPassword();
            if (plainPassword == null || !plainPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
                resp.setStatusCode(400);
                resp.setError("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
                return resp;
            }
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setDni(registrationRequest.getDni());

            if (registrationRequest.getProfilePicture() == null || registrationRequest.getProfilePicture().isBlank()) {
                user.setProfilePicture("https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg");
            }

            if ("SUPPLIER".equals(registrationRequest.getRole())) {
                user.setPlan(User.Plan.BASIC);
            } else {
                user.setPlan(null);
            }

            user.setReceivesEmails(registrationRequest.getReceivesEmails());
            user.setRole(registrationRequest.getRole());

            Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            if (!violations.isEmpty()) {
                String mensajeError = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining("; "));
                resp.setStatusCode(400);
                resp.setError(mensajeError);
                return resp;
            }

            User userResult = userRepo.save(user);
            if (userResult.getId() > 0) {
                resp.setUser(new UserDTO(userResult));
                resp.setMessage("Usuario guardado exitosamente");
                resp.setStatusCode(200);
            }

        } catch (DataIntegrityViolationException e) {
            resp.setStatusCode(400);
            resp.setError("El usuario con este nombre de usuario, correo electrónico y DNI ya existe.");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError("Ocurrió un error inesperado: " + e.getMessage());
        }

        return resp;
    }

    public ReqRes login(ReqRes loginRequest) {
        ReqRes response = new ReqRes();
        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                            loginRequest.getPassword()));
            var user = userRepo.findByUsername(loginRequest.getUsername()).orElseThrow();
            var jwt = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRole(user.getRole());
            response.setRefreshToken(refreshToken);
            response.setExpirationTime("24Hrs");
            response.setMessage("Inicio de sesión exitoso");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage(e.getMessage());
        }
        return response;
    }

    public ReqRes refreshToken(ReqRes refreshTokenReqiest) {
        ReqRes response = new ReqRes();
        try {
            String ourUsername = jwtUtils.extractUsername(refreshTokenReqiest.getToken());
            User user = userRepo.findByUsername(ourUsername).orElseThrow();
            if (jwtUtils.isTokenValid(refreshTokenReqiest.getToken(), user)) {
                var jwt = jwtUtils.generateToken(user);
                response.setStatusCode(200);
                response.setToken(jwt);
                response.setRefreshToken(refreshTokenReqiest.getToken());
                response.setExpirationTime("24Hr");
                response.setMessage("Token actualizado exitosamente");
            }
            response.setStatusCode(200);
            return response;

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage(e.getMessage());
            return response;
        }
    }

    public ReqRes deleteUser(Integer userId) {
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> userOptional = userRepo.findById(userId);
            if (userOptional.isPresent()) {
                userRepo.deleteById(userId);
                reqRes.setStatusCode(200);
                reqRes.setMessage("Usuario eliminado exitosamente");
            } else {
                reqRes.setStatusCode(404);
                reqRes.setMessage("Usuario no encontrado para eliminación");
            }
        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setMessage("Ocurrió un error al eliminar el usuario: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes updateUser(Integer userId, User updatedUser) {
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> userOptional = userRepo.findById(userId);
            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();
                existingUser.setFirstName(updatedUser.getFirstName());
                existingUser.setLastName(updatedUser.getLastName());
                existingUser.setUsername(updatedUser.getUsername());
                existingUser.setEmail(updatedUser.getEmail());
                existingUser.setTelephone(updatedUser.getTelephone());

                existingUser.setDni(updatedUser.getDni());
                existingUser.setProfilePicture(updatedUser.getProfilePicture());
                existingUser.setRole(updatedUser.getRole());

                // Check if password is present in the request
                if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                    // Encode the password and update it
                    existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                }

                User savedUser = userRepo.save(existingUser);
                reqRes.setUser(new UserDTO(savedUser));
                reqRes.setStatusCode(200);
                reqRes.setMessage("Usuario actualizado exitosamente");
            } else {
                reqRes.setStatusCode(404);
                reqRes.setMessage("Usuario no encontrado para actualización");
            }
        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setMessage("Ocurrió un error al actualizar el usuario: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes getMyInfo(String username) {
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> userOptional = userRepo.findByUsername(username);
            if (userOptional.isPresent()) {
                reqRes.setUser(new UserDTO(userOptional.get()));
                reqRes.setStatusCode(200);
                reqRes.setMessage("successful");
            } else {
                reqRes.setStatusCode(404);
                reqRes.setMessage("Usuario no encontrado para actualización");
            }

        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setMessage("Ocurrió un error al obtener la información del usuario: " + e.getMessage());
        }
        return reqRes;

    }

    public String generateToken(User user) {
        return jwtUtils.generateToken(user);
    }
}

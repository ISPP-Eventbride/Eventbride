package com.eventbride.dto.publics;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.eventbride.user.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPublicDTO {
    private Integer id;
    private String lastName;
    private String firstName;
    private String username;
    private String email;
    private Integer telephone;
    private String profilePicture;

    // Constructor que toma la entidad User y la convierte a DTO
    public UserPublicDTO(User user) {
        this.id = user.getId();
        this.lastName = user.getLastName();
        this.firstName = user.getFirstName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.telephone = user.getTelephone();
        this.profilePicture = user.getProfilePicture();
    }

    // Método estático para convertir una lista de usuarios en una lista de DTOs
    public static List<UserPublicDTO> fromEntities(List<User> users) {
        return users.stream()
                .map(UserPublicDTO::new)
                .collect(Collectors.toList());
    }
}


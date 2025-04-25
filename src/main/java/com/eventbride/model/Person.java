package com.eventbride.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class Person extends BaseEntity {

    @Column(name = "first_name", nullable = false)
    @NotBlank 
	@Size(min = 1, max = 40)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotBlank 
	@Size(min = 1, max = 40)
    private String lastName;

    @Column(name = "username", nullable = false, unique = true)
    @NotBlank
	@Size(min = 1, max = 50)
    private String username;

	@Column(name = "email", nullable = false, unique = true)
    @NotBlank
	@Email
    private String email;

	@Column(name = "telephone", nullable = false)
    @NotNull(message = "El teléfono no puede ser nulo")
    @Min(value = 600000000, message = "El número de teléfono debe comenzar por 6, 7, 8 o 9 y tener 9 dígitos")
    @Max(value = 999999999, message = "El número de teléfono debe tener 9 dígitos")
    private Integer telephone;

    @Column(name = "password", nullable = false)
    @NotBlank
    private String password;

}

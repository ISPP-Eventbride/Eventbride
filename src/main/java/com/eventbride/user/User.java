package com.eventbride.user;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.hibernate.validator.constraints.URL;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.eventbride.model.Person;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends Person implements UserDetails {
    @Column(name = "dni", nullable = false, unique = false)
    @NotBlank
    @Size(min = 1, max = 9)
    private String dni;

    @Column(name = "profile_picture", nullable = true)
    @Size(max = 50000)
    private String profilePicture;

    @Column(name = "role", nullable = false)
    @NotBlank
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = true)
    private Plan plan;

    public enum Plan {
        BASIC,
        PREMIUM
    }

    @Column(name = "payment_plan_date", nullable = true)
    private LocalDate paymentPlanDate;

    @Column(name = "expire_plan_date", nullable = true)
    private LocalDate expirePlanDate;

    @Column(name = "receives_emails", nullable = false)
    private Boolean receivesEmails;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }
}

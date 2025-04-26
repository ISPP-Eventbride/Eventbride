package com.eventbride.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findById(Integer id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByRole(String role);

    boolean existsByUsername(String username);

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);

	Optional<User> findByChangePasswordToken(String changePasswordToken);
}

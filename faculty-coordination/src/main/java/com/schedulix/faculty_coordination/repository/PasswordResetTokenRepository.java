package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Find the token record by user's email
    Optional<PasswordResetToken> findByUserEmail(String userEmail);

    // Find the record by the token value (used for verification)
    Optional<PasswordResetToken> findByToken(String token);
}
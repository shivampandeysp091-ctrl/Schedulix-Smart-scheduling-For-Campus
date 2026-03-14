package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Department; // Added
import com.schedulix.faculty_coordination.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Finds all users with a given role (e.g., "ROLE_FACULTY", "ROLE_ADMIN")
    List<User> findByRole(String role);

    // --- NEW METHOD FOR ROLE-BASED FILTERING ---
    // Yeh method humein Department Admin ke liye specific users dikhane mein help karega
    List<User> findByDepartment(Department department);
}
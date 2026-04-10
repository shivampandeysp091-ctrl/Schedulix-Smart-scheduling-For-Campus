package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Filter by college
    List<User> findByCollegeId(UUID collegeId);

    // Finds all users with a given role within a college
    List<User> findByCollegeIdAndRole(UUID collegeId, String role);

    // Limit Check
    long countByCollegeIdAndRole(UUID collegeId, String role);

    // Find users by department within a college
    List<User> findByCollegeIdAndDepartment(UUID collegeId, Department department);
}
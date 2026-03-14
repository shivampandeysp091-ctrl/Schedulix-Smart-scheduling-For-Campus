package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // Department ke naam se search karne ke liye helper method
    Optional<Department> findByName(String name);
}
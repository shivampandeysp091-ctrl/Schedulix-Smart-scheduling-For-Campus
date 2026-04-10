package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCollegeIdAndName(UUID collegeId, String name);
    
    List<Department> findByCollegeId(UUID collegeId);
}
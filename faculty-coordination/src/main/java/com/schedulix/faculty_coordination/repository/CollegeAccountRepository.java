package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.CollegeAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CollegeAccountRepository extends JpaRepository<CollegeAccount, UUID> {
    
}

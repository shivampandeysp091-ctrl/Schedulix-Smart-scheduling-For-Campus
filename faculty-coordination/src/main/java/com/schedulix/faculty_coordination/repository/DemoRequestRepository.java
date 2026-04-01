package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.DemoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {
}

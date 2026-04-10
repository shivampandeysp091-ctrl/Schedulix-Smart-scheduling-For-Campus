package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    // Filter by college id
    List<Announcement> findByCollegeIdOrderByCreatedAtDesc(UUID collegeId);
}

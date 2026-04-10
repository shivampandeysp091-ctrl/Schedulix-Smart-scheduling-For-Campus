package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCollegeIdAndUserIdAndIsReadOrderByCreatedAtDesc(UUID collegeId, Long userId, boolean isRead);

    List<Notification> findByCollegeIdAndUserIdOrderByCreatedAtDesc(UUID collegeId, Long userId);

    long countByCollegeIdAndUserIdAndIsRead(UUID collegeId, Long userId, boolean isRead);
}
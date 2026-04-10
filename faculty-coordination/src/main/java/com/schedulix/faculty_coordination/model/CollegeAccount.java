package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "college_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollegeAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String collegeName;

    @Column(length = 50)
    private String planTier = "demo"; // e.g., 'demo', 'department_pro', 'institution'

    @Column(length = 50)
    private String status = "demo"; // e.g., 'demo', 'active', 'suspended', 'expired'

    private Integer activeUsers = 0;
    
    private Integer maxAdmins = 2; // Principle -> HOD
    
    private Integer maxFaculty = 5;
    
    private Integer maxStudents = 20;

    @Column(length = 50)
    private String paymentStatus = "unpaid"; // e.g., 'unpaid', 'paid'

    private LocalDateTime demoExpiresAt;
    
    private LocalDateTime subscriptionStartedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime lastActiveAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.demoExpiresAt == null) {
            this.demoExpiresAt = LocalDateTime.now().plusDays(15);
        }
    }
}

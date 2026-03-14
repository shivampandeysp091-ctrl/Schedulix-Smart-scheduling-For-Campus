package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // Jaise: IT, Comps, AI/ML, etc.

    @Column(nullable = false)
    private String themeColor; // Hex code: Jaise #3b82f6 (Blue) ya #10b981 (Green)

    // Helper constructor specifically for setup
    public Department(String name, String themeColor) {
        this.name = name;
        this.themeColor = themeColor;
    }
}
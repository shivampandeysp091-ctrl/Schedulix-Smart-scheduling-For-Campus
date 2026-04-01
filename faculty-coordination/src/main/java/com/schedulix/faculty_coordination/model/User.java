package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ROLE_ADMIN, ROLE_STUDENT, ROLE_FACULTY

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 512)
    private String profileImageUrl;

    @Column(length = 100)
    private String fullName;

    // --- SABSE ZAROORI CHANGE ---
    // Yahan 'String department' bilkul nahi hona chahiye.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 255)
    private String subjects;

    @Column(length = 255)
    private String designation;

    @Column(length = 100)
    private String officeLocation;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean isFirstLogin = true;

    private java.time.LocalDateTime expiresAt;

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null) return Collections.emptyList();
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    @Override
    public String getUsername() { return this.username; }

    @Override
    public boolean isAccountNonExpired() { 
        if (expiresAt == null) return true;
        return java.time.LocalDateTime.now().isBefore(expiresAt);
    }

    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
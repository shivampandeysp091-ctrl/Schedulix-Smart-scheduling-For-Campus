package com.schedulix.faculty_coordination.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String role;
    private String profileImageUrl;
    private String fullName;

    // Ise String hi rehne dein, lekin hum isme dept.getName() store karenge
    private String department;

    private String subjects;
    private String currentStatus;
    private String currentLocation;

    // Ek naya field theme color ke liye (Optional but helpful for your UI)
    private String themeColor;

    private String designation;
}
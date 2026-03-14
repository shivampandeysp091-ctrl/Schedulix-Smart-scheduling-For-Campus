package com.schedulix.faculty_coordination.dto;

import lombok.Data;

// YEH ZAROORI BADLAAV HAI
@Data // Yeh annotation getUsername(), getPassword(), aur getRole() jaise saare methods apne aap bana dega.
public class AuthRequest {
    private String username;
    private String password;
    private String role;
}

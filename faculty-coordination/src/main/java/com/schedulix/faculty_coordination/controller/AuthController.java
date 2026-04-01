package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.AuthRequest;
import com.schedulix.faculty_coordination.dto.AuthResponse;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.UserRepository;
import com.schedulix.faculty_coordination.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.schedulix.faculty_coordination.service.PasswordResetService;

import java.util.Map; // Map ke liye import

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user (Student or Faculty) including Security Questions.
     * Uses Map<String, String> to accept all fields from frontend.
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser
    (@RequestBody Map<String, String> payload) {

        // Data extract karein
        String username = payload.get("username");
        String password = payload.get("password");
        String email=payload.get("email");
        String role = payload.get("role");

        // Basic validation


        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken!");
        }

        // Context se current user nikalein
        Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only authorized Admins can register new users.");
        }
        
        // Find role of the caller
        String currentRole = auth.getAuthorities().iterator().next().getAuthority();
        if (!currentRole.equals("ROLE_ADMIN") && !currentRole.equals("ROLE_SUPERADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins or Superadmins can register new users.");
        }

        // Role prefix check (Backend mein hamesha "ROLE_" add karein)
        String roleToSave = role.trim().toUpperCase();
        if (!roleToSave.startsWith("ROLE_")) {
            roleToSave = "ROLE_" + roleToSave;
        }

        if (!roleToSave.equals("ROLE_STUDENT") && !roleToSave.equals("ROLE_FACULTY")) {
            return ResponseEntity.badRequest().body("Invalid role. Must be STUDENT or FACULTY.");
        }

        // Naya user banayein
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(roleToSave);

        // Security questions save karein

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    /**
     * Authenticates a user and returns a JWT token.
     * Uses AuthRequest DTO for login.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            // Authentication attempt
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            // If authentication is successful
            if (authentication.isAuthenticated()) {
                // User details fetch karein (principal se)
                User userDetails = (User) authentication.getPrincipal();

                // FORCE PASSWORD RESET CHECK
                if (userDetails.isFirstLogin()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "First login detected. Password reset required.", "requirePasswordReset", true, "username", userDetails.getUsername()));
                }

                String role = userDetails.getRole(); // Role DB se lein (e.g., "ROLE_FACULTY")

                // Token generate karein
                String token = jwtUtil.generateToken(authRequest.getUsername(), role);
                return ResponseEntity.ok(new AuthResponse(token)); // Token return karein
            } else {
                throw new UsernameNotFoundException("Invalid credentials for user: " + authRequest.getUsername());
            }
        } catch (Exception e) {
            // Galat credentials ya doosre issues
            System.err.println("Login Failed for user: " + authRequest.getUsername() + ". Reason: " + e.getMessage());
            e.printStackTrace();
             if (e.getMessage() != null && e.getMessage().toLowerCase().contains("expired")) {
                 return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Account expired");
             }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password. Reason: " + e.getMessage());
        }
    }
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        passwordResetService.generateAndSendToken(email);
        return ResponseEntity.ok().body("Verification code sent to email.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        passwordResetService.validateOtp(email, code);
        return ResponseEntity.ok().body("Code verified successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        passwordResetService.resetPassword(email, newPassword);
        return ResponseEntity.ok().body("Password reset successful. Please log in.");
    }

    /**
     * Endpoint specifically for setting the permanent password on first login
     */
    @PostMapping("/first-login-reset")
    public ResponseEntity<?> firstLoginReset(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String currentDummyPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        try {
            // Re-authenticate to prove they know the dummy password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, currentDummyPassword)
            );

            if (authentication.isAuthenticated()) {
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setFirstLogin(false); // Flag false, user is now fully active
                userRepository.save(user);

                return ResponseEntity.ok(Map.of("message", "Password changed successfully! You can now log in."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials or reset failed.");
        }
        return ResponseEntity.badRequest().build();
    }
}
package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.DepartmentRepository;
import com.schedulix.faculty_coordination.repository.UserRepository;
import com.schedulix.faculty_coordination.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Added
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN') or hasRole('ROLE_PRINCIPAL')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private com.schedulix.faculty_coordination.repository.DemoRequestRepository demoRequestRepository;

    @Autowired
    private com.schedulix.faculty_coordination.repository.CollegeAccountRepository collegeAccountRepository;

    // 1. Create User (Superadmin ya Dept Admin naye log add kar sakte hain)
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request, @AuthenticationPrincipal User currentUser) {
        try {
            UUID targetCollegeId = currentUser.getCollegeId();
            
            // If caller has no collegeId (like Superadmin), look for it in request
            if (targetCollegeId == null && request.containsKey("collegeId") && !request.get("collegeId").trim().isEmpty()) {
                targetCollegeId = UUID.fromString(request.get("collegeId").trim());
            }

            if (targetCollegeId == null) {
                return ResponseEntity.badRequest().body("Error: College ID is missing. Superadmins must provide a valid College ID.");
            }

            User newUser = adminService.createNewUser(
                    request.get("email"),
                    request.get("fullName"),
                    request.get("role"),
                    request.get("departmentName"),
                    request.get("username"),
                    targetCollegeId
            );
            return ResponseEntity.ok("User created successfully and email sent! ID: " + newUser.getUsername());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // New Endpoint for fetching departments for Admin
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(departmentRepository.findByCollegeId(currentUser.getCollegeId()));
    }

    // 2. Hybrid Password Reset
    @PostMapping("/reset-password/{userId}")
    public ResponseEntity<?> resetPassword(@PathVariable Long userId) {
        try {
            adminService.resetUserPassword(userId);
            return ResponseEntity.ok("Password reset successful. New password sent to user's email.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // New Endpoint: Approve Demo Sandbox
    @PostMapping("/demo/approve/{requestId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> approveDemoRequest(@PathVariable Long requestId) {
        try {
            adminService.approveAndSeedDemo(requestId);
            return ResponseEntity.ok("Demo sandbox provisioned successfully! Credentials sent to requested email.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing demo request: " + e.getMessage());
        }
    }

    // New Endpoint: Deny Demo Sandbox
    @PostMapping("/demo/deny/{requestId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> denyDemoRequest(@PathVariable Long requestId) {
        try {
            adminService.denyDemoRequest(requestId);
            return ResponseEntity.ok("Demo request denied successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error denying demo request: " + e.getMessage());
        }
    }

    // New Endpoint: Get all Demo Requests
    @GetMapping("/demo/requests")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<com.schedulix.faculty_coordination.model.DemoRequest>> getAllDemoRequests() {
        return ResponseEntity.ok(demoRequestRepository.findAll());
    }

    // New Endpoint: Get all college accounts (Platform Owner)
    @GetMapping("/colleges")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<com.schedulix.faculty_coordination.model.CollegeAccount>> getAllColleges() {
        return ResponseEntity.ok(collegeAccountRepository.findAll());
    }

    // 3. UPGRADED: Role-Based User List Fetching
    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal User currentUser) {
        try {
            // Case A: Agar login karne wala "superadmin" hai
            if (currentUser.getUsername().equals("superadmin")) {
                return ResponseEntity.ok(userRepository.findAll());
            }

            // Case B: Agar login karne wala kisi specific department ka ROLE_ADMIN ya ROLE_PRINCIPAL hai
            if ("ROLE_ADMIN".equals(currentUser.getRole()) || "ROLE_PRINCIPAL".equals(currentUser.getRole())) {
                // Return all users inside this Admin's or Principal's college.
                return ResponseEntity.ok(userRepository.findByCollegeId(currentUser.getCollegeId()));
            }

            return ResponseEntity.status(403).build(); // Dusron ke liye Forbidden
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 4. Delete user
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 5. Dynamic Theme Update
    @PatchMapping("/department/update-theme")
    public ResponseEntity<?> updateDepartmentTheme(@RequestBody Map<String, String> payload, @AuthenticationPrincipal User currentUser) {
        try {
            String deptName = payload.get("departmentName");
            String newColor = payload.get("themeColor");

            Department dept = departmentRepository.findByCollegeIdAndName(currentUser.getCollegeId(), deptName)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + deptName));

            dept.setThemeColor(newColor);
            departmentRepository.save(dept);

            return ResponseEntity.ok("Theme updated successfully for " + deptName);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Theme Update Error: " + e.getMessage());
        }
    }
}
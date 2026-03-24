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

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // 1. Create User (Superadmin ya Dept Admin naye log add kar sakte hain)
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        try {
            User newUser = adminService.createNewUser(
                    request.get("email"),
                    request.get("fullName"),
                    request.get("role"),
                    request.get("departmentName"),
                    request.get("collegeId")
            );
            return ResponseEntity.ok("User created successfully and email sent! ID: " + newUser.getUsername());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // New Endpoint for fetching departments for Superadmin/Admin
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
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

    // 3. UPGRADED: Role-Based User List Fetching
    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal User currentUser) {
        try {
            // Case A: Agar login karne wala "superadmin" hai
            if (currentUser.getUsername().equals("superadmin")) {
                return ResponseEntity.ok(userRepository.findAll());
            }

            // Case B: Agar login karne wala kisi specific department ka ROLE_ADMIN hai
            if ("ROLE_ADMIN".equals(currentUser.getRole())) {
                // Sirf wahi users dikhao jo is admin ke department ke hain
                return ResponseEntity.ok(userRepository.findByDepartment(currentUser.getDepartment()));
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
    public ResponseEntity<?> updateDepartmentTheme(@RequestBody Map<String, String> payload) {
        try {
            String deptName = payload.get("departmentName");
            String newColor = payload.get("themeColor");

            Department dept = departmentRepository.findByName(deptName)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + deptName));

            dept.setThemeColor(newColor);
            departmentRepository.save(dept);

            return ResponseEntity.ok("Theme updated successfully for " + deptName);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Theme Update Error: " + e.getMessage());
        }
    }
}
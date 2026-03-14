package com.schedulix.faculty_coordination.config;

import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.DepartmentRepository;
import com.schedulix.faculty_coordination.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // --- 1. Create a Default Superadmin if it doesn't exist ---
        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User superadmin = new User();
            superadmin.setUsername("superadmin");
            superadmin.setEmail("superadmin@schedulix.com");
            superadmin.setFullName("System Superadmin");
            superadmin.setRole("ROLE_SUPERADMIN");
            superadmin.setPassword(passwordEncoder.encode("SuperAdmin@123")); // Default password
            userRepository.save(superadmin);
            System.out.println("✅ Default Superadmin created: superadmin / SuperAdmin@123");
        }

        // --- 2. Create a default Department and an Admin (HOD) if they don't exist ---
        Department defaultDept = departmentRepository.findByName("Computer Science")
                .orElseGet(() -> {
                    Department newDept = new Department("Computer Science", "#3b82f6");
                    return departmentRepository.save(newDept);
                });

        if (userRepository.findByUsername("admin_cs").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin_cs");
            admin.setEmail("admin.cs@schedulix.com");
            admin.setFullName("CS Department Head");
            admin.setRole("ROLE_ADMIN");
            admin.setDepartment(defaultDept);
            admin.setPassword(passwordEncoder.encode("AdminCS@123")); // Default password
            userRepository.save(admin);
            System.out.println("✅ Default Admin created: admin_cs / AdminCS@123");
        }
    }
}

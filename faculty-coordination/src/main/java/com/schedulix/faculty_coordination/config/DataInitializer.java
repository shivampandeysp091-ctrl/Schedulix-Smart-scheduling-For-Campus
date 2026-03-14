package com.schedulix.faculty_coordination.config;

import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.DepartmentRepository;
import com.schedulix.faculty_coordination.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0) {
            List<Department> depts = Arrays.asList(
                    new Department("IT", "#3b82f6"),
                    new Department("Comps", "#8b5cf6"),
                    new Department("AI/ML", "#10b981"),
                    new Department("Civil", "#f59e0b"),
                    new Department("Mechanical", "#ef4444"),
                    new Department("DS", "#06b6d4")
            );
            departmentRepository.saveAll(depts);
            System.out.println(">> Departments initialized successfully!");
        }

        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User admin = new User();
            admin.setUsername("superadmin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@schedulix.com");
            admin.setFullName("System Administrator");
            admin.setRole("ROLE_ADMIN");

            // Department fetch karke object pass karna (String nahi)
            Department itDept = departmentRepository.findByName("IT").orElse(null);
            admin.setDepartment(itDept);

            userRepository.save(admin);
            System.out.println(">> Super Admin created: superadmin / admin123");
        }
    }
}
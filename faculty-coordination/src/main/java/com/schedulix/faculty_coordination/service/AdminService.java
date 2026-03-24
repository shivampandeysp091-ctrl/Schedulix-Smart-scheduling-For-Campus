package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.DepartmentRepository;
import com.schedulix.faculty_coordination.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JavaMailSender mailSender;

    public User createNewUser(String email, String fullName, String role, String deptName, String customCollegeId) {
        // 1. Department Object fetch karein
        Department dept = departmentRepository.findByName(deptName)
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(deptName);
                    // generate a random theme color or default
                    newDept.setThemeColor("#3b82f6");
                    return departmentRepository.save(newDept);
                });

        String collegeId;
        // Use custom ID if provided, otherwise generate random 8 digit
        if (customCollegeId != null && !customCollegeId.trim().isEmpty()) {
            if (userRepository.findByUsername(customCollegeId).isPresent()) {
                throw new RuntimeException("College ID " + customCollegeId + " is already in use.");
            }
            collegeId = customCollegeId.trim();
        } else {
            // Generate 8-digit College ID
            collegeId = String.format("%08d", new java.util.Random().nextInt(100000000));
            // Ensure username is unique
            while(userRepository.findByUsername(collegeId).isPresent()) {
                collegeId = String.format("%08d", new java.util.Random().nextInt(100000000));
            }
        }

        // Generate Dummy Password
        String tempPassword = "Welcome@" + collegeId;

        User newUser = new User();
        newUser.setUsername(collegeId);
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setRole(role);
        newUser.setDepartment(dept);
        newUser.setPassword(passwordEncoder.encode(tempPassword));
        newUser.setFirstLogin(true); // Flag for forced password reset

        User savedUser = userRepository.save(newUser);

        sendEmail(email, "Welcome to Schedulix - Your Account Details",
                "Hello " + fullName + ",\n\n" +
                "Your account for Schedulix has been created by your department admin.\n\n" +
                "Here are your login details:\n" +
                "College ID (Username): " + collegeId + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "You will be required to change this password when you log in for the first time.\n\n" +
                "Regards,\nSchedulix Team");

        return savedUser;
    }

    public void resetUserPassword(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String newTempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(newTempPassword));
        userRepository.save(user);

        sendEmail(user.getEmail(), "Schedulix Password Reset", "New Temp Password: " + newTempPassword);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
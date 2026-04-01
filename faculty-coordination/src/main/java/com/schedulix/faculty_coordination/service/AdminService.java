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
    @Autowired private com.schedulix.faculty_coordination.repository.DemoRequestRepository demoRequestRepository;

    public void approveAndSeedDemo(Long requestId) {
        com.schedulix.faculty_coordination.model.DemoRequest demoReq = demoRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demo Request Not Found"));

        if (!"PENDING".equalsIgnoreCase(demoReq.getStatus())) {
            throw new RuntimeException("Request is already processed.");
        }

        // 1. Create or retrieve department
        Department dept = departmentRepository.findByName(demoReq.getDepartment())
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(demoReq.getDepartment());
                    newDept.setThemeColor("#3b82f6");
                    return departmentRepository.save(newDept);
                });

        java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusDays(14);
        
        // 2. Create HOD Admin
        String hodUsername = "HOD-" + demoReq.getCollegeName().replaceAll("\\s+", "").substring(0, Math.min(5, demoReq.getCollegeName().length())).toUpperCase() + "-" + new java.util.Random().nextInt(1000);
        String tempPass = "Demo@Admin123";
        User hod = new User();
        hod.setUsername(hodUsername);
        hod.setEmail(demoReq.getEmail());
        hod.setFullName(demoReq.getHodName());
        hod.setRole("ROLE_ADMIN");
        hod.setDepartment(dept);
        hod.setPassword(passwordEncoder.encode(tempPass));
        hod.setFirstLogin(false);
        hod.setExpiresAt(expiry);
        userRepository.save(hod);

        // 3. Create 5 Faculty
        for (int i=1; i<=5; i++) {
            User faculty = new User();
            faculty.setUsername(hodUsername + "-FAC" + i);
            faculty.setEmail("faculty" + i + "@" + demoReq.getCollegeName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase() + ".edu");
            faculty.setFullName("Demo Faculty " + i);
            faculty.setRole("ROLE_FACULTY");
            faculty.setDepartment(dept);
            faculty.setPassword(passwordEncoder.encode("Demo@123"));
            faculty.setFirstLogin(false);
            faculty.setExpiresAt(expiry);
            userRepository.save(faculty);
        }

        // 4. Create 20 Students
        for (int i=1; i<=20; i++) {
            User student = new User();
            student.setUsername(hodUsername + "-STU" + i);
            student.setEmail("student" + i + "@" + demoReq.getCollegeName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase() + ".edu");
            student.setFullName("Demo Student " + i);
            student.setRole("ROLE_STUDENT");
            student.setDepartment(dept);
            student.setPassword(passwordEncoder.encode("Demo@123"));
            student.setFirstLogin(false);
            student.setExpiresAt(expiry);
            userRepository.save(student);
        }

        // 5. Update Request Status
        demoReq.setStatus("APPROVED");
        demoRequestRepository.save(demoReq);

        // 6. Send Email to HOD
        sendEmail(demoReq.getEmail(), "Your Schedulix Demo is Ready!",
            "Hello " + demoReq.getHodName() + ",\n\n" +
            "Your 14-day demo environment is fully provisioned and ready for testing!\n\n" +
            "Login URL: http://localhost:5173/auth\n" +
            "HOD Username: " + hodUsername + "\n" +
            "HOD Password: " + tempPass + "\n\n" +
            "We have also seeded 5 Faculty accounts (" + hodUsername + "-FAC1 to -FAC5) " +
            "and 20 Student accounts (" + hodUsername + "-STU1 to -STU20) so you can test all roles.\n" +
            "Password for all sample users: Demo@123\n\n" +
            "This demo sandbox will automatically expire in 14 days.\n\n" +
            "Welcome to the future of Campus Scheduling!\nSchedulix Team"
        );
    }

    public void denyDemoRequest(Long requestId) {
        com.schedulix.faculty_coordination.model.DemoRequest demoReq = demoRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demo Request Not Found"));

        if (!"PENDING".equalsIgnoreCase(demoReq.getStatus())) {
            throw new RuntimeException("Request is already processed.");
        }

        demoReq.setStatus("DENIED");
        demoRequestRepository.save(demoReq);

        sendEmail(demoReq.getEmail(), "Update on your Schedulix Demo Request",
            "Hello " + demoReq.getHodName() + ",\n\n" +
            "Thank you for your interest in Schedulix for " + demoReq.getCollegeName() + ".\n\n" +
            "Unfortunately, we are unable to approve your demo request at this time. If you have any questions or believe this is an error, please reply to this email.\n\n" +
            "Regards,\nSchedulix Team"
        );
    }

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
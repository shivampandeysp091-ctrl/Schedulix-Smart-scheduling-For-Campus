package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.CollegeAccount;
import com.schedulix.faculty_coordination.model.Department;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.CollegeAccountRepository;
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
    @Autowired private CollegeAccountRepository collegeAccountRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JavaMailSender mailSender;
    @Autowired private com.schedulix.faculty_coordination.repository.DemoRequestRepository demoRequestRepository;

    public void approveAndSeedDemo(Long requestId) {
        com.schedulix.faculty_coordination.model.DemoRequest demoReq = demoRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demo Request Not Found"));

        if (!"PENDING".equalsIgnoreCase(demoReq.getStatus())) {
            throw new RuntimeException("Request is already processed.");
        }

        // 1. Create the Isolated College Account Metadata
        CollegeAccount college = new CollegeAccount();
        college.setCollegeName(demoReq.getCollegeName());
        college.setPlanTier("demo");
        college.setStatus("demo");
        college.setPaymentStatus("unpaid");
        college.setMaxFaculty(5);
        college.setMaxStudents(20);
        college = collegeAccountRepository.save(college);

        final UUID cid = college.getId();

        java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusDays(14);
        
        // 3. Create Principal Account
        String principalUsername = "PRINCIPAL-" + demoReq.getCollegeName().replaceAll("\\s+", "").substring(0, Math.min(5, demoReq.getCollegeName().length())).toUpperCase() + "-" + new java.util.Random().nextInt(1000);
        String tempPass = "Demo@Admin123";
        User principal = new User();
        principal.setCollegeId(cid);
        principal.setUsername(principalUsername);
        principal.setEmail(demoReq.getEmail());
        principal.setFullName(demoReq.getHodName());
        principal.setRole("ROLE_PRINCIPAL"); // Replaced ROLE_ADMIN with ROLE_PRINCIPAL
        principal.setDepartment(null); // Principal has no specific department
        principal.setPassword(passwordEncoder.encode(tempPass));
        principal.setFirstLogin(false);
        principal.setExpiresAt(expiry);
        userRepository.save(principal);

        // 4. Update Request Status
        demoReq.setStatus("APPROVED");
        demoRequestRepository.save(demoReq);

        // 5. Send Email to HOD
        sendEmail(demoReq.getEmail(), "Your Schedulix Demo is Ready!",
            "Hello " + demoReq.getHodName() + ",\n\n" +
            "Your 14-day demo environment is fully provisioned and ready for testing!\n\n" +
            "Login URL: http://localhost:5173/auth\n" +
            "Principal Username: " + principalUsername + "\n" +
            "Password: " + tempPass + "\n\n" +
            "From your Principal dashboard, you can create up to 2 Departments (HOD Admins) for free. Then your HODs can create Faculty and Students.\n" +
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

    public User createNewUser(String email, String fullName, String role, String deptName, String customUsername, UUID collegeId) {
        // Limit Checks based on college details
        CollegeAccount college = collegeAccountRepository.findById(collegeId)
                .orElseThrow(() -> new RuntimeException("College account not found for isolation."));

        if ("ROLE_ADMIN".equals(role)) {
            long currentAdmins = userRepository.countByCollegeIdAndRole(collegeId, "ROLE_ADMIN");
            if (currentAdmins >= college.getMaxAdmins()) {
                throw new RuntimeException("Demo limit reached: maximum " + college.getMaxAdmins() + " departments allowed. Upgrade to add more.");
            }
        }
        if ("ROLE_FACULTY".equals(role)) {
            long currentFaculty = userRepository.countByCollegeIdAndRole(collegeId, "ROLE_FACULTY");
            if (currentFaculty >= college.getMaxFaculty()) {
                throw new RuntimeException("Demo limit reached: maximum " + college.getMaxFaculty() + " faculty allowed. Upgrade to add more.");
            }
        }
        if ("ROLE_STUDENT".equals(role)) {
            long currentStudents = userRepository.countByCollegeIdAndRole(collegeId, "ROLE_STUDENT");
            if (currentStudents >= college.getMaxStudents()) {
                throw new RuntimeException("Demo limit reached: maximum " + college.getMaxStudents() + " students allowed. Upgrade to add more.");
            }
        }

        // 1. Department Object fetch karein within college isolation scope
        Department dept = departmentRepository.findByCollegeIdAndName(collegeId, deptName)
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setCollegeId(collegeId);
                    newDept.setName(deptName);
                    newDept.setThemeColor("#3b82f6");
                    return departmentRepository.save(newDept);
                });

        String finalUsername;
        if (customUsername != null && !customUsername.trim().isEmpty()) {
            if (userRepository.findByUsername(customUsername).isPresent()) {
                throw new RuntimeException("Username " + customUsername + " is already in use.");
            }
            finalUsername = customUsername.trim();
        } else {
            finalUsername = String.format("%08d", new java.util.Random().nextInt(100000000));
            while(userRepository.findByUsername(finalUsername).isPresent()) {
                finalUsername = String.format("%08d", new java.util.Random().nextInt(100000000));
            }
        }

        String tempPassword = "Welcome@" + finalUsername;

        User newUser = new User();
        newUser.setCollegeId(collegeId);
        newUser.setUsername(finalUsername);
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setRole(role);
        newUser.setDepartment(dept);
        newUser.setPassword(passwordEncoder.encode(tempPassword));
        newUser.setFirstLogin(true); // Flag for forced password reset

        User savedUser = userRepository.save(newUser);

        // Update active users
        college.setActiveUsers(college.getActiveUsers() + 1);
        collegeAccountRepository.save(college);

        sendEmail(email, "Welcome to Schedulix - Your Account Details",
                "Hello " + fullName + ",\n\n" +
                "Your account for Schedulix has been created by your department admin.\n\n" +
                "Here are your login details:\n" +
                "Username: " + finalUsername + "\n" +
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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email sending failed to " + to + ": " + e.getMessage());
        }
    }
}
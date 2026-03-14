//package com.schedulix.faculty_coordination.controller;
//
//import com.schedulix.faculty_coordination.model.User;
//import com.schedulix.faculty_coordination.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/password")
//public class PasswordResetController {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    /**
//     * Step 1: User ka email lein aur uske questions return karein.
//     */
//    @PostMapping("/get-questions")
//    public ResponseEntity<?> getSecurityQuestions(@RequestBody Map<String, String> payload) {
//        String username = payload.get("username");
//        User user = userRepository.findByUsername(username).orElse(null);
//
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
//        }
//        if (user.getSecurityQuestion1() == null || user.getSecurityQuestion1().isEmpty()) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User has not set up security questions.");
//        }
//
//        // Sirf questions (bina answers) return karein
//        Map<String, String> questions = new HashMap<>();
//        questions.put("securityQuestion1", user.getSecurityQuestion1());
//        questions.put("securityQuestion2", user.getSecurityQuestion2());
//
//        return ResponseEntity.ok(questions);
//    }
//
//    /**
//     * Step 2: Answers verify karein aur password reset karein.
//     */
//    @PostMapping("/reset-with-questions")
//    @Transactional
//    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
//        String username = payload.get("username");
//        String answer1 = payload.get("answer1");
//        String answer2 = payload.get("answer2");
//        String newPassword = payload.get("newPassword");
//
//        if (username == null || answer1 == null || answer2 == null || newPassword == null) {
//            return ResponseEntity.badRequest().body("All fields are required.");
//        }
//
//        User user = userRepository.findByUsername(username).orElse(null);
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
//        }
//
//        // Answers verify karein (case-insensitive)
//        if (answer1.equalsIgnoreCase(user.getSecurityAnswer1()) &&
//                answer2.equalsIgnoreCase(user.getSecurityAnswer2())) {
//
//            // Answers sahi hain, password reset karein
//            user.setPassword(passwordEncoder.encode(newPassword));
//            userRepository.save(user);
//            return ResponseEntity.ok("Password reset successfully. You can now log in.");
//        } else {
//            // Answers galat hain
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Security answers are incorrect.");
//        }
//    }
//}
package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.UserDTO;
import com.schedulix.faculty_coordination.model.TimetableEntry;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.UserRepository;
import com.schedulix.faculty_coordination.repository.TimetableRepository;
import com.schedulix.faculty_coordination.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private FileStorageService fileStorageService;
    @Autowired private TimetableRepository timetableRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        User userFromDb = userRepository.findById(currentUser.getId()).orElse(currentUser);
        return ResponseEntity.ok(convertUserToRichDto(userFromDb));
    }

    @GetMapping("/faculty")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserDTO>> getAllFaculty() {
        List<User> facultyUsers = userRepository.findByRole("ROLE_FACULTY");
        return ResponseEntity.ok(facultyUsers.stream().map(this::convertUserToRichDto).collect(Collectors.toList()));
    }

    @PatchMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> updateProfileInfo(@AuthenticationPrincipal User currentUser, @RequestBody Map<String, String> updates) {
        if (currentUser == null) return ResponseEntity.status(401).build();

        if (updates.containsKey("fullName")) currentUser.setFullName(updates.get("fullName"));
        if (updates.containsKey("subjects")) currentUser.setSubjects(updates.get("subjects"));
        if (updates.containsKey("officeLocation")) currentUser.setOfficeLocation(updates.get("officeLocation"));
        if (updates.containsKey("designation")) currentUser.setDesignation(updates.get("designation"));

        User savedUser = userRepository.save(currentUser);
        return ResponseEntity.ok(convertUserToRichDto(savedUser));
    }

    @PostMapping("/me/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> uploadProfilePicture(@AuthenticationPrincipal User currentUser, @RequestParam("file") MultipartFile file) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        
        try {
            String fileUrl = fileStorageService.storeFile(file, currentUser.getId());
            currentUser.setProfileImageUrl(fileUrl);
            User savedUser = userRepository.save(currentUser);
            return ResponseEntity.ok(convertUserToRichDto(savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/me/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> removeProfilePicture(@AuthenticationPrincipal User currentUser) {
         if (currentUser == null) return ResponseEntity.status(401).build();
         currentUser.setProfileImageUrl(null);
         User savedUser = userRepository.save(currentUser);
         return ResponseEntity.ok(convertUserToRichDto(savedUser));
    }

    private UserDTO convertUserToRichDto(User user) {
        String status = "Available";
        String location = user.getOfficeLocation() != null ? user.getOfficeLocation() : "On Campus";

        try {
            LocalTime now = LocalTime.now();
            java.time.DayOfWeek javaDay = LocalDate.now().getDayOfWeek();

            LocalTime collegeStart = LocalTime.of(8, 10);
            LocalTime collegeEnd = LocalTime.of(17, 0);

            if (now.isBefore(collegeStart) || now.isAfter(collegeEnd) || javaDay == java.time.DayOfWeek.SUNDAY) {
                status = "Unavailable";
                location = "Off Campus";
            } else {
                try {
                    com.schedulix.faculty_coordination.model.DayOfWeek currentDay = com.schedulix.faculty_coordination.model.DayOfWeek.valueOf(javaDay.name());
                    Optional<TimetableEntry> currentClass = timetableRepository.findFirstByFacultyIdAndDayAndStartTimeLessThanEqualAndEndTimeGreaterThan(
                            user.getId(), currentDay, now, now);

                    if (currentClass.isPresent()) {
                        status = "In Class";
                        if (currentClass.get().getLocation() != null && !currentClass.get().getLocation().isEmpty()) {
                            location = currentClass.get().getLocation();
                        }
                    } else {
                        status = "Available";
                    }
                } catch (IllegalArgumentException ex) {
                    // In case DayOfWeek enum doesn't map perfectly (e.g. SUNDAY if it's missing in enum)
                }
            }
        } catch (Exception e) {
            status = "Status Unknown";
        }

        // --- FIX: Department details nikalna ---
        String deptName = (user.getDepartment() != null) ? user.getDepartment().getName() : "N/A";
        String themeColor = (user.getDepartment() != null) ? user.getDepartment().getThemeColor() : "#3b82f6";

        // --- FIX: Constructor call with 11 arguments ---
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getProfileImageUrl(),
                user.getFullName(),
                deptName,     // String passed here
                user.getSubjects(),
                status,
                location,
                themeColor,   // 10th Argument Added
                user.getDesignation() // 11th Argument
        );
    }
}
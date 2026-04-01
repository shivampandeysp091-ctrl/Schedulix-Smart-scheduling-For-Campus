package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.model.DemoRequest;
import com.schedulix.faculty_coordination.repository.DemoRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
public class DemoRequestController {

    @Autowired
    private DemoRequestRepository demoRequestRepository;

    @PostMapping("/request")
    public ResponseEntity<?> createDemoRequest(@RequestBody DemoRequest request) {
        if (request.getCollegeName() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Required fields are missing.");
        }
        DemoRequest saved = demoRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }
}

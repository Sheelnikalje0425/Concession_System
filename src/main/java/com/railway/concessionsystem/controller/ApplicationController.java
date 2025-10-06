package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // Get all applications
    @GetMapping
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
    
    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        return application.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // Get application with student by ID
    @GetMapping("/{id}/with-student")
    public ResponseEntity<Application> getApplicationWithStudent(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        if (application.isPresent()) {
            // Force initialization of student (if needed)
            Application app = application.get();
            if (app.getStudent() != null) {
                app.getStudent().getName(); // This forces Hibernate to load the student
            }
            return ResponseEntity.ok(app);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Create new application
    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody Application application) {
        try {
            // Verify student exists
            if (!studentRepository.existsById(application.getStudent().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
            }
            
            application.setApplicationDate(LocalDateTime.now());
            application.setStatus(ApplicationStatus.PENDING);
            
            Application savedApplication = applicationRepository.save(application);
            return ResponseEntity.ok(savedApplication);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create application: " + e.getMessage()));
        }
    }
    
    // Update application status (for staff)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Application> applicationOptional = applicationRepository.findById(id);
        
        if (applicationOptional.isPresent()) {
            Application application = applicationOptional.get();
            String status = request.get("status");
            
            try {
                ApplicationStatus newStatus = ApplicationStatus.valueOf(status.toUpperCase());
                application.setStatus(newStatus);
                
                if (newStatus == ApplicationStatus.APPROVED) {
                    application.setApproveDate(LocalDateTime.now());
                }
                
                Application updatedApplication = applicationRepository.save(application);
                return ResponseEntity.ok(updatedApplication);
                
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + status));
            }
        }
        
        return ResponseEntity.notFound().build();
    }
    
    // Assign certificate number (for staff)
    @PutMapping("/{id}/certificate")
    public ResponseEntity<?> assignCertificateNumber(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Application> applicationOptional = applicationRepository.findById(id);
        
        if (applicationOptional.isPresent()) {
            Application application = applicationOptional.get();
            String certificateNo = request.get("certificateNo");
            
            application.setCurrentCertificateNo(certificateNo);
            Application updatedApplication = applicationRepository.save(application);
            
            return ResponseEntity.ok(updatedApplication);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    // Get applications by student ID
    @GetMapping("/student/{studentId}")
    public List<Application> getApplicationsByStudent(@PathVariable String studentId) {
        return applicationRepository.findByStudentId(studentId);
    }
    
    // Get applications by status
    @GetMapping("/status/{status}")
    public List<Application> getApplicationsByStatus(@PathVariable String status) {
        try {
            ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase());
            return applicationRepository.findByStatus(appStatus);
        } catch (IllegalArgumentException e) {
            return List.of(); // Return empty list for invalid status
        }
    }
    
    // Get application statistics
    @GetMapping("/stats")
    public Map<String, Long> getApplicationStats() {
        long total = applicationRepository.count();
        long pending = applicationRepository.countByStatus(ApplicationStatus.PENDING);
        long approved = applicationRepository.countByStatus(ApplicationStatus.APPROVED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        
        return Map.of(
            "total", total,
            "pending", pending,
            "approved", approved,
            "rejected", rejected
        );
    }
}
package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import com.railway.concessionsystem.service.ApplicationService;

import jakarta.servlet.http.HttpSession;

import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StaffRepository;
import com.railway.concessionsystem.model.Staff;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.StringWriter;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StaffRepository staffRepository;


    // ==========================
    // CREATE APPLICATION (Multipart)
    // ==========================
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createApplication(
            @RequestParam String studentId,
            @RequestParam String studentName,
            @RequestParam String studentDob,
            @RequestParam String routeFrom,
            @RequestParam String routeTo,
            @RequestParam String category,
            @RequestParam(required = false) String previousCertificateNo,
            @RequestParam(required = false) MultipartFile casteCertificate,
            @RequestParam MultipartFile aadharCard  // Aadhaar card is required
    ) {
        try {
            Application savedApplication = applicationService.createApplication(
                    studentId,
                    studentName,
                    studentDob,
                    routeFrom,
                    routeTo,
                    category,
                    previousCertificateNo,
                    casteCertificate,
                    aadharCard
            );

            return ResponseEntity.ok(savedApplication);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // GET ALL APPLICATIONS
    // ==========================
    @GetMapping
    public ResponseEntity<?> getAllApplications() {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Access denied"));
    }


    // ==========================
    // GET APPLICATION BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // GET APPLICATION WITH STUDENT
    // ==========================
    @GetMapping("/{id}/with-student")
    public ResponseEntity<Application> getApplicationWithStudent(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        if (application.isPresent()) {
            Application app = application.get();
            if (app.getStudent() != null) {
                app.getStudent().getName(); // force load
            }
            return ResponseEntity.ok(app);
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================
    // UPDATE APPLICATION STATUS (STAFF)
    // ==========================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Optional<Application> applicationOptional = applicationRepository.findById(id);

        if (applicationOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            ApplicationStatus status = ApplicationStatus.valueOf(statusStr.toUpperCase());
            Application updated = applicationService.updateApplicationStatus(id, status);
            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // ASSIGN CERTIFICATE NUMBER (STAFF)
    // ==========================
    @PutMapping("/{id}/certificate")
    public ResponseEntity<?> assignCertificateNumber(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String certificateNo = request.get("certificateNo");
            if (certificateNo == null || certificateNo.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Certificate number is required"));
            }

            Application updated = applicationService.assignCertificateNumber(id, certificateNo);
            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // GET APPLICATIONS BY STUDENT
    // ==========================
    @GetMapping("/student/{studentId}")
    public List<Application> getApplicationsByStudent(@PathVariable String studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    // ==========================
    // GET APPLICATIONS BY STATUS
    // ==========================
    @GetMapping("/status/{status}")
    public List<Application> getApplicationsByStatus(@PathVariable String status) {
        try {
            ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase());
            return applicationRepository.findByStatus(appStatus);
        } catch (Exception e) {
            return List.of();
        }
    }

    // ==========================
    // APPLICATION STATISTICS
    // ==========================
    @GetMapping("/stats")
    public Map<String, Long> getApplicationStats() {
        return Map.of(
                "total", applicationRepository.count(),
                "pending", applicationRepository.countByStatus(ApplicationStatus.PENDING),
                "approved", applicationRepository.countByStatus(ApplicationStatus.APPROVED),
                "rejected", applicationRepository.countByStatus(ApplicationStatus.REJECTED)
        );
    }

    // ==========================
    // UPLOAD AADHAR CARD (Separate endpoint)
    // ==========================
    @PostMapping(
        value = "/{appId}/upload-aadhar",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadAadharCard(
            @PathVariable Long appId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            applicationService.uploadAadharCard(appId, file);
            return ResponseEntity.ok(Map.of("message", "Aadhaar card uploaded successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==============================
    // Staff: View caste certificate
    // ==============================
    @GetMapping("/{id}/caste-certificate")
    public ResponseEntity<?> getCasteCertificate(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(application -> {
                    // Check category
                    String category = application.getCategory();
                    if (category == null ||
                            !(category.equalsIgnoreCase("SC") || category.equalsIgnoreCase("ST"))) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Caste certificate not applicable for this category"));
                    }

                    // Check certificate path
                    String certificatePath = application.getCasteCertificate();
                    if (certificatePath == null || certificatePath.isBlank()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Caste certificate not uploaded"));
                    }

                    // Return file URL
                    return ResponseEntity.ok(
                            Map.of("certificateUrl", certificatePath)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==============================
    // Staff: View Aadhaar card
    // ==============================
    @GetMapping("/{id}/aadhar-card")
    public ResponseEntity<?> getAadharCard(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(application -> {
                    // Check Aadhaar path
                    String aadharPath = application.getAadharCard();
                    if (aadharPath == null || aadharPath.isBlank()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Aadhaar card not uploaded"));
                    }

                    // Return file URL
                    return ResponseEntity.ok(
                            Map.of("aadharUrl", aadharPath)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==============================
    // STAFF: GET APPLICATIONS BY DEPARTMENT (OLD METHOD - Single department)
    // ==============================
    @GetMapping("/staff/applications/old")
    public ResponseEntity<?> getApplicationsForStaffOld(HttpSession session) {
        try {
            System.out.println("=== DEBUG: OLD Department Filtering Start ===");
            
            // 1️⃣ Get logged-in staff email from session
            String staffEmail = (String) session.getAttribute("staffEmail");
            if (staffEmail == null) {
                System.out.println("DEBUG: No staff email in session");
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            System.out.println("DEBUG: Staff email = " + staffEmail);

            // 2️⃣ Fetch staff
            Staff staff = staffRepository.findByEmail(staffEmail)
                    .orElseThrow(() -> {
                        System.out.println("DEBUG: Staff not found for email: " + staffEmail);
                        return new RuntimeException("Staff not found");
                    });
            
            System.out.println("DEBUG: Staff found = " + staff.getName());
            System.out.println("DEBUG: Staff department = '" + staff.getDepartment() + "'");
            System.out.println("DEBUG: Staff ID = " + staff.getId());
            
            // 3️⃣ Get department
            String staffDepartment = staff.getDepartment();
            
            // 4️⃣ Fetch only department applications (OLD method - single department)
            System.out.println("DEBUG: Calling OLD service method with department: " + staffDepartment);
            List<Application> applications = 
                    applicationService.getApplicationsForStaffDepartment(staffDepartment);
            
            System.out.println("DEBUG: Found " + applications.size() + " applications");
            
            // Debug: Print first few applications
            applications.stream().limit(3).forEach(app -> {
                if (app.getStudent() != null) {
                    System.out.println("DEBUG App: Student ID=" + app.getStudent().getId() + 
                                      ", Student Dept='" + app.getStudent().getDepartment() + "'");
                } else {
                    System.out.println("DEBUG App: Student is null!");
                }
            });
            
            System.out.println("=== DEBUG: OLD Department Filtering End ===");
            return ResponseEntity.ok(applications);
            
        } catch (RuntimeException e) {
            System.out.println("DEBUG: Error occurred: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==============================
    // STAFF: GET APPLICATIONS FOR MULTIPLE DEPARTMENTS (NEW METHOD)
    // ==============================
    @GetMapping("/staff/applications")
    public ResponseEntity<?> getApplicationsForStaff(HttpSession session) {
        try {
            System.out.println("=== DEBUG: NEW Multi-Department Filtering Start ===");
            
            // 1️⃣ Get logged-in staff email from session
            String staffEmail = (String) session.getAttribute("staffEmail");
            if (staffEmail == null) {
                System.out.println("DEBUG: No staff email in session");
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            System.out.println("DEBUG: Staff email = " + staffEmail);

            // 2️⃣ Fetch staff
            Staff staff = staffRepository.findByEmail(staffEmail)
                    .orElseThrow(() -> {
                        System.out.println("DEBUG: Staff not found for email: " + staffEmail);
                        return new RuntimeException("Staff not found");
                    });
            
            System.out.println("DEBUG: Staff found = " + staff.getName());
            System.out.println("DEBUG: Staff department = '" + staff.getDepartment() + "'");
            System.out.println("DEBUG: Staff ID = " + staff.getId());
            
            // 3️⃣ Get department and map to multiple student departments
            String staffDepartment = staff.getDepartment();
            List<String> allowedDepartments;

            if ("IT".equalsIgnoreCase(staffDepartment)) {
                allowedDepartments = List.of("FEIT", "SEIT", "TEIT", "BEIT");
                System.out.println("DEBUG: IT staff -> Allowed departments: " + allowedDepartments);
            } else if ("MECH".equalsIgnoreCase(staffDepartment)) {
                allowedDepartments = List.of("FEMECH", "SEMECH", "TEMECH", "BEMECH");
                System.out.println("DEBUG: MECH staff -> Allowed departments: " + allowedDepartments);
            } else {
                // For other departments, use single department (backward compatibility)
                allowedDepartments = List.of(staffDepartment);
                System.out.println("DEBUG: Other department -> Single department: " + allowedDepartments);
            }
            
            // 4️⃣ Fetch applications for multiple departments (NEW method)
            System.out.println("DEBUG: Calling NEW service method with departments: " + allowedDepartments);
            List<Application> applications = 
                    applicationService.getApplicationsForMultipleDepartments(allowedDepartments);
            
            System.out.println("DEBUG: Found " + applications.size() + " applications");
            
            // Debug: Print department distribution
            if (!applications.isEmpty()) {
                System.out.println("DEBUG: Department distribution:");
                allowedDepartments.forEach(dept -> {
                    long count = applications.stream()
                        .filter(app -> app.getStudent() != null && 
                                      app.getStudent().getDepartment() != null && 
                                      app.getStudent().getDepartment().equals(dept))
                        .count();
                    System.out.println("  - " + dept + ": " + count + " applications");
                });
            }
            
            System.out.println("=== DEBUG: NEW Multi-Department Filtering End ===");
            return ResponseEntity.ok(applications);
            
        } catch (RuntimeException e) {
            System.out.println("DEBUG: Error occurred: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================
    // TEST ENDPOINT (Temporary - remove after testing)
    // ==========================
    @GetMapping("/test/dept/{department}")
    public ResponseEntity<?> testDepartmentFilter(@PathVariable String department) {
        System.out.println("TEST: Testing department filter for: " + department);
        
        // Test 1: Direct repository call
        List<Application> repoResult = applicationRepository.findByStudent_Department(department);
        System.out.println("TEST: Repository returned " + repoResult.size() + " applications");
        
        // Test 2: Service call
        List<Application> serviceResult = applicationService.getApplicationsForStaffDepartment(department);
        System.out.println("TEST: Service returned " + serviceResult.size() + " applications");
        
        return ResponseEntity.ok(Map.of(
            "department", department,
            "repositoryCount", repoResult.size(),
            "serviceCount", serviceResult.size(),
            "applications", repoResult
        ));
    }

    // ==========================
    // TEST MULTIPLE DEPARTMENTS ENDPOINT
    // ==========================
    @PostMapping("/test/multi-dept")
    public ResponseEntity<?> testMultipleDepartmentFilter(@RequestBody List<String> departments) {
        System.out.println("TEST: Testing multiple department filter for: " + departments);
        
        if (departments == null || departments.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Departments list is required"));
        }
        
        // Test the new method
        List<Application> result = applicationService.getApplicationsForMultipleDepartments(departments);
        System.out.println("TEST: New method returned " + result.size() + " applications");
        
        return ResponseEntity.ok(Map.of(
            "departments", departments,
            "applicationCount", result.size(),
            "applications", result
        ));
    }

    // ==========================
    // CSV REPORT
    // ==========================
    @GetMapping("/reports/applications/csv-filtered")
    public ResponseEntity<String> generateApplicationsCSVFiltered(
            @RequestParam(required = false) String certificateStart,
            @RequestParam(required = false) String certificateEnd
    ) {
        List<Application> applications;

        if (certificateStart != null && certificateEnd != null) {
            applications = applicationRepository
                    .findByCurrentCertificateNoBetween(
                            certificateStart.toUpperCase(),
                            certificateEnd.toUpperCase()
                    );
        } else {
            applications = applicationRepository.findAll();
        }

        StringWriter csvWriter = new StringWriter();
        csvWriter.append(
                "Application ID,Student ID,Student Name,Route From,Route To,Status,Certificate No,Application Date,Category,Aadhaar Uploaded\n"
        );

        for (Application app : applications) {
            csvWriter.append(app.getAppId().toString()).append(",");
            csvWriter.append(app.getStudent().getId()).append(",");
            csvWriter.append(app.getStudentName()).append(",");
            csvWriter.append(app.getRouteFrom()).append(",");
            csvWriter.append(app.getRouteTo()).append(",");
            csvWriter.append(app.getStatus().toString()).append(",");
            csvWriter.append(
                    app.getCurrentCertificateNo() != null ? app.getCurrentCertificateNo() : ""
            ).append(",");
            csvWriter.append(app.getApplicationDate().toString()).append(",");
            csvWriter.append(app.getCategory() != null ? app.getCategory() : "").append(",");
            csvWriter.append(app.getAadharCard() != null ? "Yes" : "No").append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header(
                        "Content-Disposition",
                        "attachment; filename=applications.csv"
                )
                .body(csvWriter.toString());
    }
}
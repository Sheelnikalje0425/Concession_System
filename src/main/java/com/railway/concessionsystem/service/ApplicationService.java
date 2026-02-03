package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private static final String CASTE_CERT_DIR = "uploads/caste-certificates/";
    private static final String AADHAR_CARD_DIR = "uploads/aadhar-cards/";

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Create new application with both caste certificate and Aadhaar handling
     */
    public Application createApplication(
            String studentId,
            String studentName,
            String studentDob,
            String routeFrom,
            String routeTo,
            String category,
            String previousCertificateNo,
            MultipartFile casteCertificate,
            MultipartFile aadharCard
    ) throws Exception {

        // 1️⃣ Validate student
        Student student = studentRepository.findById(studentId)
                .orElseGet(() -> {
                    // Create new student if doesn't exist
                    Student newStudent = new Student();
                    newStudent.setId(studentId);
                    newStudent.setName(studentName);
                    newStudent.setDob(LocalDate.parse(studentDob));
                    return studentRepository.save(newStudent);
                });

        // 2️⃣ SC / ST validation for caste certificate
        boolean isSCorST = isSCorST(category);

        if (isSCorST && (casteCertificate == null || casteCertificate.isEmpty())) {
            throw new Exception("Caste certificate is mandatory for SC/ST students");
        }

        if (!isSCorST && casteCertificate != null && !casteCertificate.isEmpty()) {
            throw new Exception("Caste certificate should not be uploaded for this category");
        }

        // 3️⃣ Aadhaar validation (mandatory for all)
        if (aadharCard == null || aadharCard.isEmpty()) {
            throw new Exception("Aadhaar card is required for address verification");
        }

        // 4️⃣ Validate Aadhaar file type
        validateAadhaarFile(aadharCard);

        // 5️⃣ Save caste certificate (if applicable)
        String casteCertPath = null;
        if (isSCorST && casteCertificate != null) {
            casteCertPath = saveFile(casteCertificate, CASTE_CERT_DIR, studentId, "caste");
        }

        // 6️⃣ Save Aadhaar card (mandatory for all)
        String aadharPath = saveFile(aadharCard, AADHAR_CARD_DIR, studentId, "aadhar");

        // 7️⃣ Build Application entity
        Application application = new Application();
        application.setStudent(student);
        application.setStudentName(studentName);
        application.setStudentDob(LocalDate.parse(studentDob));
        application.setRouteFrom(routeFrom);
        application.setRouteTo(routeTo);
        application.setCategory(category);
        application.setPrevCertificateNo(previousCertificateNo);
        application.setCasteCertificate(casteCertPath);
        application.setAadharCard(aadharPath);
        application.setStatus(ApplicationStatus.PENDING);
        application.setApplicationDate(LocalDateTime.now());

        // 8️⃣ Save application
        return applicationRepository.save(application);
    }

    /**
     * Save file to local server
     */
    private String saveFile(MultipartFile file, String uploadDir, String studentId, String fileType) throws Exception {
        // Create directory if it doesn't exist
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        
        String uniqueFileName = studentId + "_" + fileType + "_" + 
                               UUID.randomUUID().toString().substring(0, 8) + 
                               fileExtension;

        // Save file
        Path filePath = Paths.get(uploadDir + uniqueFileName);
        Files.write(filePath, file.getBytes());

        return uploadDir + uniqueFileName;
    }

    /**
     * Upload Aadhaar card for existing application
     */
    public void uploadAadharCard(Long appId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Aadhaar card file is required");
        }

        validateAadhaarFile(file);

        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        try {
            // Ensure directory exists
            Files.createDirectories(Paths.get(AADHAR_CARD_DIR));

            String fileName = application.getStudent().getId()
                    + "_aadhar_update_" + UUID.randomUUID().toString().substring(0, 8)
                    + getFileExtension(file.getOriginalFilename());

            Path filePath = Paths.get(AADHAR_CARD_DIR + fileName);
            Files.write(filePath, file.getBytes());

            application.setAadharCard(filePath.toString());
            applicationRepository.save(application);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload Aadhaar card: " + e.getMessage());
        }
    }

    /**
     * Validate Aadhaar file type
     */
    private void validateAadhaarFile(MultipartFile file) {
        if (file == null) return;
        
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        
        // Check by content type
        boolean isValidByContentType = contentType != null && (
                contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/jpg") ||
                contentType.equals("application/pdf")
        );
        
        // Also check by file extension as fallback
        boolean isValidByExtension = filename != null && (
                filename.toLowerCase().endsWith(".jpg") ||
                filename.toLowerCase().endsWith(".jpeg") ||
                filename.toLowerCase().endsWith(".png") ||
                filename.toLowerCase().endsWith(".pdf")
        );
        
        if (!isValidByContentType && !isValidByExtension) {
            throw new RuntimeException("Only JPG, PNG or PDF files are allowed for Aadhaar");
        }
    }

    /**
     * Check if category requires caste certificate
     */
    private boolean isSCorST(String category) {
        return "SC".equalsIgnoreCase(category) || "ST".equalsIgnoreCase(category);
    }

    /**
     * Extract file extension safely
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg"; // Default extension
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * Update application status
     */
    public Application updateApplicationStatus(Long appId, ApplicationStatus status) {
        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);

        if (status == ApplicationStatus.APPROVED) {
            application.setApproveDate(LocalDateTime.now());
        }

        return applicationRepository.save(application);
    }

    /**
     * Assign certificate number
     */
    public Application assignCertificateNumber(Long appId, String certificateNo) {
        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setCurrentCertificateNo(certificateNo);
        return applicationRepository.save(application);
    }

    /**
     * Get applications for staff department with debug logging
     * OLD METHOD - Kept as it is for backward compatibility
     * (Single department only)
     */
    public List<Application> getApplicationsForStaffDepartment(String staffDepartment) {
        System.out.println("=== SERVICE DEBUG START (SINGLE DEPT) ===");
        System.out.println("SERVICE: Looking for department = '" + staffDepartment + "'");
        
        if (staffDepartment == null || staffDepartment.isBlank()) {
            System.out.println("SERVICE ERROR: Department is null or empty!");
            throw new IllegalArgumentException("Department cannot be null or empty");
        }
        
        // Use the single department method
        System.out.println("SERVICE: Calling findByStudent_Department()");
        List<Application> result = applicationRepository.findByStudent_Department(staffDepartment);
        
        System.out.println("SERVICE: Repository returned " + result.size() + " applications");
        
        // Debug: Check all applications to see their departments
        if (result.isEmpty()) {
            System.out.println("SERVICE DEBUG: No applications found for department '" + staffDepartment + "'");
            System.out.println("SERVICE DEBUG: Checking all applications in database...");
            List<Application> allApps = applicationRepository.findAll();
            System.out.println("SERVICE DEBUG: Total applications in DB: " + allApps.size());
            
            allApps.stream().limit(5).forEach(app -> {
                if (app.getStudent() != null) {
                    System.out.println("SERVICE DEBUG: App ID " + app.getAppId() + 
                                     " - Student " + app.getStudent().getId() + 
                                     " - Student Dept: '" + app.getStudent().getDepartment() + "'");
                } else {
                    System.out.println("SERVICE DEBUG: App ID " + app.getAppId() + " - Student is null!");
                }
            });
        } else {
            // Log department of first few results
            result.stream().limit(3).forEach(app -> {
                if (app.getStudent() != null) {
                    System.out.println("SERVICE DEBUG: Found App ID " + app.getAppId() + 
                                     " - Student " + app.getStudent().getId() + 
                                     " - Student Dept: '" + app.getStudent().getDepartment() + "'");
                } else {
                    System.out.println("SERVICE DEBUG: Found App ID " + app.getAppId() + " - Student is null!");
                }
            });
        }
        
        System.out.println("=== SERVICE DEBUG END (SINGLE DEPT) ===");
        return result;
    }

    /**
     * NEW METHOD: Get applications for multiple departments
     * Supports requirements like:
     * IT staff → FEIT, SEIT, TEIT, BEIT
     * MECH staff → FEMECH, SEMECH, TEMECH, BEMECH
     * 
     * @param departments List of department codes to search for
     * @return List of applications belonging to any of the specified departments
     */
    public List<Application> getApplicationsForMultipleDepartments(List<String> departments) {
        System.out.println("=== MULTI-DEPT SERVICE DEBUG START ===");
        System.out.println("SERVICE: Looking for departments = " + departments);
        
        if (departments == null || departments.isEmpty()) {
            System.out.println("SERVICE ERROR: Department list is null or empty!");
            throw new IllegalArgumentException("Department list cannot be null or empty");
        }
        
        // Remove any null or empty values from the list
        List<String> cleanDepartments = departments.stream()
                .filter(dept -> dept != null && !dept.isBlank())
                .toList();
        
        if (cleanDepartments.isEmpty()) {
            System.out.println("SERVICE WARNING: All departments in list are null or empty!");
            throw new IllegalArgumentException("Department list contains only null or empty values");
        }
        
        System.out.println("SERVICE: Cleaned department list = " + cleanDepartments);
        System.out.println("SERVICE: Calling findByStudent_DepartmentIn() with " + cleanDepartments.size() + " departments");
        
        // Use the new repository method for multiple departments
        List<Application> result = applicationRepository.findByStudent_DepartmentIn(cleanDepartments);
        
        System.out.println("SERVICE: Repository returned " + result.size() + " applications");
        
        // Debug: Show department distribution
        if (!result.isEmpty()) {
            System.out.println("SERVICE DEBUG: Department distribution:");
            cleanDepartments.forEach(dept -> {
                long count = result.stream()
                    .filter(app -> app.getStudent() != null && 
                                  app.getStudent().getDepartment() != null && 
                                  app.getStudent().getDepartment().equals(dept))
                    .count();
                System.out.println("  - " + dept + ": " + count + " applications");
            });
            
            // Also show total unique students found
            long uniqueStudents = result.stream()
                .map(app -> app.getStudent() != null ? app.getStudent().getId() : null)
                .filter(id -> id != null)
                .distinct()
                .count();
            System.out.println("SERVICE DEBUG: Unique students found: " + uniqueStudents);
        } else {
            System.out.println("SERVICE DEBUG: No applications found for any of the specified departments");
            
            // For debugging, check what departments exist in the database
            List<String> allExistingDepartments = applicationRepository.findAllDistinctDepartments();
            System.out.println("SERVICE DEBUG: All existing departments in DB: " + allExistingDepartments);
            
            // Check if there's a case mismatch
            System.out.println("SERVICE DEBUG: Checking for case sensitivity issues...");
            cleanDepartments.forEach(requestedDept -> {
                boolean foundCaseInsensitive = allExistingDepartments.stream()
                    .anyMatch(existingDept -> existingDept.equalsIgnoreCase(requestedDept));
                System.out.println("  - '" + requestedDept + "' found (case-insensitive): " + foundCaseInsensitive);
            });
        }
        
        System.out.println("=== MULTI-DEPT SERVICE DEBUG END ===");
        return result;
    }

    /**
     * Get applications by department (alias method)
     * OLD METHOD - Kept as it is for backward compatibility
     * (Single department only)
     */
    public List<Application> getApplicationsByDepartment(String department) {
        System.out.println("SERVICE (getApplicationsByDepartment): Department = '" + department + "'");
        return applicationRepository.findByStudent_Department(department);
    }
}
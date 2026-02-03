package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StaffRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Student login with ID and DOB
    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> credentials, HttpSession session) {
        String studentId = credentials.get("studentId");
        String dobString = credentials.get("dob");
        
        try {
            LocalDate dob = LocalDate.parse(dobString);
            Optional<Student> student = studentRepository.findById(studentId);
            
            if (student.isPresent() && student.get().getDob().equals(dob)) {
                // Set session attribute for student
                session.setAttribute("studentId", studentId);
                session.setAttribute("userRole", "student");
                
                return ResponseEntity.ok().body(Map.of(
                    "message", "Login successful",
                    "student", student.get(),
                    "role", "student"
                ));
            }
            
            return ResponseEntity.status(401).body(Map.of("error", "Invalid student ID or date of birth"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
        }
    }
    
    // Staff login with email and password
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> credentials, HttpSession session) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        Optional<Staff> staff = staffRepository.findByEmail(email);
        
        if (staff.isPresent() && passwordEncoder.matches(password, staff.get().getPassword())) {
            // ✅ CRITICAL: Set session attributes for staff
            session.setAttribute("staffEmail", email);
            session.setAttribute("staffId", staff.get().getId());
            session.setAttribute("staffName", staff.get().getName());
            session.setAttribute("staffDepartment", staff.get().getDepartment());
            session.setAttribute("userRole", "staff");
            
            // Debug: Print session info
            System.out.println("=== STAFF LOGIN DEBUG ===");
            System.out.println("Staff logged in: " + email);
            System.out.println("Staff department: " + staff.get().getDepartment());
            System.out.println("Session ID: " + session.getId());
            System.out.println("Session attributes set successfully");
            System.out.println("=== END DEBUG ===");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("staff", staff.get());
            response.put("role", "staff");
            response.put("department", staff.get().getDepartment());
            
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }
    
    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
    
    // Session check endpoint
    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        String staffEmail = (String) session.getAttribute("staffEmail");
        String studentId = (String) session.getAttribute("studentId");
        String userRole = (String) session.getAttribute("userRole");
        
        Map<String, Object> response = new HashMap<>();
        response.put("isAuthenticated", staffEmail != null || studentId != null);
        response.put("userRole", userRole);
        response.put("staffEmail", staffEmail);
        response.put("studentId", studentId);
        response.put("sessionId", session.getId());
        
        return ResponseEntity.ok(response);
    }
    
    // Student registration (optional - if you want students to register themselves)
    @PostMapping("/student/register")
    public ResponseEntity<?> studentRegister(@RequestBody Student student) {
        try {
            // Check if student already exists
            if (studentRepository.existsById(student.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student ID already exists"));
            }
            
            if (studentRepository.existsByEmail(student.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }
            
            Student savedStudent = studentRepository.save(student);
            return ResponseEntity.ok().body(Map.of(
                "message", "Registration successful",
                "student", savedStudent
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }
}
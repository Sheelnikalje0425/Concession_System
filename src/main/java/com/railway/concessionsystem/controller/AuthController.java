package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StaffRepository;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> credentials) {
        String studentId = credentials.get("studentId");
        String dobString = credentials.get("dob");
        
        try {
            LocalDate dob = LocalDate.parse(dobString);
            Optional<Student> student = studentRepository.findById(studentId);
            
            if (student.isPresent() && student.get().getDob().equals(dob)) {
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
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        Optional<Staff> staff = staffRepository.findByEmail(email);
        
        if (staff.isPresent() && passwordEncoder.matches(password, staff.get().getPassword())) {
            return ResponseEntity.ok().body(Map.of(
                "message", "Login successful",
                "staff", staff.get(),
                "role", "staff"
            ));
        }
        
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
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
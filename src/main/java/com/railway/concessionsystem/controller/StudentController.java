package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Student;
import com.railway.concessionsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    // Get all students (for staff only)
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        Optional<Student> student = studentRepository.findById(id);
        return student.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    // Get student with applications by ID
    @GetMapping("/{id}/with-applications")
    public ResponseEntity<Student> getStudentWithApplications(@PathVariable String id) {
        Optional<Student> student = studentRepository.findById(id);
        if (student.isPresent()) {
            // Force initialization of applications (if needed)
            Student s = student.get();
            if (s.getApplications() != null) {
                s.getApplications().size(); // This forces Hibernate to load the collection
            }
            return ResponseEntity.ok(s);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Update student profile
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable String id, @RequestBody Student studentDetails) {
        Optional<Student> studentOptional = studentRepository.findById(id);
        
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            
            // Update fields
            if (studentDetails.getName() != null) {
                student.setName(studentDetails.getName());
            }
            if (studentDetails.getEmail() != null) {
                student.setEmail(studentDetails.getEmail());
            }
            if (studentDetails.getCategory() != null) {
                student.setCategory(studentDetails.getCategory());
            }
            
            Student updatedStudent = studentRepository.save(student);
            return ResponseEntity.ok(updatedStudent);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    // Delete student (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Student deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
    
    // Search students by name or email
    @GetMapping("/search")
    public List<Student> searchStudents(@RequestParam String query) {
        return studentRepository.findByNameContainingOrEmailContaining(query, query);
    }
}
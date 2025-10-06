package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Staff;
import com.railway.concessionsystem.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Get all staff members (admin only)
    @GetMapping
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }
    
    // Get staff by ID
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        Optional<Staff> staff = staffRepository.findById(id);
        return staff.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Create new staff member (admin only)
    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody Staff staff) {
        try {
            // Check if email already exists
            if (staffRepository.existsByEmail(staff.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }
            
            // Encrypt password
            staff.setPassword(passwordEncoder.encode(staff.getPassword()));
            
            Staff savedStaff = staffRepository.save(staff);
            return ResponseEntity.ok(savedStaff);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create staff: " + e.getMessage()));
        }
    }
    
    // Update staff member
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody Staff staffDetails) {
        Optional<Staff> staffOptional = staffRepository.findById(id);
        
        if (staffOptional.isPresent()) {
            Staff staff = staffOptional.get();
            
            // Update fields
            if (staffDetails.getName() != null) {
                staff.setName(staffDetails.getName());
            }
            if (staffDetails.getEmail() != null && !staffDetails.getEmail().equals(staff.getEmail())) {
                if (staffRepository.existsByEmail(staffDetails.getEmail())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
                }
                staff.setEmail(staffDetails.getEmail());
            }
            if (staffDetails.getPassword() != null) {
                staff.setPassword(passwordEncoder.encode(staffDetails.getPassword()));
            }
            
            Staff updatedStaff = staffRepository.save(staff);
            return ResponseEntity.ok(updatedStaff);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    // Delete staff member (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Staff deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
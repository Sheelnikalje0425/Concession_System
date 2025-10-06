package com.railway.concessionsystem.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "student")
@Data
public class Student {
    
    @Id
    @Column(name = "id")
    private String id; // College ID (e.g., TU4F2222016)
    
    @NotNull
    private String name;
    
    @NotNull
    private LocalDate dob;
    
    @Email
    @NotNull
    @Column(unique = true)
    private String email;
    
    private String password; // Hashed password (null initially)
    
    private String category; // SC/ST or null for general students
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Add this annotation
    private List<Application> applications;
}
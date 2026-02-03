package com.railway.concessionsystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "staff")
@Data
public class Staff {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Change from Long to Integer
    
    @NotNull
    private String name;
    
    @Email
    @NotNull
    @Column(unique = true)
    private String email;
    
    @NotNull
    private String password;

    @Column(nullable = false)
    private String department;

    public String getDepartment() {
    return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

}
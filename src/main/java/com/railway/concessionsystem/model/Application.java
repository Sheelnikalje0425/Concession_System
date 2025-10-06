package com.railway.concessionsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "application")
@Data
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "app_id")
    private Integer appId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    @NotNull
    @JsonBackReference // Add this annotation
    private Student student;
    
    @Column(name = "student_name", length = 100)
    @NotNull
    private String studentName;
    
    @Column(name = "student_dob")
    @NotNull
    private LocalDate studentDob;
    
    @Column(name = "category", length = 50)
    private String category;
    
    @Column(name = "caste_certificate", length = 255)
    private String casteCertificate;
    
    @Column(name = "route_from", length = 100)
    @NotNull
    private String routeFrom;
    
    @Column(name = "route_to", length = 100)
    private String routeTo = "Nerul";
    
    @Column(name = "prev_certificate_no", length = 50)
    private String prevCertificateNo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "current_certificate_no", length = 50)
    private String currentCertificateNo;
    
    @Column(name = "application_date")
    private LocalDateTime applicationDate = LocalDateTime.now();
    
    @Column(name = "approve_date")
    private LocalDateTime approveDate;
    
    @Column(name = "issue_date")
    private LocalDateTime issueDate;
}
package com.railway.concessionsystem.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "application")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "app_id")
    private Long appId;

    // ==========================
    // Student relation
    // ==========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference
    private Student student;

    // ==========================
    // Snapshot fields
    // ==========================
    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_dob", nullable = false)
    private LocalDate studentDob;

    @Column(name = "category")
    private String category;

    @Column(name = "caste_certificate")
    private String casteCertificate;   // ✅ IMPORTANT FIELD

    // ==========================
    // Application details
    // ==========================
    @Column(name = "route_from", nullable = false)
    private String routeFrom;

    @Column(name = "route_to", nullable = false)
    private String routeTo;

    @Column(name = "prev_certificate_no")
    private String prevCertificateNo;

    @Column(name = "current_certificate_no")
    private String currentCertificateNo;

    @Column(name = "aadhar_card")
    private String aadharCard;


    // ==========================
    // Status & timeline
    // ==========================
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ApplicationStatus status;

    @Column(name = "application_date")
    private LocalDateTime applicationDate;

    @Column(name = "approve_date")
    private LocalDateTime approveDate;

    @Column(name = "issue_date")
    private LocalDateTime issueDate;

    // ==========================
    // Constructors
    // ==========================
    public Application() {}

    // ==========================
    // Getters & Setters
    // ==========================
    public Long getAppId() {
        return appId;
    }

    public void setAppId(Long appId) {
        this.appId = appId;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public LocalDate getStudentDob() {
        return studentDob;
    }

    public void setStudentDob(LocalDate studentDob) {
        this.studentDob = studentDob;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // ✅ Caste Certificate Getter/Setter
    public String getCasteCertificate() {
        return casteCertificate;
    }

    public void setCasteCertificate(String casteCertificate) {
        this.casteCertificate = casteCertificate;
    }

    public String getAadharCard() {
        return aadharCard;
    }

    public void setAadharCard(String aadharCard) {
        this.aadharCard = aadharCard;
    }
    
    public String getRouteFrom() {
        return routeFrom;
    }

    public void setRouteFrom(String routeFrom) {
        this.routeFrom = routeFrom;
    }

    public String getRouteTo() {
        return routeTo;
    }

    public void setRouteTo(String routeTo) {
        this.routeTo = routeTo;
    }

    public String getPrevCertificateNo() {
        return prevCertificateNo;
    }

    public void setPrevCertificateNo(String prevCertificateNo) {
        this.prevCertificateNo = prevCertificateNo;
    }

    public String getCurrentCertificateNo() {
        return currentCertificateNo;
    }

    public void setCurrentCertificateNo(String currentCertificateNo) {
        this.currentCertificateNo = currentCertificateNo;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDateTime getApproveDate() {
        return approveDate;
    }

    public void setApproveDate(LocalDateTime approveDate) {
        this.approveDate = approveDate;
    }

    public LocalDateTime getIssueDate() {
    return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

}

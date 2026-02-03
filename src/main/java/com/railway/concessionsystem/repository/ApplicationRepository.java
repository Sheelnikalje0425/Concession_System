package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // ==========================
    // Basic CRUD methods
    // ==========================
    List<Application> findByStudentId(String studentId);
    List<Application> findByStatus(ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
    
    // ==========================
    // Certificate range filtering
    // ==========================
    List<Application> findByCurrentCertificateNoBetween(String startCertificate, String endCertificate);
    List<Application> findByCurrentCertificateNoGreaterThanEqual(String startCertificate);
    List<Application> findByCurrentCertificateNoLessThanEqual(String endCertificate);
    
    // ==========================
    // DEPARTMENT FILTERING METHODS
    // ==========================
    
    // Method 1: Derived query method (Spring Data JPA naming convention) - Single department
    List<Application> findByStudent_Department(String department);
    
    // NEW METHOD: Derived query for multiple departments (Spring Data JPA naming convention)
    List<Application> findByStudent_DepartmentIn(List<String> departments);
    
    // Method 2: Explicit JPQL query (more reliable) - Single department
    @Query("SELECT a FROM Application a WHERE a.student.department = :department")
    List<Application> findByStudentDepartmentExplicit(@Param("department") String department);
    
    // NEW METHOD: Explicit JPQL query for multiple departments
    @Query("SELECT a FROM Application a WHERE a.student.department IN :departments")
    List<Application> findByStudentDepartmentInExplicit(@Param("departments") List<String> departments);
    
    // Method 3: Case-insensitive search
    @Query("SELECT a FROM Application a WHERE LOWER(a.student.department) = LOWER(:department)")
    List<Application> findByStudentDepartmentIgnoreCase(@Param("department") String department);
    
    // Method 4: Contains search (if you want partial matches)
    @Query("SELECT a FROM Application a WHERE a.student.department LIKE %:department%")
    List<Application> findByStudentDepartmentContaining(@Param("department") String department);
    
    // ==========================
    // Additional query methods for testing
    // ==========================
    
    // Get all applications with student department (for debugging)
    @Query("SELECT a FROM Application a WHERE a.student.department IS NOT NULL")
    List<Application> findAllWithDepartment();
    
    // Get distinct departments from all applications
    @Query("SELECT DISTINCT a.student.department FROM Application a WHERE a.student.department IS NOT NULL")
    List<String> findAllDistinctDepartments();
    
    // Count applications by department
    @Query("SELECT COUNT(a) FROM Application a WHERE a.student.department = :department")
    Long countByStudentDepartment(@Param("department") String department);
    
    // Get applications with null student department
    @Query("SELECT a FROM Application a WHERE a.student.department IS NULL")
    List<Application> findByStudentDepartmentIsNull();
}
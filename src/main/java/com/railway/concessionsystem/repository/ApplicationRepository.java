package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(String studentId);
    List<Application> findByStatus(ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
}
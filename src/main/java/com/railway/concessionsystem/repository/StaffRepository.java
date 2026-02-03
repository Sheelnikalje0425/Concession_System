package com.railway.concessionsystem.repository;

import com.railway.concessionsystem.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> { // Changed from Long to Integer ✅
    Optional<Staff> findByEmail(String email);
    boolean existsByEmail(String email);
}
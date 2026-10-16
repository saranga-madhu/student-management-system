package com.gamage.student_management.repository;

import com.gamage.student_management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    Optional<Student> findByEmail(String email);
    Optional<Student> findByUserId(Long userId);
}
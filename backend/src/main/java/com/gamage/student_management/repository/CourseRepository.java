package com.gamage.student_management.repository;

import com.gamage.student_management.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCourseCode(String courseCode);
    boolean existsByCourseCodeAndIdNot(String courseCode, Long id);
}
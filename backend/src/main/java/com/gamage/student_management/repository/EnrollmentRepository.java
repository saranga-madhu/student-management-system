package com.gamage.student_management.repository;

import com.gamage.student_management.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("select e from Enrollment e join fetch e.student join fetch e.course where e.student.id = :studentId and e.course.id = :courseId")
    Optional<Enrollment> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("select e from Enrollment e join fetch e.student join fetch e.course where e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") Long studentId);

    @Query("select e from Enrollment e join fetch e.student join fetch e.course where e.course.id = :courseId")
    List<Enrollment> findByCourseId(@Param("courseId") Long courseId);

    void deleteByStudentId(Long studentId);

    void deleteByCourseId(Long courseId);
}

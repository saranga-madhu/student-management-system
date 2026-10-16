package com.gamage.student_management.dto.response;

import com.gamage.student_management.entity.Enrollment;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentEmail,
        Long courseId,
        String courseCode,
        String courseTitle,
        Integer credits,
        LocalDateTime enrolledAt
) {
    public static EnrollmentResponse from(Enrollment e) {
        var student = e.getStudent();
        var course = e.getCourse();
        return new EnrollmentResponse(
                e.getId(),
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getEmail(),
                course.getId(),
                course.getCourseCode(),
                course.getTitle(),
                course.getCredits(),
                e.getEnrolledAt()
        );
    }
}

package com.gamage.student_management.dto.student;

import com.gamage.student_management.entity.Student;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudentResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        LocalDate dateOfBirth,
        LocalDateTime createdAt
) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(s.getId(), s.getFirstName(), s.getLastName(),
                s.getEmail(), s.getPhone(), s.getDateOfBirth(), s.getCreatedAt());
    }
}
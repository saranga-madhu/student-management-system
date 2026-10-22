package com.gamage.student_management.dto.request;

import com.gamage.student_management.validation.ValidationPatterns;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.Period;

public record StudentRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must be at most 50 characters")
        @Pattern(regexp = ValidationPatterns.PERSON_NAME, message = ValidationPatterns.PERSON_NAME_MSG)
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must be at most 50 characters")
        @Pattern(regexp = ValidationPatterns.PERSON_NAME, message = ValidationPatterns.PERSON_NAME_MSG)
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 120, message = "Email must be at most 120 characters")
        String email,

        @Pattern(regexp = ValidationPatterns.PHONE, message = ValidationPatterns.PHONE_MSG)
        String phone,

        LocalDate dateOfBirth
) {

    @AssertTrue(message = "Student age must be between 18 and 30 years")
    public boolean isDateOfBirthValid() {
        if (dateOfBirth == null) {
            return true;
        }
        LocalDate today = LocalDate.now();
        if (dateOfBirth.isAfter(today)) {
            return false;
        }
        int age = Period.between(dateOfBirth, today).getYears();
        return age >= 18 && age <= 30;
    }
}

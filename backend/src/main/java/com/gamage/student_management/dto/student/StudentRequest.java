package com.gamage.student_management.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record StudentRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String phone,
        LocalDate dateOfBirth
) {}
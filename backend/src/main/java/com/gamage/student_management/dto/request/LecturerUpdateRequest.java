package com.gamage.student_management.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LecturerUpdateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email String email,
        @Size(min = 8, max = 100) String password
) {}

package com.gamage.student_management.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CourseRequest(
        @NotBlank String courseCode,
        @NotBlank String title,
        String description,
        @Min(1) Integer credits
) {}
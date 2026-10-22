package com.gamage.student_management.dto.request;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
        @NotNull(message = "Course is required") Long courseId
) {}

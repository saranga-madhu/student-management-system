package com.gamage.student_management.dto.request;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(@NotNull Long courseId) {}

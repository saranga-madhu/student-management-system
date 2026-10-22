package com.gamage.student_management.dto.request;

import com.gamage.student_management.validation.ValidationPatterns;
import jakarta.validation.constraints.*;

public record CourseRequest(
        @NotBlank(message = "Course code is required")
        @Size(min = 2, max = 20, message = "Course code must be between 2 and 20 characters")
        @Pattern(regexp = ValidationPatterns.COURSE_CODE, message = ValidationPatterns.COURSE_CODE_MSG)
        String courseCode,

        @NotBlank(message = "Course title is required")
        @Size(max = 150, message = "Course title must be at most 150 characters")
        String title,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @NotNull(message = "Credits are required")
        @Min(value = 1, message = "Credits must be at least 1")
        @Max(value = 30, message = "Credits must be at most 30")
        Integer credits
) {}

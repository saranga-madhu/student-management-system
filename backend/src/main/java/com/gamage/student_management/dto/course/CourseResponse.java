package com.gamage.student_management.dto.course;

import com.gamage.student_management.entity.Course;

public record CourseResponse(
        Long id,
        String courseCode,
        String title,
        String description,
        Integer credits
) {
    public static CourseResponse from(Course c) {
        return new CourseResponse(c.getId(), c.getCourseCode(), c.getTitle(),
                c.getDescription(), c.getCredits());
    }
}
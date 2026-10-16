package com.gamage.student_management.controller;

import com.gamage.student_management.dto.request.EnrollRequest;
import com.gamage.student_management.dto.response.EnrollmentResponse;
import com.gamage.student_management.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService service;

    @GetMapping("/me")
    public List<EnrollmentResponse> mine(Authentication authentication) {
        return service.myEnrollments(authentication.getName());
    }

    @GetMapping("/course/{courseId}")
    public List<EnrollmentResponse> byCourse(@PathVariable Long courseId) {
        return service.byCourse(courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentResponse enroll(Authentication authentication, @Valid @RequestBody EnrollRequest request) {
        return service.enroll(authentication.getName(), request.courseId());
    }

    @DeleteMapping("/course/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unenroll(Authentication authentication, @PathVariable Long courseId) {
        service.unenroll(authentication.getName(), courseId);
    }
}

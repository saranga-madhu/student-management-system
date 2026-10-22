package com.gamage.student_management;

import com.gamage.student_management.dto.request.CourseRequest;
import com.gamage.student_management.dto.request.LoginRequest;
import com.gamage.student_management.dto.request.RegisterRequest;
import com.gamage.student_management.dto.request.StudentRequest;
import com.gamage.student_management.dto.response.AuthResponse;
import com.gamage.student_management.dto.response.CourseResponse;
import com.gamage.student_management.dto.response.EnrollmentResponse;
import com.gamage.student_management.dto.response.StudentResponse;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.entity.Role;
import com.gamage.student_management.repository.UserRepository;
import com.gamage.student_management.service.AuthService;
import com.gamage.student_management.service.CourseService;
import com.gamage.student_management.service.EnrollmentService;
import com.gamage.student_management.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthAndCoreFlowTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testDefaultAdminInitialized() {
        var admin = userRepository.findByUsername("admin");
        assertTrue(admin.isPresent(), "Default admin user should be initialized");
        assertEquals(Role.ADMIN, admin.get().getRole());
    }

    @Test
    void testRegisterAndLoginStudent() {
        String username = "student_test_" + System.currentTimeMillis();
        String email = username + "@example.com";

        RegisterRequest registerReq = new RegisterRequest(username, "Test Student", email, "password123");
        UserResponse registered = authService.register(registerReq);

        assertNotNull(registered);
        assertEquals(Role.STUDENT, registered.role());
        assertEquals(username, registered.username());

        ResponseStatusException pending = assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest(username, "password123")));
        assertEquals(403, pending.getStatusCode().value());

        var pendingStudent = studentService.getAll().stream()
                .filter(s -> email.equals(s.email()))
                .findFirst()
                .orElseThrow();
        studentService.approve(pendingStudent.id());

        AuthResponse authResp = authService.login(new LoginRequest(username, "password123"));
        assertNotNull(authResp);
        assertNotNull(authResp.token());
        assertEquals(username, authResp.user().username());

        // Login with wrong password
        assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest(username, "wrong_password")));
    }

    @Test
    void testRejectedStudentCannotLogin() {
        String username = "student_reject_" + System.currentTimeMillis();
        String email = username + "@example.com";
        authService.register(new RegisterRequest(username, "Reject Student", email, "password123"));

        var pendingStudent = studentService.getAll().stream()
                .filter(s -> email.equals(s.email()))
                .findFirst()
                .orElseThrow();
        studentService.reject(pendingStudent.id());

        ResponseStatusException rejected = assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest(username, "password123")));
        assertEquals(403, rejected.getStatusCode().value());
    }

    @Test
    void testCourseAndEnrollmentFlow() {
        String code = "CS" + (System.currentTimeMillis() % 10000);
        CourseResponse course = courseService.create(new CourseRequest(code, "Software Engineering", "Intro to SE", 4));
        assertNotNull(course);
        assertEquals(code, course.courseCode());

        String username = "enroll_student_" + System.currentTimeMillis();
        String email = username + "@example.com";
        authService.register(new RegisterRequest(username, "Enrollment Tester", email, "password123"));
        var pendingStudent = studentService.getAll().stream()
                .filter(s -> email.equals(s.email()))
                .findFirst()
                .orElseThrow();
        studentService.approve(pendingStudent.id());

        EnrollmentResponse enrollment = enrollmentService.enroll(username, course.id());
        assertNotNull(enrollment);
        assertEquals(course.id(), enrollment.courseId());

        List<EnrollmentResponse> myEnrollments = enrollmentService.myEnrollments(username);
        assertFalse(myEnrollments.isEmpty());
        assertEquals(course.id(), myEnrollments.get(0).courseId());

        enrollmentService.unenroll(username, course.id());
        assertTrue(enrollmentService.myEnrollments(username).isEmpty());
    }

    @Test
    void testStudentCrud() {
        String email = "student_crud_" + System.currentTimeMillis() + "@example.com";
        StudentResponse student = studentService.create(new StudentRequest(
                "Jane", "Doe", email, "0123456789", LocalDate.of(2000, 1, 1)));

        assertNotNull(student);
        assertEquals("Jane", student.firstName());

        StudentResponse updated = studentService.update(student.id(), new StudentRequest(
                "Janet", "Doe", email, "0123456789", LocalDate.of(2000, 1, 1)));
        assertEquals("Janet", updated.firstName());

        studentService.delete(student.id());
        assertThrows(ResponseStatusException.class, () -> studentService.getById(student.id()));
    }
}

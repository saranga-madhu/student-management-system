package com.gamage.student_management.service;

import com.gamage.student_management.dto.response.EnrollmentResponse;
import com.gamage.student_management.entity.Course;
import com.gamage.student_management.entity.Enrollment;
import com.gamage.student_management.entity.Student;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.CourseRepository;
import com.gamage.student_management.repository.EnrollmentRepository;
import com.gamage.student_management.repository.StudentRepository;
import com.gamage.student_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<EnrollmentResponse> myEnrollments(String username) {
        Student student = requireStudentProfile(username);
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    public List<EnrollmentResponse> byCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + courseId);
        }
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public EnrollmentResponse enroll(String username, Long courseId) {
        Student student = requireStudentProfile(username);
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + courseId));
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already enrolled in this course");
        }
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public void unenroll(String username, Long courseId) {
        Student student = requireStudentProfile(username);
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not enrolled in this course"));
        enrollmentRepository.delete(enrollment);
    }

    private Student requireStudentProfile(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return studentRepository.findByUserId(user.getId()).orElseGet(() -> {
            Student byEmail = studentRepository.findByEmail(user.getEmail()).orElse(null);
            if (byEmail != null) {
                byEmail.setUserId(user.getId());
                return studentRepository.save(byEmail);
            }
            Student created = new Student();
            AuthService.applyName(created, user.getFullName());
            created.setEmail(user.getEmail());
            created.setUserId(user.getId());
            return studentRepository.save(created);
        });
    }
}

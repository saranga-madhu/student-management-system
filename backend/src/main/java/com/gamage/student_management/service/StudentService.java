package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.StudentRequest;
import com.gamage.student_management.dto.response.StudentResponse;
import com.gamage.student_management.entity.Student;
import com.gamage.student_management.repository.EnrollmentRepository;
import com.gamage.student_management.repository.StudentRepository;
import com.gamage.student_management.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository repository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public StudentService(StudentRepository repository,
                          EnrollmentRepository enrollmentRepository,
                          UserRepository userRepository) {
        this.repository = repository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public List<StudentResponse> getAll() {
        return repository.findAll().stream().map(StudentResponse::from).toList();
    }

    public StudentResponse getById(Long id) {
        return StudentResponse.from(findEntity(id));
    }

    public StudentResponse create(StudentRequest req) {
        String email = req.email().trim();
        if (repository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Student student = new Student();
        apply(student, req);
        return StudentResponse.from(repository.save(student));
    }

    public StudentResponse update(Long id, StudentRequest req) {
        Student student = findEntity(id);
        String email = req.email().trim();
        if (repository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        apply(student, req);
        return StudentResponse.from(repository.save(student));
    }

    @Transactional
    public void delete(Long id) {
        Student student = findEntity(id);
        enrollmentRepository.deleteByStudentId(id);
        if (student.getUserId() != null) {
            userRepository.deleteById(student.getUserId());
        }
        repository.deleteById(id);
    }

    private Student findEntity(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + id));
    }

    private void apply(Student student, StudentRequest req) {
        student.setFirstName(req.firstName().trim());
        student.setLastName(req.lastName().trim());
        student.setEmail(req.email().trim());
        student.setPhone(req.phone() != null ? req.phone().trim() : null);
        student.setDateOfBirth(req.dateOfBirth());
    }
}

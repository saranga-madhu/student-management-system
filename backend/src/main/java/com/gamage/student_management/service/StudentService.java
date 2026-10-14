package com.gamage.student_management.service;

import com.gamage.student_management.dto.student.StudentRequest;
import com.gamage.student_management.dto.student.StudentResponse;
import com.gamage.student_management.entity.Student;
import com.gamage.student_management.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<StudentResponse> getAll() {
        return repository.findAll().stream().map(StudentResponse::from).toList();
    }

    public StudentResponse getById(Long id) {
        return StudentResponse.from(findEntity(id));
    }

    public StudentResponse create(StudentRequest req) {
        if (repository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Student student = new Student();
        apply(student, req);
        return StudentResponse.from(repository.save(student));
    }

    public StudentResponse update(Long id, StudentRequest req) {
        Student student = findEntity(id);
        apply(student, req);
        return StudentResponse.from(repository.save(student));
    }

    public void delete(Long id) {
        findEntity(id);
        repository.deleteById(id);
    }

    private Student findEntity(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + id));
    }

    private void apply(Student student, StudentRequest req) {
        student.setFirstName(req.firstName());
        student.setLastName(req.lastName());
        student.setEmail(req.email());
        student.setPhone(req.phone());
        student.setDateOfBirth(req.dateOfBirth());
    }
}
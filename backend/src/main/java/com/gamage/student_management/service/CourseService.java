package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.CourseRequest;
import com.gamage.student_management.dto.response.CourseResponse;
import com.gamage.student_management.entity.Course;
import com.gamage.student_management.repository.CourseRepository;
import com.gamage.student_management.repository.EnrollmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository repository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository repository, EnrollmentRepository enrollmentRepository) {
        this.repository = repository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<CourseResponse> getAll() {
        return repository.findAll().stream().map(CourseResponse::from).toList();
    }

    public CourseResponse getById(Long id) {
        return CourseResponse.from(findEntity(id));
    }

    public CourseResponse create(CourseRequest req) {
        if (repository.existsByCourseCode(req.courseCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course code already exists");
        }
        Course course = new Course();
        apply(course, req);
        return CourseResponse.from(repository.save(course));
    }

    public CourseResponse update(Long id, CourseRequest req) {
        Course course = findEntity(id);
        if (repository.existsByCourseCodeAndIdNot(req.courseCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course code already exists");
        }
        apply(course, req);
        return CourseResponse.from(repository.save(course));
    }

    @Transactional
    public void delete(Long id) {
        findEntity(id);
        enrollmentRepository.deleteByCourseId(id);
        repository.deleteById(id);
    }

    private Course findEntity(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id));
    }

    private void apply(Course course, CourseRequest req) {
        course.setCourseCode(req.courseCode());
        course.setTitle(req.title());
        course.setDescription(req.description());
        course.setCredits(req.credits());
    }
}

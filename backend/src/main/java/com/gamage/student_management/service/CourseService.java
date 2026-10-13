package com.gamage.student_management.service;

import com.gamage.student_management.entity.Course;
import com.gamage.student_management.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class CourseService {

    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    public List<Course> getAll() {
        return repository.findAll();
    }

    public Course getById(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id));
    }

    public Course create(Course course) {
        if (repository.existsByCourseCode(course.getCourseCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course code already exists");
        }
        course.setId(null);
        return repository.save(course);
    }

    public Course update(Long id, Course updated) {
        Course existing = getById(id);
        existing.setCourseCode(updated.getCourseCode());
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCredits(updated.getCredits());
        return repository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }
}
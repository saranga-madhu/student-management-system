package com.gamage.student_management.controller;

import com.gamage.student_management.dto.request.LecturerRequest;
import com.gamage.student_management.dto.request.LecturerUpdateRequest;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.service.LecturerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lecturers")
@CrossOrigin(origins = "http://localhost:3000")
public class LecturerController {

    private final LecturerService service;

    public LecturerController(LecturerService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody LecturerRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody LecturerUpdateRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

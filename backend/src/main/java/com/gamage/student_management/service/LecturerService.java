package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.LecturerRequest;
import com.gamage.student_management.dto.request.LecturerUpdateRequest;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LecturerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LecturerService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAll() {
        return userRepository.findByRoleOrderByFullNameAsc(Role.LECTURER).stream()
                .map(AuthService::toResponse)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponse create(LecturerRequest req) {
        String username = req.username().trim();
        String email = req.email().trim();
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(Role.LECTURER);
        return AuthService.toResponse(userRepository.save(user));
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponse update(Long id, LecturerUpdateRequest req) {
        User user = findLecturer(id);
        String email = req.email().trim();
        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password()));
        }
        return AuthService.toResponse(userRepository.save(user));
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        findLecturer(id);
        userRepository.deleteById(id);
    }

    private User findLecturer(Long id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Lecturer not found: " + id));
        if (user.getRole() != Role.LECTURER) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lecturer not found: " + id);
        }
        return user;
    }
}

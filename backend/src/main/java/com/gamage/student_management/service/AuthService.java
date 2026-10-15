package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.RegisterRequest;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.staff-registration-code}")
    private String staffRegistrationCode;

    public UserResponse register(RegisterRequest req) {
        if (req.role() != Role.STUDENT && !staffRegistrationCode.equals(req.staffCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid staff access code");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setFullName(req.fullName());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(req.role());

        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getFullName(),
                saved.getEmail(), saved.getRole());
    }
}
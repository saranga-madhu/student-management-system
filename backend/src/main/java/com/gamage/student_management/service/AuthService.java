package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.LoginRequest;
import com.gamage.student_management.dto.request.RegisterRequest;
import com.gamage.student_management.dto.response.AuthResponse;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.UserRepository;
import com.gamage.student_management.security.JwtService;
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
    private final JwtService jwtService;

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

        return toResponse(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.username())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return new AuthResponse(jwtService.generateToken(user), toResponse(user));
    }

    public UserResponse getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return toResponse(user);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRole());
    }
}
package com.gamage.student_management.controller;

import com.gamage.student_management.dto.request.LoginRequest;
import com.gamage.student_management.dto.request.ProfileUpdateRequest;
import com.gamage.student_management.dto.request.RegisterRequest;
import com.gamage.student_management.dto.response.AuthResponse;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getByUsername(authentication.getName());
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(Authentication authentication,
                                      @Valid @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(authentication.getName(), request);
    }
}

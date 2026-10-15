package com.gamage.student_management.dto.response;

public record AuthResponse(String token, UserResponse user) {}
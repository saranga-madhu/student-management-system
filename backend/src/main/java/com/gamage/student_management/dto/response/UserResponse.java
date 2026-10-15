package com.gamage.student_management.dto.response;

import com.gamage.student_management.entity.Role;

public record UserResponse(Long id, String username, String fullName, String email, Role role) {}
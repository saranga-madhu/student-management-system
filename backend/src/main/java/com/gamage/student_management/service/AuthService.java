package com.gamage.student_management.service;

import com.gamage.student_management.dto.request.LoginRequest;
import com.gamage.student_management.dto.request.ProfileUpdateRequest;
import com.gamage.student_management.dto.request.RegisterRequest;
import com.gamage.student_management.dto.response.AuthResponse;
import com.gamage.student_management.dto.response.UserResponse;
import com.gamage.student_management.entity.AccountStatus;
import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.Student;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.StudentRepository;
import com.gamage.student_management.repository.UserRepository;
import com.gamage.student_management.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
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
        user.setRole(Role.STUDENT);
        user = userRepository.save(user);

        linkOrCreateStudent(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        String username = req.username().trim();
        User user = userRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        assertStudentCanLogin(user);
        return new AuthResponse(jwtService.generateToken(user), toResponse(user));
    }

    public UserResponse getByUsername(String username) {
        return toResponse(findByUsername(username));
    }

    @Transactional
    public UserResponse updateProfile(String username, ProfileUpdateRequest req) {
        User user = findByUsername(username);
        if (userRepository.existsByEmailAndIdNot(req.email(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        studentRepository.findByUserId(user.getId()).ifPresent(student -> {
            if (studentRepository.existsByEmailAndIdNot(req.email().trim(), student.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            applyName(student, req.fullName().trim());
            student.setEmail(req.email().trim());
            studentRepository.save(student);
        });

        user.setFullName(req.fullName().trim());
        user.setEmail(req.email().trim());
        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password()));
        }
        return toResponse(userRepository.save(user));
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void linkOrCreateStudent(User user) {
        Student existing = studentRepository.findByEmail(user.getEmail()).orElse(null);
        if (existing != null) {
            if (existing.getUserId() != null && !existing.getUserId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
            }
            existing.setUserId(user.getId());
            applyName(existing, user.getFullName());
            studentRepository.save(existing);
            return;
        }

        Student student = new Student();
        applyName(student, user.getFullName());
        student.setEmail(user.getEmail());
        student.setUserId(user.getId());
        student.setStatus(AccountStatus.PENDING);
        studentRepository.save(student);
    }

    private void assertStudentCanLogin(User user) {
        if (user.getRole() != Role.STUDENT) {
            return;
        }
        Student student = studentRepository.findByUserId(user.getId())
                .or(() -> studentRepository.findByEmail(user.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Student profile was not found. Contact an administrator."));
        AccountStatus status = student.getStatus() == null ? AccountStatus.APPROVED : student.getStatus();
        if (status == AccountStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your registration is pending admin approval. You cannot sign in yet.");
        }
        if (status == AccountStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your registration was rejected. Contact an administrator.");
        }
    }

    static void applyName(Student student, String fullName) {
        String trimmed = fullName.trim();
        int space = trimmed.indexOf(' ');
        if (space < 0) {
            student.setFirstName(trimmed);
            student.setLastName(trimmed);
        } else {
            student.setFirstName(trimmed.substring(0, space));
            student.setLastName(trimmed.substring(space + 1).trim());
        }
    }

    static UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRole());
    }
}

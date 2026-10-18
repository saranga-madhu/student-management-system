package com.gamage.student_management;

import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class StudentManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudentManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner initDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByRoleOrderByFullNameAsc(Role.ADMIN).isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setFullName("System Administrator");
				admin.setEmail("admin@university.edu");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);
				userRepository.save(admin);
			}
		};
	}
}

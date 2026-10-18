package com.gamage.student_management;

import com.gamage.student_management.entity.Role;
import com.gamage.student_management.entity.User;
import com.gamage.student_management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class StudentManagementApplication {

	private static final Logger log = LoggerFactory.getLogger(StudentManagementApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(StudentManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner initDefaultAdmin(UserRepository userRepository,
	                                   PasswordEncoder passwordEncoder,
	                                   @Value("${app.admin.username:admin}") String adminUsername,
	                                   @Value("${app.admin.password:}") String adminPassword) {
		return args -> {
			if (!userRepository.findByRoleOrderByFullNameAsc(Role.ADMIN).isEmpty()) {
				return;
			}
			if (adminPassword == null || adminPassword.isBlank()) {
				log.warn("No administrator exists and ADMIN_PASSWORD is not set; skipping admin seeding");
				return;
			}
			User admin = new User();
			admin.setUsername(adminUsername);
			admin.setFullName("System Administrator");
			admin.setEmail("admin@university.edu");
			admin.setPassword(passwordEncoder.encode(adminPassword));
			admin.setRole(Role.ADMIN);
			userRepository.save(admin);
			log.info("Initial administrator '{}' created", adminUsername);
		};
	}
}
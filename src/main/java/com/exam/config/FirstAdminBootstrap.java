package com.exam.config;

import com.exam.entities.RoleType;
import com.exam.repositories.UserRepository;
import com.exam.service.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Optional bootstrap: if no admin exists and app.first-admin.user-id is set,
 * assign ROLE_ADMIN to that user (e.g. first run). Set in application.properties:
 * app.first-admin.user-id=1
 */
@Component
@RequiredArgsConstructor
public class FirstAdminBootstrap implements ApplicationRunner {

    private final IAdminService adminService;
    private final UserRepository userRepository;
    private final Environment env;

    @Override
    public void run(ApplicationArguments args) {
        String raw = env.getProperty("app.first-admin.user-id");
        if (raw == null || raw.isBlank()) return;

        int userId;
        try {
            userId = Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return;
        }

        boolean anyAdmin = userRepository.findAll().stream()
                .anyMatch(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getType() == RoleType.ROLE_ADMIN));

        if (anyAdmin) return;

        try {
            adminService.assignAdminRole(userId);
            // Log if you have a logger
        } catch (Exception ignored) {
            // User may not exist; ignore
        }
    }
}

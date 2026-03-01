package com.exam.controller;

import com.exam.dto.ApiResponse;
import com.exam.dto.UserResponse;
import com.exam.service.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;

    /**
     * Get all users (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Get user by ID (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    /**
     * Assign admin role to a user (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @PostMapping("/users/{userId}/assign-admin")
    public ResponseEntity<ApiResponse> assignAdminRole(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.assignAdminRole(userId));
    }

    /**
     * Remove admin role from a user (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @PostMapping("/users/{userId}/remove-admin")
    public ResponseEntity<ApiResponse> removeAdminRole(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.removeAdminRole(userId));
    }

    /**
     * Block a user (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @PostMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse> blockUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.blockUser(userId));
    }

    /**
     * Unblock a user (Admin only)
     * Requires: Authorization header with JWT token and ADMIN role
     */
    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse> unblockUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.unblockUser(userId));
    }
}

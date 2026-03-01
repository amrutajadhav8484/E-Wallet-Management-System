package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.UserResponse;
import com.exam.entities.Role;
import com.exam.entities.RoleType;
import com.exam.entities.User;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repositories.RoleRepository;
import com.exam.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        return mapToUserResponse(user);
    }

    @Override
    public ApiResponse assignAdminRole(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        
        Role adminRole = roleRepository.findByType(RoleType.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setType(RoleType.ROLE_ADMIN);
                    return roleRepository.save(newRole);
                });
        
        if (!user.getRoles().contains(adminRole)) {
            user.getRoles().add(adminRole);
            userRepository.save(user);
        }
        
        return new ApiResponse("Admin role assigned successfully", true);
    }

    @Override
    public ApiResponse removeAdminRole(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        
        Role adminRole = roleRepository.findByType(RoleType.ROLE_ADMIN)
                .orElse(null);
        
        if (adminRole != null && user.getRoles().contains(adminRole)) {
            user.getRoles().remove(adminRole);
            userRepository.save(user);
        }
        
        return new ApiResponse("Admin role removed successfully", true);
    }

    @Override
    public ApiResponse blockUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        if (user.getActive() != null && !user.getActive()) {
            return new ApiResponse("User is already blocked", true);
        }
        user.setActive(false);
        userRepository.save(user);
        return new ApiResponse("User blocked successfully", true);
    }

    @Override
    public ApiResponse unblockUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        if (user.getActive() != null && user.getActive()) {
            return new ApiResponse("User is already active", true);
        }
        user.setActive(true);
        userRepository.save(user);
        return new ApiResponse("User unblocked successfully", true);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setMobile(user.getMobile());
        response.setActive(user.getActive() == null || user.getActive());
        if (user.getWallet() != null) {
            response.setWalletId(user.getWallet().getWalletId());
            response.setWalletBalance(user.getWallet().getBalance());
        }
        return response;
    }
}

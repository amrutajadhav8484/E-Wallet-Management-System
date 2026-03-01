package com.exam.service;

import com.exam.dto.*;
import java.util.List;

public interface IAdminService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Integer userId);
    ApiResponse assignAdminRole(Integer userId);
    ApiResponse removeAdminRole(Integer userId);
    ApiResponse blockUser(Integer userId);
    ApiResponse unblockUser(Integer userId);
}

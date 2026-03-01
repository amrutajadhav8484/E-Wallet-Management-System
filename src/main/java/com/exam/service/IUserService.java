package com.exam.service;

import com.exam.dto.*;

public interface IUserService {
    ApiResponse registerUser(SignupRequest request);
    LoginResponse loginUser(LoginRequest request);
    UserResponse getUserProfile(Integer userId);
    ApiResponse updateProfile(Integer userId, UpdateProfileRequest request);
    ApiResponse changePassword(Integer userId, ChangePasswordRequest request);
    ForgotPasswordResponse requestPasswordReset(String mobile);
    ApiResponse resetPassword(ResetPasswordRequest request);
}
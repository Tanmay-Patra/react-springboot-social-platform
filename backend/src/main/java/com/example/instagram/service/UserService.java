package com.example.instagram.service;

import com.example.instagram.dto.ChangePasswordRequest;
import com.example.instagram.dto.PasswordChangeRequest;
import com.example.instagram.dto.PasswordResetRequest;
import com.example.instagram.dto.ProfileStatsDto;
import com.example.instagram.dto.ResetPasswordByEmailRequest;
import com.example.instagram.dto.UserLoginRequest;
import com.example.instagram.dto.UserRegistrationRequest;
import com.example.instagram.dto.UserResponse;
import com.example.instagram.dto.UserUpdateRequest;
import com.example.instagram.entity.PasswordResetToken;
import com.example.instagram.entity.User;
import com.example.instagram.exception.BadRequestException;
import com.example.instagram.exception.ConflictException;
import com.example.instagram.exception.NotFoundException;
import com.example.instagram.repository.FollowRepository;
import com.example.instagram.repository.PasswordResetTokenRepository;
import com.example.instagram.repository.PostRepository;
import com.example.instagram.repository.UserRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserResponse register(UserRegistrationRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        userRepository.findByUsername(request.getUsername())
                .ifPresent(u -> {
                    throw new ConflictException("Username already taken");
                });

        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new ConflictException("Email already registered");
                });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profilePictureUrl(request.getProfilePictureUrl())
                .bio(request.getBio())
                .build();

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @CircuitBreaker(name = "loginCircuitBreaker")
    public UserResponse login(UserLoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        return toResponse(user);
    }

    public UserResponse getById(Long id) {
        return userRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public UserResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found with email"));

        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                .used(false)
                .build();

        passwordResetTokenRepository.save(token);
    }

    public void resetPassword(PasswordChangeRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new NotFoundException("Invalid reset token"));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token is expired or already used");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        token.setUsed(true);

        userRepository.save(user);
        passwordResetTokenRepository.save(token);
    }

    public void validateEmailExists(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("No account found with this email"));
    }

    public void resetPasswordByEmail(ResetPasswordByEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found with this email"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public ProfileStatsDto getProfileStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        long postCount = postRepository.countByUser_Id(userId);
        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        return ProfileStatsDto.builder()
                .postCount(postCount)
                .followerCount(followerCount)
                .followingCount(followingCount)
                .build();
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }
}


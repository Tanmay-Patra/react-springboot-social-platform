package com.example.instagram.controller;

import com.example.instagram.dto.PasswordChangeRequest;
import com.example.instagram.dto.PasswordResetRequest;
import com.example.instagram.dto.ResetPasswordByEmailRequest;
import com.example.instagram.dto.UserLoginRequest;
import com.example.instagram.dto.UserRegistrationRequest;
import com.example.instagram.dto.UserResponse;
import com.example.instagram.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/password/reset-request")
    public ResponseEntity<Void> requestReset(@Valid @RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/validate-email")
    public ResponseEntity<Void> validateEmail(@Valid @RequestBody PasswordResetRequest request) {
        userService.validateEmailExists(request.getEmail());
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/password/reset-by-email")
    public ResponseEntity<Void> resetPasswordByEmail(@Valid @RequestBody ResetPasswordByEmailRequest request) {
        userService.resetPasswordByEmail(request);
        return ResponseEntity.ok().build();
    }
}


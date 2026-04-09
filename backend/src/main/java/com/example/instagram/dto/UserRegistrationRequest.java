package com.example.instagram.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationRequest {

    @NotBlank
    @Pattern(regexp = "([A-Z][a-zA-Z]*)( [A-Z][a-zA-Z]*)*", message = "Full name must have capitalized words")
    private String fullName;

    @NotBlank
    @Email(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.(com|org|in)$")
    private String email;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9._-]{3,50}$", message = "Username can contain lowercase letters, digits and ._-")
    private String username;

    @NotBlank
    @Size(min = 8, max = 16)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,16}$",
            message = "Password must contain lowercase, uppercase, digit, special character")
    private String password;

    @NotBlank
    private String confirmPassword;

    private String profilePictureUrl;

    @Size(max = 255)
    private String bio;
}


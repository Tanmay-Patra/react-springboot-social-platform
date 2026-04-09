package com.example.instagram.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {

    @Pattern(regexp = "([A-Z][a-zA-Z]*)( [A-Z][a-zA-Z]*)*", message = "Full name must have capitalized words")
    @Size(max = 100)
    private String fullName;

    private String profilePictureUrl;

    @Size(max = 255)
    private String bio;
}

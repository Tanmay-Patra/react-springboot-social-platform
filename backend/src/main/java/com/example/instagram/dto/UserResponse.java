package com.example.instagram.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String username;
    private String bio;
    private String profilePictureUrl;
}


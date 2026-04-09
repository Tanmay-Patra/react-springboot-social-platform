package com.example.instagram.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long userId;
    private String username;
    private String text;
    private Instant createdAt;
}

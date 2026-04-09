package com.example.instagram.dto;

import com.example.instagram.entity.PostPrivacy;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class PostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String profilePictureUrl;
    private String caption;
    private PostPrivacy privacy;
    private Instant publishedAt;
    private long likeCount;
    private long commentCount;
    private List<String> mediaUrls;
    private List<String> mediaTypes;
    private List<String> hashtags;
}


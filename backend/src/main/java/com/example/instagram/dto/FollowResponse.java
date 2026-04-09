package com.example.instagram.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FollowResponse {

    private Long followerId;
    private Long followingId;
}


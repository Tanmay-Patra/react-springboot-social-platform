package com.example.instagram.controller;

import com.example.instagram.dto.FollowResponse;
import com.example.instagram.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{followerId}/{followingId}")
    public ResponseEntity<FollowResponse> follow(@PathVariable Long followerId,
                                                 @PathVariable Long followingId) {
        return ResponseEntity.ok(followService.follow(followerId, followingId));
    }

    @DeleteMapping("/{followerId}/{followingId}")
    public ResponseEntity<Void> unfollow(@PathVariable Long followerId,
                                         @PathVariable Long followingId) {
        followService.unfollow(followerId, followingId);
        return ResponseEntity.noContent().build();
    }
}


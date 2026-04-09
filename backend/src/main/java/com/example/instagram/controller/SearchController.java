package com.example.instagram.controller;

import com.example.instagram.dto.PostResponse;
import com.example.instagram.dto.UserResponse;
import com.example.instagram.service.PostService;
import com.example.instagram.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    private final PostService postService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/hashtags")
    public ResponseEntity<List<PostResponse>> searchHashtags(
            @RequestParam String hashtag,
            @RequestParam(required = false) Long viewerId) {
        return ResponseEntity.ok(postService.searchByHashtag(hashtag, viewerId));
    }
}


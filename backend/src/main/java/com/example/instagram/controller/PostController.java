package com.example.instagram.controller;

import com.example.instagram.dto.PostCreateRequest;
import com.example.instagram.dto.PostResponse;
import com.example.instagram.entity.PostPrivacy;
import com.example.instagram.service.FileStorageService;
import com.example.instagram.service.LikeService;
import com.example.instagram.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LikeService likeService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @PathVariable Long userId,
            @RequestParam String caption,
            @RequestParam(required = false, defaultValue = "PUBLIC") String privacy,
            @RequestParam(required = false) String hashtags,
            @RequestParam("media") MultipartFile[] media) {
        List<String> paths = fileStorageService.storeAll(media);
        if (paths.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<String> hashtagList = (hashtags == null || hashtags.isBlank())
                ? Collections.emptyList()
                : Arrays.stream(hashtags.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> s.startsWith("#") ? s.substring(1) : s)
                        .collect(Collectors.toList());
        PostCreateRequest request = new PostCreateRequest();
        request.setCaption(caption.trim());
        request.setPrivacy(PostPrivacy.valueOf(privacy.toUpperCase()));
        request.setMediaUrls(paths);
        request.setHashtags(hashtagList);
        return ResponseEntity.ok(postService.createPost(userId, request));
    }

    @GetMapping("/feed/{userId}")
    public ResponseEntity<List<PostResponse>> getFeed(
            @PathVariable Long userId,
            @RequestParam(required = false) Long viewerId) {
        return ResponseEntity.ok(postService.getFeedForUser(userId, viewerId));
    }

    @GetMapping("/home-feed/{userId}")
    public ResponseEntity<List<PostResponse>> getHomeFeed(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getHomeFeedForUser(userId));
    }

    @GetMapping("/search/hashtag")
    public ResponseEntity<List<PostResponse>> searchByHashtag(
            @RequestParam String hashtag,
            @RequestParam(required = false) Long viewerId) {
        return ResponseEntity.ok(postService.searchByHashtag(hashtag, viewerId));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PostResponse>> trending(
            @RequestParam(required = false) Long viewerId) {
        return ResponseEntity.ok(postService.trending(viewerId));
    }

    @DeleteMapping("/{userId}/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long userId, @PathVariable Long postId) {
        postService.deletePost(userId, postId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{postId}/like/{userId}")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, @PathVariable Long userId) {
        likeService.likePost(userId, postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/unlike/{userId}")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId, @PathVariable Long userId) {
        likeService.unlikePost(userId, postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<List<Long>> getLikedPostIds(@PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getLikedPostIds(userId));
    }
}


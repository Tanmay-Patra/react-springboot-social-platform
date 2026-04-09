package com.example.instagram.service;

import com.example.instagram.entity.Post;
import com.example.instagram.entity.PostLike;
import com.example.instagram.entity.User;
import com.example.instagram.exception.NotFoundException;
import com.example.instagram.repository.PostLikeRepository;
import com.example.instagram.repository.PostRepository;
import com.example.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public void likePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        postLikeRepository.findByPostAndUser(post, user)
                .ifPresent(existing -> {
                    throw new NotFoundException("Already liked");
                });

        PostLike like = PostLike.builder()
                .post(post)
                .user(user)
                .build();
        postLikeRepository.save(like);

        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }

    @Transactional
    public void unlikePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        PostLike like = postLikeRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new NotFoundException("Like not found"));
        postLikeRepository.delete(like);

        long newCount = Math.max(0, post.getLikeCount() - 1);
        post.setLikeCount(newCount);
        postRepository.save(post);
    }

    public List<Long> getLikedPostIds(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return postLikeRepository.findLikedPostIdsByUserId(userId);
    }
}


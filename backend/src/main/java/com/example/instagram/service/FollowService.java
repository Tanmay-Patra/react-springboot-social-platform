package com.example.instagram.service;

import com.example.instagram.dto.FollowResponse;
import com.example.instagram.entity.Follow;
import com.example.instagram.entity.User;
import com.example.instagram.exception.NotFoundException;
import com.example.instagram.repository.FollowRepository;
import com.example.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public FollowResponse follow(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new NotFoundException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException("User to follow not found"));

        followRepository.findByFollowerAndFollowing(follower, following)
                .ifPresent(existing -> {
                    throw new NotFoundException("Already following");
                });

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();
        followRepository.save(follow);

        return FollowResponse.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new NotFoundException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new NotFoundException("User to unfollow not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new NotFoundException("Follow not found"));
        followRepository.delete(follow);
    }
}


package com.example.instagram.repository;

import com.example.instagram.entity.Follow;
import com.example.instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    long countByFollower(User follower);

    long countByFollowing(User following);

    List<Follow> findByFollower(User follower);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
}


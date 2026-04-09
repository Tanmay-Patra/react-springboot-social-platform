package com.example.instagram.repository;

import com.example.instagram.entity.Post;
import com.example.instagram.entity.PostLike;
import com.example.instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostAndUser(Post post, User user);

    long countByPost(Post post);

    List<PostLike> findByUser(User user);

    @Query("select pl.post.id from PostLike pl where pl.user.id = :userId")
    List<Long> findLikedPostIdsByUserId(@Param("userId") Long userId);
}


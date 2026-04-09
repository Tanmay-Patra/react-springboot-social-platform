package com.example.instagram.repository;

import com.example.instagram.entity.Post;
import com.example.instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserOrderByPublishedAtDesc(User user);

    List<Post> findByUser_IdInOrderByPublishedAtDesc(List<Long> userIds);

    @Query("select p from Post p join p.hashtags h where lower(h.name) = lower(:hashtag) order by p.publishedAt desc")
    List<Post> findByHashtag(@Param("hashtag") String hashtag);

    @Query("select p from Post p order by p.likeCount desc, p.publishedAt desc")
    List<Post> findTrending();

    long countByUser_Id(Long userId);
}


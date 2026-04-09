package com.example.instagram.repository;

import com.example.instagram.entity.Comment;
import com.example.instagram.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
}

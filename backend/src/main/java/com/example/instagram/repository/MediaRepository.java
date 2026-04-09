package com.example.instagram.repository;

import com.example.instagram.entity.Media;
import com.example.instagram.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByPost(Post post);
}


package com.example.instagram.repository;

import com.example.instagram.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    Optional<Hashtag> findByNameIgnoreCase(String name);
}


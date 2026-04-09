package com.example.instagram.dto;

import com.example.instagram.entity.PostPrivacy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PostCreateRequest {

    @NotBlank
    private String caption;

    @NotEmpty
    private List<String> mediaUrls;

    private List<String> hashtags;

    private PostPrivacy privacy = PostPrivacy.PUBLIC;
}


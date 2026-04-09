package com.example.instagram.service;

import com.example.instagram.dto.CommentRequest;
import com.example.instagram.dto.CommentResponse;
import com.example.instagram.entity.Comment;
import com.example.instagram.entity.Post;
import com.example.instagram.entity.User;
import com.example.instagram.exception.NotFoundException;
import com.example.instagram.repository.CommentRepository;
import com.example.instagram.repository.PostRepository;
import com.example.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse addComment(Long userId, Long postId, CommentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .text(request.getText())
                .build();

        Comment saved = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return toResponse(saved);
    }

    public List<CommentResponse> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        return commentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new NotFoundException("Comment not found for this user");
        }
        Post post = comment.getPost();
        commentRepository.delete(comment);
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

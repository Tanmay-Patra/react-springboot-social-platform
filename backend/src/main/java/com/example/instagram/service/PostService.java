package com.example.instagram.service;

import com.example.instagram.dto.PostCreateRequest;
import com.example.instagram.dto.PostResponse;
import com.example.instagram.entity.Follow;
import com.example.instagram.entity.Hashtag;
import com.example.instagram.entity.Media;
import com.example.instagram.entity.MediaType;
import com.example.instagram.entity.Post;
import com.example.instagram.entity.User;
import com.example.instagram.exception.NotFoundException;
import com.example.instagram.entity.PostPrivacy;
import com.example.instagram.repository.FollowRepository;
import com.example.instagram.repository.HashtagRepository;
import com.example.instagram.repository.MediaRepository;
import com.example.instagram.repository.PostRepository;
import com.example.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final HashtagRepository hashtagRepository;
    private final FollowRepository followRepository;

    @Transactional
    public PostResponse createPost(Long userId, PostCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Post post = Post.builder()
                .user(user)
                .caption(request.getCaption())
                .privacy(request.getPrivacy())
                .publishedAt(Instant.now())
                .build();

        List<Media> mediaList = new ArrayList<>();
        int index = 0;
        for (String url : request.getMediaUrls()) {
            Media media = Media.builder()
                    .post(post)
                    .url(url)
                    .mediaType(guessMediaType(url))
                    .position(index++)
                    .build();
            mediaList.add(media);
        }
        post.setMediaList(mediaList);

        List<Hashtag> hashtags = new ArrayList<>();
        if (request.getHashtags() != null) {
            for (String raw : request.getHashtags()) {
                String name = raw.startsWith("#") ? raw.substring(1) : raw;
                Hashtag hashtag = hashtagRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> hashtagRepository.save(Hashtag.builder().name(name).build()));
                hashtags.add(hashtag);
            }
        }
        post.setHashtags(hashtags);

        Post saved = postRepository.save(post);
        return toResponse(saved);
    }

    public List<PostResponse> getFeedForUser(Long ownerUserId, Long viewerUserId) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        List<Post> posts = postRepository.findByUserOrderByPublishedAtDesc(owner);
        if (viewerUserId == null) {
            return posts.stream()
                    .filter(p -> p.getPrivacy() == PostPrivacy.PUBLIC)
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        if (ownerUserId.equals(viewerUserId)) {
            return posts.stream().map(this::toResponse).collect(Collectors.toList());
        }
        boolean viewerFollowsOwner = followRepository.existsByFollowerIdAndFollowingId(viewerUserId, ownerUserId);
        return posts.stream()
                .filter(p -> canViewPost(p, ownerUserId, viewerUserId, viewerFollowsOwner))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PostResponse> getHomeFeedForUser(Long viewerUserId) {
        User viewer = userRepository.findById(viewerUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        List<Long> authorIds = new ArrayList<>();
        authorIds.add(viewerUserId);
        List<Follow> following = followRepository.findByFollower(viewer);
        for (Follow f : following) {
            authorIds.add(f.getFollowing().getId());
        }
        List<Post> posts = postRepository.findByUser_IdInOrderByPublishedAtDesc(authorIds);
        return posts.stream()
                .filter(p -> canViewPostForHomeFeed(p, viewerUserId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean canViewPostForHomeFeed(Post post, Long viewerId) {
        Long ownerId = post.getUser().getId();
        if (ownerId.equals(viewerId)) return true;
        return canViewPost(post, ownerId, viewerId, true);
    }

    public List<PostResponse> searchByHashtag(String hashtag, Long viewerUserId) {
        List<Post> posts = postRepository.findByHashtag(hashtag);
        if (viewerUserId == null) {
            return posts.stream()
                    .filter(p -> p.getPrivacy() == PostPrivacy.PUBLIC)
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return posts.stream()
                .filter(p -> canViewPostForSearch(p, viewerUserId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PostResponse> trending(Long viewerUserId) {
        List<Post> posts = postRepository.findTrending();
        return posts.stream()
                .filter(p -> p.getPrivacy() == PostPrivacy.PUBLIC)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean canViewPost(Post post, Long ownerId, Long viewerId, boolean viewerFollowsOwner) {
        if (post.getPrivacy() == PostPrivacy.PUBLIC) return true;
        if (post.getPrivacy() == PostPrivacy.PRIVATE) return ownerId.equals(viewerId);
        if (post.getPrivacy() == PostPrivacy.FOLLOWERS_ONLY) return viewerFollowsOwner;
        return false;
    }

    private boolean canViewPostForSearch(Post post, Long viewerId) {
        if (post.getPrivacy() == PostPrivacy.PUBLIC) return true;
        if (post.getPrivacy() == PostPrivacy.PRIVATE) return post.getUser().getId().equals(viewerId);
        if (post.getPrivacy() == PostPrivacy.FOLLOWERS_ONLY) {
            return followRepository.existsByFollowerIdAndFollowingId(viewerId, post.getUser().getId());
        }
        return false;
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        if (!post.getUser().getId().equals(userId)) {
            throw new NotFoundException("Post not found for this user");
        }
        mediaRepository.deleteAll(post.getMediaList());
        postRepository.delete(post);
    }

    private MediaType guessMediaType(String url) {
        String path = url.contains("?") ? url.substring(0, url.indexOf('?')) : url;
        String lower = path.toLowerCase();
        if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi") || lower.endsWith(".webm")) {
            return MediaType.VIDEO;
        }
        return MediaType.IMAGE;
    }

    private PostResponse toResponse(Post post) {
        List<String> mediaUrls = post.getMediaList().stream()
                .map(Media::getUrl)
                .collect(Collectors.toList());
        List<String> mediaTypes = post.getMediaList().stream()
                .map(m -> m.getMediaType().name())
                .collect(Collectors.toList());
        List<String> hashtags = post.getHashtags().stream()
                .map(Hashtag::getName)
                .collect(Collectors.toList());
        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .profilePictureUrl(post.getUser().getProfilePictureUrl())
                .caption(post.getCaption())
                .privacy(post.getPrivacy())
                .publishedAt(post.getPublishedAt())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .mediaUrls(mediaUrls)
                .mediaTypes(mediaTypes)
                .hashtags(hashtags)
                .build();
    }
}


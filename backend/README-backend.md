## Instagram Backend (Spring Boot)

This project implements the backend for the Instagram SRS using **Spring Boot + Maven**, **MySQL**, **JPA**, **Resilience4j**, and **Lombok**.

### Package structure

- `com.example.instagram.entity`: JPA entities (7 total)
  - `User`, `Post`, `Media`, `PostLike`, `Follow`, `Hashtag`, `PasswordResetToken`
  - `BaseEntity` is a mapped superclass for `created_at` / `updated_at`.
- `com.example.instagram.dto`: Request/response DTOs
  - `UserRegistrationRequest`, `UserLoginRequest`, `UserResponse`
  - `PostCreateRequest`, `PostResponse`
  - `FollowResponse`
  - `PasswordResetRequest`, `PasswordChangeRequest`
- `com.example.instagram.repository`: Spring Data JPA repositories for all entities
- `com.example.instagram.service`: Business logic
  - `UserService`: register, login (with Resilience4j circuit breaker), search users, password reset
  - `PostService`: create post (photos/videos with hashtags and privacy), feed, search by hashtag, trending, delete post
  - `LikeService`: like / unlike posts
  - `FollowService`: follow / unfollow users
- `com.example.instagram.controller`: REST APIs
  - `AuthController`, `PostController`, `FollowController`, `SearchController`
- `com.example.instagram.exception`: Custom exceptions and `GlobalExceptionHandler`
- `database/schema.sql`: MySQL DDL for all entities and join tables

### Key endpoints (examples)

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/password/reset-request`
  - `POST /api/auth/password/reset`
- Posts:
  - `POST /api/posts/{userId}`
  - `GET /api/posts/feed/{userId}`
  - `GET /api/posts/search/hashtag?hashtag=#tag`
  - `GET /api/posts/trending`
  - `DELETE /api/posts/{userId}/{postId}`
  - `POST /api/posts/{postId}/like/{userId}`
  - `POST /api/posts/{postId}/unlike/{userId}`
- Follow:
  - `POST /api/follow/{followerId}/{followingId}`
  - `DELETE /api/follow/{followerId}/{followingId}`
- Search:
  - `GET /api/search/users?q=...`
  - `GET /api/search/hashtags?hashtag=...`


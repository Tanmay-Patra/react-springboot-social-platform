export interface User {
  id: number;
  fullName: string;
  email: string;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
}

export interface Post {
  id: number;
  userId: number;
  username: string;
  profilePictureUrl?: string;
  caption: string;
  privacy: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  mediaUrls: string[];
  mediaTypes?: string[];
  hashtags: string[];
}

export interface FollowResponse {
  followerId: number;
  followingId: number;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  text: string;
  createdAt: string;
}

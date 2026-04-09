import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { commentsApi, getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post, Comment } from '../types';

type Props = {
  post: Post;
  currentUserId?: number;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  liked?: boolean;
  onDelete?: (postId: number) => void;
  showDelete?: boolean;
};

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onUnlike,
  liked,
  onDelete,
  showDelete,
}: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const hasMultipleMedia = (post.mediaUrls?.length ?? 0) > 1;

  const published = new Date(post.publishedAt).toLocaleString();

  const loadComments = async () => {
    if (!showComments) return;
    setLoadingComments(true);
    try {
      const { data } = await commentsApi.getByPost(post.id);
      setComments(data);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [showComments, post.id]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await commentsApi.add(user.id, post.id, commentText.trim());
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const isVideoUrl = (url: string, index: number) => {
    if (post.mediaTypes && post.mediaTypes[index] === 'VIDEO') return true;
    const path = url.includes('?') ? url.substring(0, url.indexOf('?')) : url;
    const lower = path.toLowerCase();
    return (
      lower.endsWith('.mp4') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.avi') ||
      lower.endsWith('.webm') ||
      lower.includes('/video/')
    );
  };

  return (
    <article className="post-card mb-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <Link to={`/profile/${post.userId}`} className="text-decoration-none d-flex align-items-center gap-3">
            <div
              className="profile-avatar rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                fontSize: '15px',
                color: '#fff',
              }}
            >
              {post.profilePictureUrl ? (
                <img
                  src={
                    post.profilePictureUrl.startsWith('http') || post.profilePictureUrl.startsWith('data:')
                      ? post.profilePictureUrl
                      : getMediaUrl(post.profilePictureUrl)
                  }
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                post.username.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <span className="fw-semibold" style={{ color: 'var(--color-text)' }}>@{post.username}</span>
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>{published}</span>
            </div>
          </Link>
          <button className="btn btn-link text-muted p-0" title="More options">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </button>
        </div>
        
        {post.mediaUrls?.length ? (
          <div className="post-media position-relative">
            {hasMultipleMedia ? (
              <>
                <div className="post-carousel-slide">
                  {post.mediaUrls.map((url, i) => {
                    const mediaSrc = url.startsWith('http') || url.startsWith('data:') ? url : getMediaUrl(url);
                    const isVideo = isVideoUrl(url, i);
                    return (
                      <div
                        key={i}
                        className="media-container"
                        style={{
                          display: i === carouselIndex ? 'block' : 'none',
                          maxHeight: 600,
                          backgroundColor: '#000',
                        }}
                      >
                        {isVideo ? (
                          <video
                            src={mediaSrc}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-100"
                            style={{ maxHeight: 600, objectFit: 'contain', display: 'block' }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={mediaSrc}
                            alt={`Post ${i + 1}`}
                            className="w-100"
                            style={{ maxHeight: 600, objectFit: 'contain', display: 'block' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="post-carousel-btn post-carousel-prev"
                  onClick={() => setCarouselIndex((prev) => (prev <= 0 ? post.mediaUrls!.length - 1 : prev - 1))}
                  aria-label="Previous"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="post-carousel-btn post-carousel-next"
                  onClick={() => setCarouselIndex((prev) => (prev >= post.mediaUrls!.length - 1 ? 0 : prev + 1))}
                  aria-label="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
                <div className="post-carousel-dots">
                  {post.mediaUrls.map((_, i) => (
                    <span
                      key={i}
                      className={`post-carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setCarouselIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="media-container" style={{ maxHeight: 600, backgroundColor: '#000' }}>
                {isVideoUrl(post.mediaUrls[0], 0) ? (
                  <video
                    src={post.mediaUrls[0].startsWith('http') || post.mediaUrls[0].startsWith('data:') ? post.mediaUrls[0] : getMediaUrl(post.mediaUrls[0])}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-100"
                    style={{ maxHeight: 600, objectFit: 'contain', display: 'block' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={post.mediaUrls[0].startsWith('http') || post.mediaUrls[0].startsWith('data:') ? post.mediaUrls[0] : getMediaUrl(post.mediaUrls[0])}
                    alt="Post"
                    className="w-100"
                    style={{ maxHeight: 600, objectFit: 'contain', display: 'block' }}
                  />
                )}
              </div>
            )}
          </div>
        ) : null}

        <div className="card-body py-3">
          <div className="post-card-actions mb-2">
            {currentUserId != null && (onLike || onUnlike) && (
              <button
                type="button"
                className={`post-card-action-btn ${liked ? 'liked' : ''}`}
                onClick={() => (liked ? onUnlike?.(post.id) : onLike?.(post.id))}
                title={liked ? 'Unlike' : 'Like'}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                {liked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16">
                    <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              className={`post-card-action-btn ${showComments ? 'active' : ''}`}
              onClick={() => setShowComments(!showComments)}
              title="Comment"
              aria-label="Comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
                <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h2.764a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 1 .354-.146H13.5A1.5 1.5 0 0 0 15 9.5v-6A1.5 1.5 0 0 0 13.5 2h-11z" />
              </svg>
            </button>
            <button
              type="button"
              className="post-card-action-btn"
              onClick={() => {
                setShareClicked(true);
                setTimeout(() => setShareClicked(false), 2000);
              }}
              title="Share"
              aria-label="Share post"
            >
              {/* Instagram paper plane / direct message icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
            {shareClicked && (
              <span className="text-muted small align-self-center" style={{ marginLeft: 4 }}>Link copied!</span>
            )}
            {showDelete && onDelete && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm ms-auto"
                onClick={() => onDelete(post.id)}
              >
                Delete
              </button>
            )}
          </div>
          
          <div className="mb-2">
            <span className="fw-semibold me-2">{post.likeCount} likes</span>
            {post.commentCount > 0 && (
              <button
                className="btn-link p-0 border-0 bg-transparent text-muted text-decoration-none"
                onClick={() => setShowComments(!showComments)}
              >
                {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>

          {post.caption && (
            <div className="mb-2">
              <span className="fw-semibold me-2">@{post.username}</span>
              <span>{post.caption}</span>
            </div>
          )}

          {post.hashtags?.length ? (
            <div className="mb-2">
              {post.hashtags.map((t) => (
                <Link key={t} to={`/search?q=${t}&tab=hashtags`} className="text-decoration-none me-1">
                  <span className="text-primary">#{t}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {showComments && (
            <div className="comments-section mt-3 pt-3 border-top">
              {loadingComments ? (
                <p className="text-muted small">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-muted small">No comments yet.</p>
              ) : (
                <div className="mb-3">
                  {comments.map((c) => (
                    <div key={c.id} className="mb-2">
                      <span className="fw-semibold me-2">@{c.username}</span>
                      <span>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {user && (
                <form onSubmit={handleAddComment} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    disabled={submittingComment}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingComment || !commentText.trim()}
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ACCEPT_MEDIA = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,video/x-msvideo';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [privacy, setPrivacy] = useState<string>('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState<Blob | null>(null);

  const addMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const allowed = Array.from(files).filter((f) =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    setMediaFiles((prev) => [...prev, ...allowed]);
    e.target.value = '';
  };

  const removeMedia = (i: number) =>
    setMediaFiles((prev) => prev.filter((_, j) => j !== i));

  const addHashtag = () => {
    const t = hashtagInput.trim().replace(/^#/, '');
    if (!t) return;
    if (!hashtags.includes(t)) setHashtags((prev) => [...prev, t]);
    setHashtagInput('');
  };

  const removeHashtag = (t: string) =>
    setHashtags((prev) => prev.filter((h) => h !== t));

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      setError('Camera access denied. Please allow camera access.');
    }
  };

  useEffect(() => {
    if (!showCamera || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    video.srcObject = stream;
    return () => {
      if (video.srcObject) {
        const s = video.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      }
    };
  }, [showCamera]);

  const stopCamera = (clearCapture = false) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    if (clearCapture) {
      setCapturedImageBlob(null);
      setMediaFiles((prev) => prev.filter((f) => f.name !== '__camera__.jpg'));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (video.readyState < 2) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], '__camera__.jpg', { type: 'image/jpeg' });
              setMediaFiles((prev) => [...prev.filter((f) => f.name !== '__camera__.jpg'), file]);
              setCapturedImageBlob(blob);
            }
            stopCamera(false);
          },
          'image/jpeg',
          0.85
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cap = caption.trim();
    if (!cap) {
      setError('Caption is required.');
      return;
    }
    if (!mediaFiles.length) {
      setError('Add at least one image or video (upload or capture).');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', cap);
      formData.append('privacy', privacy);
      if (hashtags.length) formData.append('hashtags', hashtags.join(','));
      mediaFiles.forEach((file) => formData.append('media', file));

      await postsApi.createWithMedia(user.id, formData);
      setShowSuccess(true);
      setTimeout(() => navigate('/home'), 1500);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to create post';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="create-post-container">
        <h1 className="h4 mb-4">Create post</h1>
        {showSuccess && (
          <div className="alert alert-success py-2 mb-3 d-flex align-items-center" role="alert">
            <span className="me-2">✓</span> Your post has been published.
          </div>
        )}
        {error && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {showCamera && (
          <div className="camera-container mb-4 p-3 border rounded bg-dark">
            <p className="text-white small mb-2">Position yourself in frame, then click Capture.</p>
            <div className="position-relative rounded overflow-hidden mb-3" style={{ backgroundColor: '#000', minHeight: 300 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-100"
                style={{
                  display: 'block',
                  maxHeight: 400,
                  minHeight: 300,
                  objectFit: 'cover',
                }}
              />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-primary btn-lg" onClick={capturePhoto}>
                📷 Capture photo
              </button>
              <button type="button" className="btn btn-outline-light btn-lg" onClick={() => stopCamera(true)}>
                ✕ Stop camera
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Caption</label>
            <textarea
              className="form-control"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption…"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Photos / videos</label>
            <div className="mb-2 d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Upload files
              </button>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={startCamera}>
                📷 Use camera
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_MEDIA}
                multiple
                className="d-none"
                onChange={addMoreFiles}
              />
            </div>
            {mediaFiles.length > 0 && (
              <div className="mb-2">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-light">
                    {file.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                    {!file.type.startsWith('image/') && (
                      <span className="text-muted small">🎬 {file.name}</span>
                    )}
                    {file.type.startsWith('image/') && (
                      <span className="small text-muted">{file.name === '__camera__.jpg' ? 'Captured photo' : file.name}</span>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm ms-auto"
                      onClick={() => removeMedia(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Add another file
            </button>
          </div>
          <div className="mb-3">
            <label className="form-label">Hashtags</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="e.g. travel"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={addHashtag}>
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-1">
                {hashtags.map((t) => (
                  <span key={t} className="badge bg-secondary d-inline-flex align-items-center gap-1">
                    #{t}
                    <button
                      type="button"
                      className="btn-close btn-close-white btn-close-sm"
                      aria-label="Remove"
                      onClick={() => removeHashtag(t)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Privacy</label>
            <select
              className="form-select"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS_ONLY">Followers only</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

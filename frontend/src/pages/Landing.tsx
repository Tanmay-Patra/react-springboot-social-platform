import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="landing-page min-vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container text-center px-4">
          {/* Decorative elements */}
          <div className="mb-4" style={{ fontSize: '4rem' }}>
            <span role="img" aria-label="camera">📸</span>
          </div>
          
          <h1 className="landing-title display-3 fw-bold mb-3">
            Instagram
          </h1>
          
          <p className="landing-tagline text-muted mb-5 mx-auto">
            Capture moments. Share stories. Connect with the world.
            Your visual journey starts here.
          </p>
          
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
            <Link to="/register" className="btn btn-primary btn-lg px-5 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline-dark btn-lg px-5 py-3">
              Sign In
            </Link>
          </div>
          
          {/* Feature highlights */}
          <div className="row g-4 mt-5 pt-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>✨</div>
                <h5 className="fw-bold mb-2">Share Moments</h5>
                <p className="text-muted small mb-0">
                  Upload photos and videos to share your life's best moments
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>💬</div>
                <h5 className="fw-bold mb-2">Stay Connected</h5>
                <p className="text-muted small mb-0">
                  Follow friends, like posts, and engage with your community
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>🌟</div>
                <h5 className="fw-bold mb-2">Discover More</h5>
                <p className="text-muted small mb-0">
                  Explore trending content and find new people to follow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center">
        <p className="text-muted small mb-0">
          &copy; Instagram by Tanmay Patra.
        </p>
      </footer>
    </div>
  );
}

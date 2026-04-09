# Instagram Frontend

React + TypeScript frontend for the Instagram-like app. Uses Create React App (react-scripts), Bootstrap, and React Router.

## Setup

1. Copy `.env.example` to `.env` and set `REACT_APP_API_BASE` to your backend URL (default `http://localhost:8080`).
2. Install dependencies and start:

```bash
npm install
npm start
```

## Pages (by user story)

- **US01 – Register:** `/register`
- **US02 – Login:** `/login`; after login, redirect to **Home** (`/home`).
- **US03 – Post updates:** `/post/create` (create post with caption, media URLs, hashtags, privacy).
- **US04 – View & like posts:** `/home` (feed) and `/profile/:id` (user posts). Like/Unlike on each post.
- **US05 – Following users:** `/profile/:id` – Follow/Unfollow when viewing another user.
- **US06 – Search users / hashtags:** `/search` – Tabs for users and hashtags.
- **US07 – Delete post:** `/my-posts` – List your posts with Delete; confirm before delete.
- **US08 – Explore trending:** `/explore` – Trending posts.

Also: **Forgot password** (`/forgot-password`), **Reset password** (`/reset-password?token=...`).

## Tech

- React 18, TypeScript, React Router v6, Axios, Bootstrap 5.

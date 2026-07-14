# Appify Lab – Social Feed Application

A full-stack social feed application with authenticated posts, nested comments & replies, like interactions, and real-time infinite-scroll pagination. Built with **Laravel 11 (API)** on the backend and **React + Vite** on the frontend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Backend Documentation](#backend-documentation)
  - [Architecture](#architecture)
  - [Database Schema](#database-schema)
  - [API Reference](#api-reference)
  - [Design Decisions](#design-decisions-backend)
- [Frontend Documentation](#frontend-documentation)
  - [Architecture](#architecture-1)
  - [Component Structure](#component-structure)
  - [State Management](#state-management)
  - [Design Decisions](#design-decisions-frontend)
- [Environment Variables](#environment-variables)

---

## Project Overview

This application is a Facebook-style social feed where users can:

- Register and log in securely
- Create public or private posts with optional image uploads
- Like / unlike posts and comments
- Comment on posts and reply to comments (nested threads)
- View who liked a post, comment, or reply in a modal
- Scroll infinitely through posts, comments, and replies without manually clicking "load more"

---

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Backend      | Laravel 13, PHP 8.2, Laravel Sanctum (Token Auth)    |
| Database     | MySQL                                                |
| Frontend     | React 18, TypeScript, Vite                           |
| Data Fetching| TanStack Query v5 (`@tanstack/react-query`)          |
| Global State | Zustand (with `persist` middleware)                  |
| HTTP Client  | Axios                                                |
| Routing      | React Router v6                                      |
| Icons        | Lucide React                                         |

---

## Getting Started

### Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file and configure your DB credentials
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Link storage for image uploads
php artisan storage:link

# Start the development server
php artisan serve
```

> The API will be available at `http://127.0.0.1:8000/api`

### Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Copy environment file and set the API base URL
cp .env.example .env

# Start the development server
npm run dev
```

> The frontend will be available at `http://localhost:5173`

---

## Backend Documentation

### Architecture

The backend follows a standard **Laravel MVC** pattern with a dedicated **API Resource** layer for consistent JSON responses.

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php        # Register, login, logout, me
│   │   │   ├── PostController.php        # CRUD, like toggle, likers list
│   │   │   └── CommentController.php     # Comments, replies, like toggle, likers
│   │   ├── Requests/
│   │   │   ├── StorePostRequest.php
│   │   │   └── StoreUserRequest.php
│   │   └── Resources/
│   │       ├── PostResource.php          # Single post shape
│   │       ├── PostCollection.php        # Paginated post list
│   │       ├── CommentResource.php       # Single comment shape
│   │       └── CommentCollection.php     # Paginated comment/reply list
│   └── Models/
│       ├── User.php
│       ├── Post.php
│       ├── PostImage.php
│       ├── PostLike.php
│       ├── Comment.php
│       └── CommentLike.php
├── database/migrations/
└── routes/api.php
```

### Database Schema

| Table                   | Key Columns                                                         |
|-------------------------|---------------------------------------------------------------------|
| `users`                 | `id`, `first_name`, `last_name`, `email`, `password`               |
| `posts`                 | `id`, `created_by`, `text_content`, `is_private`                   |
| `post_images`           | `id`, `post_id`, `image_url`                                        |
| `post_likes`            | `id`, `post_id`, `user_id`                                          |
| `comments`              | `id`, `post_id`, `user_id`, `parent_comment_id`, `text_content`    |
| `comment_likes`         | `id`, `comment_id`, `user_id`                                       |
| `personal_access_tokens`| Laravel Sanctum token table                                         |

> **Replies** reuse the `comments` table via a self-referencing `parent_comment_id` foreign key. A top-level comment has `parent_comment_id = NULL`; a reply has it set to its parent comment's `id`.

### API Reference

All protected routes require the `Authorization: Bearer <token>` header.

#### Auth

| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| POST   | `/api/auth/register` | Register a new user  |
| POST   | `/api/auth/login`    | Login and get token  |
| POST   | `/api/auth/logout`   | Revoke current token |
| GET    | `/api/auth/me`       | Get authenticated user |

#### Posts

| Method | Endpoint                    | Description                               |
|--------|-----------------------------|-------------------------------------------|
| GET    | `/api/posts?page=1`         | Paginated list of posts (public + own private) |
| POST   | `/api/posts`                | Create a post (supports image upload via multipart/form-data) |
| GET    | `/api/posts/{id}`           | Get single post                           |
| PUT    | `/api/posts/{id}`           | Update a post                             |
| DELETE | `/api/posts/{id}`           | Delete a post                             |
| GET    | `/api/posts/{id}/like`      | Toggle like on a post                     |
| GET    | `/api/posts/{id}/likers?page=1` | Paginated list of users who liked a post |

#### Comments & Replies

| Method | Endpoint                              | Description                             |
|--------|---------------------------------------|-----------------------------------------|
| GET    | `/api/posts/{postId}/comments?page=1` | Paginated comments for a post           |
| POST   | `/api/posts/{postId}/comments`        | Add a comment to a post                 |
| DELETE | `/api/comments/{commentId}`           | Delete a comment or reply               |
| GET    | `/api/comments/{commentId}/replies?page=1` | Paginated replies for a comment    |
| POST   | `/api/comments/{commentId}/replies`   | Reply to a comment                      |
| POST   | `/api/comments/{commentId}/like`      | Toggle like on a comment or reply       |
| GET    | `/api/comments/{commentId}/likers?page=1` | Paginated list of users who liked a comment |

**All paginated endpoints** accept an optional `page` query parameter (defaults to page 1, 20 items per page). They return a standard Laravel paginator response shape:

```json
{
  "data": [...],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

### Design Decisions (Backend)

1. **Laravel Sanctum for Authentication** — Token-based authentication was chosen because the frontend is a separate SPA. Sanctum issues plain-text Bearer tokens that are easy to store and send from Axios.

2. **API Resources instead of raw `toArray()`** — `PostResource`, `CommentResource`, and their Collection counterparts ensure a stable, versioned API contract. Computed fields like `is_liked_by_me`, `like_count`, and `reply_count` are resolved inside the resource using eager-loaded relationships, avoiding N+1 queries.

3. **Self-referencing Comments for Replies** — Rather than a separate `replies` table, replies are stored in the same `comments` table with a `parent_comment_id` foreign key. This keeps the schema simple and allows arbitrarily deep nesting in the future without schema changes.

4. **Visibility Guard (`checkPostVisibility`)** — A private helper on `CommentController` ensures that users cannot comment on or read comments of posts they are not allowed to see, enforcing data privacy rules consistently across all comment endpoints.

5. **Configurable `paginate` parameter** — Each list endpoint accepts a `paginate` query parameter to override the default page size, giving clients flexibility without requiring API versioning.

6. **`ON DELETE CASCADE`** — Comment and like tables use cascade deletes so that when a post or parent comment is deleted, all related child records (replies, likes) are automatically removed at the database level, keeping the database clean without extra application logic.

---

## Frontend Documentation

### Architecture

```
frontend/src/
├── api/
│   └── api.ts                    # All Axios API calls
├── components/
│   ├── feed/                     # Feed layout components
│   │   ├── CreatePost.tsx        # Post creation form with image preview
│   │   ├── DesktopStories.tsx    # Stories strip (desktop)
│   │   ├── MobileStories.tsx     # Stories strip (mobile)
│   │   ├── FeedPosts.tsx         # Infinite-scroll post list
│   │   └── InfiniteScrollTrigger.tsx # Reusable intersection observer
│   ├── post/                     # Post interaction components
│   │   ├── CommentSection.tsx    # Infinite-scroll comment list + input
│   │   ├── CommentItem.tsx       # Single comment with like / reply actions
│   │   ├── ReplySection.tsx      # Infinite-scroll reply list + input
│   │   ├── ReplyItem.tsx         # Single reply with like action
│   │   ├── LikersModal.tsx       # Modal showing who liked a post/comment
│   │   └── helpers.ts            # `timeAgo` and `fullName` utilities
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Route guard using Zustand token
│   ├── FeedMiddle.tsx            # Orchestrates feed section components
│   ├── Navbar.tsx                # Top navigation with auth user info + logout
│   ├── LeftSidebar.tsx
│   └── RightSidebar.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── FeedPage.tsx
├── store.ts                      # Zustand auth store (token + user)
├── types/
│   └── post.ts                   # TypeScript interfaces
└── App.tsx                       # Router + QueryClientProvider root
```

### Component Structure

#### Feed Section (`components/feed/`)

The `FeedMiddle` component is kept as a thin **orchestrator** — it simply renders the four feed section components in order. Each section is self-contained and independently responsible for its own data fetching.

| Component | Responsibility |
|---|---|
| `DesktopStories` | Renders the horizontal story cards visible on desktop breakpoints |
| `MobileStories` | Renders the horizontal story scroll visible on mobile |
| `CreatePost` | Manages a controlled form with text + multi-image selection, submits via `useMutation`, clears on success |
| `FeedPosts` | Fetches posts with `useInfiniteQuery`, renders `PostCard` for each, and mounts `InfiniteScrollTrigger` at the bottom |
| `InfiniteScrollTrigger` | A reusable `div` that uses the native **`IntersectionObserver` API** to fire `fetchNextPage()` when it enters the viewport |

#### Post Interaction (`components/post/`)

| Component | Responsibility |
|---|---|
| `PostCard` | Renders post header, body, images, reaction summary, and action buttons. Manages optimistic like state locally. Triggers `LikersModal` on the like-count badge. |
| `CommentSection` | Fetches comments with `useInfiniteQuery`, handles comment creation via `useMutation` |
| `CommentItem` | Renders a single comment. Manages optimistic comment-like state. Triggers `LikersModal` and toggles `ReplySection` |
| `ReplySection` | Fetches replies with `useInfiniteQuery`, handles reply creation via `useMutation` |
| `ReplyItem` | Renders a single reply. Manages optimistic reply-like state. Triggers `LikersModal` |
| `LikersModal` | A reusable modal that accepts `type: 'post' | 'comment'` and `id`, fetches likers via `useInfiniteQuery`, and supports infinite scroll within the modal itself |

### State Management

**Two layers of state coexist:**

1. **Zustand (`store.ts`)** — Handles global **authentication state** (`token`, `user`). Uses `persist` middleware to save to `localStorage` automatically. The `clearSession()` action resets both Zustand state and clears the persisted storage on logout.

2. **TanStack Query** — Handles all **server state** (posts, comments, replies, likers). Every mutation (`useMutation`) invalidates the relevant query keys on success, keeping the UI in sync with the server:
   - Creating a post → invalidates `['posts']`
   - Creating a comment → invalidates `['comments', postId]` and `['posts']`
   - Toggling a like → uses **optimistic updates** (state is updated immediately on `onMutate`, rolled back on `onError`, and reconciled with server truth on `onSuccess`)

### Design Decisions (Frontend)



1. **Optimistic Updates for Likes** — Like toggles update the UI instantly without waiting for the API response. If the request fails, the state is rolled back to its previous value. This removes perceived latency and makes the app feel fast even on slower connections.

2. **Modular `components/feed/` and `components/post/` directories** — Instead of one large `FeedMiddle.tsx` or `PostCard.tsx`, each concern is split into its own focused component. This makes individual pieces easy to test, maintain, and reason about in isolation.

3. **`LikersModal` is type-agnostic** — A single `LikersModal` component handles likers for posts, comments, and replies by accepting a `type` prop. This eliminates code duplication and keeps the UI consistent across all three contexts.

4. **Axios interceptors for token injection** — Rather than manually attaching the Bearer token in every API call, a request interceptor reads the current token from the Zustand store and attaches it to every outgoing request. A response interceptor catches 401 errors globally and redirects to `/login`, clearing the session.

5. **Component-level optimistic like state** — Post and comment like state is held in local `useState` (seeded from the API response) rather than in a global store or re-fetching the full list. This prevents the entire feed from re-rendering on every like toggle.

6. **`FeedMiddle` as orchestrator** — The `FeedMiddle` component contains no logic of its own. It simply composes `DesktopStories`, `MobileStories`, `CreatePost`, and `FeedPosts`. This makes it easy to add, remove, or reorder feed sections in one place.

---

## Environment Variables

### Backend (`.env`)

```env
APP_NAME=AppifyLab
APP_ENV=local
APP_KEY=                          # Auto-generated by `php artisan key:generate`
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Frontend (`.env`)

```env
VITE_ENVIRONMENT=local
VITE_BASE_URL=http://127.0.0.1:8000/api
VITE_PROD_URL=https://your-production-api.com/api
```

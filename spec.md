# Personal Blog

## Current State
New project. No existing code or data.

## Requested Changes (Diff)

### Add
- Personal blog with a public-facing feed and individual post pages
- Admin-only post creation, editing, and deletion (protected by authorization)
- Posts have: title, body (rich text / markdown), optional tags, and a published timestamp
- Home/feed page: lists all published posts in reverse chronological order (title, date, tag chips, short excerpt)
- Individual post page: full post content, tags, date
- Admin dashboard: create new post, edit existing posts, delete posts
- Draft vs published state for posts (admin can save drafts, only published posts are visible publicly)
- Sample posts seeded on first load

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend:
   - Data model: Post { id, title, body, tags, createdAt, updatedAt, published, authorId }
   - CRUD operations: createPost, updatePost, deletePost, getPost, listPosts (public), listAllPosts (admin)
   - Authorization: only the admin (owner) can create/edit/delete posts; public can only read published posts
   - Seed a few sample posts on first initialization

2. Frontend:
   - Home page: scrollable feed of published posts, excerpt + metadata
   - Post detail page: full post view
   - Admin login: Internet Identity auth flow
   - Admin dashboard: list of all posts (including drafts), with create/edit/delete actions
   - Post editor: title input, body textarea (markdown), tags input, draft/publish toggle
   - Navigation: site name/logo, link to home, admin login button

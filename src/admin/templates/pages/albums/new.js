// src/admin/templates/pages/albums/new.js
// New Album Page

import { mainLayout } from '../../layouts/main.js';

export function albumNewPage({ user }) {
  const content = `
    <div class="albums">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">New Album</h1>
            <p class="page-header__subtitle">Create a new album to organize media</p>
          </div>
        </div>

        <form
          class="form form--max-width"
          hx-post="/admin/media/albums"
          hx-target="body"
          hx-swap="none"
        >
          <div class="form__group">
            <label class="label label--required" for="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              class="input"
              placeholder="e.g., Cultural Night 2025"
              required
            />
          </div>

          <div class="form__group">
            <label class="label" for="slug">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              class="input"
              placeholder="auto-generated-if-empty"
            />
            <span class="form__hint">URL-friendly identifier. Auto-generated from title if empty.</span>
          </div>

          <div class="form__group">
            <label class="label" for="description">Description</label>
            <textarea
              id="description"
              name="description"
              class="input input--textarea"
              rows="3"
              placeholder="Optional description"
            ></textarea>
          </div>

          <div class="form__actions">
            <a href="/admin/media/albums" class="btn btn--ghost btn--danger">Cancel</a>
            <button type="submit" class="btn btn--primary">Create Album</button>
          </div>
        </form>
      </div>
    </div>
  `;

  return mainLayout({
    title: 'New Album',
    description: 'Create a new album',
    content,
    user,
    activeRoute: '/admin/media/albums',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Media', url: '/admin/media/images' },
      { label: 'Albums', url: '/admin/media/albums' },
      { label: 'New', url: '/admin/media/albums/new' },
    ],
  });
}

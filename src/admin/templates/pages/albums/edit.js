// src/admin/templates/pages/albums/edit.js
// Edit Album Page

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml } from '../../utils/helpers.js';

export function albumEditPage({ user, album }) {
  const content = `
    <div class="albums">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">Edit Album</h1>
            <p class="page-header__subtitle">${escapeHtml(album.title)}</p>
          </div>
        </div>

        <form
          class="form form--max-width"
          hx-put="/admin/media/albums/${album.id}"
          hx-target="body"
          hx-swap="none"
        >
          <div class="form__group">
            <label class="form__label" for="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              class="input"
              value="${escapeHtml(album.title)}"
              required
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="slug">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              class="input"
              value="${escapeHtml(album.slug)}"
            />
            <span class="form__hint">URL-friendly identifier.</span>
          </div>

          <div class="form__group">
            <label class="form__label" for="description">Description</label>
            <textarea
              id="description"
              name="description"
              class="input input--textarea"
              rows="3"
              placeholder="Optional description"
            >${escapeHtml(album.description || '')}</textarea>
          </div>

          <div class="form__actions">
            <a href="/admin/media/albums" class="btn btn--ghost">Cancel</a>
            <button type="submit" class="btn btn--primary">Update Album</button>
          </div>
        </form>
      </div>
    </div>
  `;

  return mainLayout({
    title: `Edit Album - ${escapeHtml(album.title)}`,
    description: 'Edit album details',
    content,
    user,
    activeRoute: '/admin/media/albums',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Media', url: '/admin/media/images' },
      { label: 'Albums', url: '/admin/media/albums' },
      { label: escapeHtml(album.title), url: `/admin/media/albums/${album.id}/edit` },
    ],
  });
}

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
          <div class="page-header__toast-container"></div>
        </div>

        <div class="card">
          <div class="card__header">
            <h2>Album Details</h2>
          </div>
          <div class="card__body">
            <form
              class="form"
              id="editAlbumForm"
              hx-put="/admin/media/albums/${album.id}"
              hx-target="#form-response"
              hx-swap="innerHTML"
            >
              <div id="form-response"></div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label label--required" for="title">Title</label>
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
                  <label class="label" for="slug">Slug</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    class="input"
                    value="${escapeHtml(album.slug)}"
                  />
                  <p class="form-feedback form-feedback--hint">Auto-generated from title</p>
                </div>
              </div>

              <div class="form__group">
                <label class="label" for="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  class="textarea"
                  rows="4"
                  placeholder="Enter album description..."
                >${escapeHtml(album.description || '')}</textarea>
              </div>

              <input type="hidden" name="_csrf" value="${user?.csrfToken || ''}" />
            </form>
          </div>
          <div class="card__footer">
            <div class="form__field-group">
              <button type="button" class="btn btn--primary" onclick="submitForm()">
                <i data-lucide="check"></i>
                Save
              </button>
              <a href="/admin/media/albums" class="btn btn--outline btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function submitForm() {
        htmx.trigger('#editAlbumForm', 'submit');
      }
    </script>
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

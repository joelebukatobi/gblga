// src/admin/templates/pages/albums/edit.js
// Edit Album Page

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml } from '../../utils/helpers.js';

export function albumEditPage({ user, album, albumImages = [] }) {
  const hasCover = album.coverImage && album.coverImage.path;
  const coverImageId = album.coverImageId || '';
  
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

              <input type="hidden" name="coverImageId" id="coverImageId" value="${coverImageId}" />
              <input type="hidden" name="_csrf" value="${user?.csrfToken || ''}" />
            </form>

            <!-- Cover Image Section -->
            <div class="form__group" style="margin-top: 2.4rem;">
              <label class="label">Cover Image</label>
              <div class="album-cover-preview" style="margin-bottom: 1.6rem;">
                ${hasCover
                  ? `<img src="${album.coverImage.path}" alt="${escapeHtml(album.title)}" style="max-width: 32rem; max-height: 24rem; object-fit: cover; border-radius: 0.4rem;" />`
                  : `<div class="album-cover-placeholder" style="width: 32rem; height: 24rem; border-radius: 0.4rem;">
                      <span class="album-cover-placeholder__text">${escapeHtml(album.title)}</span>
                    </div>`
                }
              </div>
              
              ${albumImages.length > 0 ? `
                <p class="form-feedback form-feedback--hint" style="margin-bottom: 1.2rem;">Click an image to set it as the album cover</p>
                <div class="album-image-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 1.2rem;">
                  ${albumImages.map(img => `
                    <div 
                      class="album-image-option ${img.id === coverImageId ? 'album-image-option--selected' : ''}"
                      data-image-id="${img.id}"
                      onclick="selectCoverImage('${img.id}')"
                      style="cursor: pointer; border: 2px solid ${img.id === coverImageId ? '#3a1920' : 'transparent'}; border-radius: 0.4rem; overflow: hidden; transition: border-color 0.2s;"
                    >
                      <img src="${img.path}" alt="${escapeHtml(img.title || '')}" style="width: 100%; height: 12rem; object-fit: cover;" />
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="form-feedback form-feedback--hint">Upload images to this album to set a cover</p>
              `}
            </div>
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
      function selectCoverImage(imageId) {
        document.getElementById('coverImageId').value = imageId;
        
        // Update visual selection
        document.querySelectorAll('.album-image-option').forEach(el => {
          el.style.borderColor = el.dataset.imageId === imageId ? '#3a1920' : 'transparent';
        });
      }
      
      function submitForm() {
        htmx.trigger('#editAlbumForm', 'submit');
      }
    </script>
  `;`} /> <text>Now I need to update the albums controller to pass the album images to the edit page template. Let me update the `showEditForm` method.</text> <parameter name=

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

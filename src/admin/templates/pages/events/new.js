// src/admin/templates/pages/events/new.js
// New Event Page

import { mainLayout } from '../../layouts/main.js';

export function eventNewPage({ user, errors = {} }) {
  const content = `
    <div class="events">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">New Event</h1>
            <p class="page-header__subtitle">Create a new event</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        <div class="card">
          <div class="card__header">
            <h2>Event Details</h2>
          </div>
          <div class="card__body">
            <form class="form" id="newEventForm" hx-post="/admin/events" hx-target="#form-response" hx-swap="innerHTML" hx-encoding="multipart/form-data">
              <div id="form-response"></div>

              <div class="form__row form__row--sidebar">
                <div class="form__group">
                  <label class="label">Flyer</label>
                  <div class="form__photo" style="position: relative;">
                    <div id="flyerPreview" class="form__photo-placeholder">
                      <i data-lucide="image" class="w-[4.8rem] h-[4.8rem] text-grey-500 stroke-1"></i>
                    </div>
                    <div class="form__photo-overlay" id="flyerOverlay">
                      <span>Change Flyer</span>
                      <span>JPG, PNG, WebP. Max 10MB.</span>
                    </div>
                    <input
                      type="file"
                      id="flyerUpload"
                      name="flyer"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      style="opacity: 0; position: absolute; inset: 0; cursor: pointer; width: 100%; height: 100%; z-index: 10;"
                      onchange="handleFlyerSelect(this)"
                    />
                  </div>
                  <p class="form__hint">Click to upload a flyer (optional)</p>
                </div>

                <div>
                  <div class="form__row form__row--2col">
                    <div class="form__group ${errors.title ? 'form__group--error' : ''}">
                      <label class="label label--required" for="eventTitle">Title</label>
                      <input type="text" class="input" id="eventTitle" name="title" placeholder="e.g. Cultural Exchange Night" required />
                      ${errors.title ? `<p class="form-feedback form-feedback--error">${errors.title}</p>` : ''}
                    </div>
                    <div class="form__group ${errors.slug ? 'form__group--error' : ''}">
                      <label class="label" for="eventSlug">Slug</label>
                      <input type="text" class="input" id="eventSlug" name="slug" placeholder="e.g. cultural-exchange-night" />
                      <p class="form-feedback form-feedback--hint">Leave blank to generate from title</p>
                    </div>
                  </div>

                  <div class="form__row form__row--2col">
                    <div class="form__group">
                      <label class="label" for="eventDate">Event Date</label>
                      <input type="date" class="input" id="eventDate" name="eventDate" />
                    </div>
                    <div class="form__group">
                      <label class="label" for="eventTime">Event Time</label>
                      <input type="text" class="input" id="eventTime" name="eventTime" placeholder="e.g. 6:00 PM" />
                    </div>
                  </div>

                  <div class="form__group">
                    <label class="label" for="eventLocation">Location</label>
                    <input type="text" class="input" id="eventLocation" name="location" placeholder="e.g. Gabelli Commons" />
                  </div>

                  <div class="form__group form__group--last">
                    <label class="label" for="eventDescription">Description</label>
                    <textarea class="textarea" id="eventDescription" name="description" rows="4" placeholder="Enter event description..."></textarea>
                  </div>
                </div>
              </div>

              <input type="hidden" name="_csrf" value="${user?.csrfToken || ''}" />
            </form>
          </div>
          <div class="card__footer">
            <div class="form__field-group">
              <button type="button" class="btn btn--primary" onclick="submitForm()">
                <i data-lucide="plus"></i>
                Create Event
              </button>
              <a href="/admin/events" class="btn btn--outline btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flyer Crop Modal -->
    <div id="flyerCropModal" class="modal">
      <div class="modal__backdrop" onclick="closeFlyerCropModal()"></div>
      <div class="modal__panel modal__panel--large">
        <div class="modal__header" style="position: relative; flex-direction: row; justify-content: space-between; text-align: left;">
          <h3 class="modal__title">Crop Flyer</h3>
          <button type="button" class="modal__close" onclick="closeFlyerCropModal()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal__body" style="padding: 0; overflow: hidden;">
          <div style="height: 40rem; background: #f5f5f5;">
            <cropper-canvas id="flyerCanvas" background style="height: 100%; width: 100%;">
              <cropper-image id="flyerImage" alt="Flyer" rotatable scalable translatable></cropper-image>
              <cropper-shade hidden></cropper-shade>
              <cropper-handle action="select" plain></cropper-handle>
              <cropper-selection id="flyerSelection" initial-coverage="0.8" aspect-ratio="1" movable resizable>
                <cropper-grid covered></cropper-grid>
                <cropper-crosshair centered></cropper-crosshair>
                <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
                <cropper-handle action="n-resize"></cropper-handle>
                <cropper-handle action="e-resize"></cropper-handle>
                <cropper-handle action="s-resize"></cropper-handle>
                <cropper-handle action="w-resize"></cropper-handle>
                <cropper-handle action="ne-resize"></cropper-handle>
                <cropper-handle action="nw-resize"></cropper-handle>
                <cropper-handle action="se-resize"></cropper-handle>
                <cropper-handle action="sw-resize"></cropper-handle>
              </cropper-selection>
            </cropper-canvas>
          </div>
        </div>
        <div class="modal__footer modal__footer--row">
          <button type="button" class="btn btn--primary" onclick="applyFlyerCrop()">
            <i data-lucide="check"></i>
            Apply Crop
          </button>
          <button type="button" class="btn btn--outline" onclick="closeFlyerCropModal()">Cancel</button>
        </div>
      </div>
    </div>

    <script src="/vendor/cropperjs/cropper.min.js"></script>
    <script>
      let currentFlyerFile = null;

      const titleInput = document.getElementById('eventTitle');
      const slugInput = document.getElementById('eventSlug');

      titleInput?.addEventListener('blur', () => {
        if (!slugInput.value && titleInput.value) {
          const slug = titleInput.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          slugInput.value = slug;
        }
      });

      function submitForm() {
        htmx.trigger('#newEventForm', 'submit');
      }

      window.handleFlyerSelect = function(input) {
        if (input.files && input.files[0]) {
          currentFlyerFile = input.files[0];
          const reader = new FileReader();
          reader.onload = function(e) {
            openFlyerCropModal(e.target.result);
          };
          reader.readAsDataURL(input.files[0]);
        }
      };

      window.openFlyerCropModal = function(imageSrc) {
        const modal = document.getElementById('flyerCropModal');
        const flyerImage = document.getElementById('flyerImage');
        const safeSrc = typeof imageSrc === 'string' ? imageSrc.trim() : '';

        if (!safeSrc || safeSrc === 'null' || safeSrc === 'undefined') return;
        flyerImage.src = safeSrc;
        modal.classList.add('is-open');
        lucide.createIcons();
      };

      window.closeFlyerCropModal = function() {
        const modal = document.getElementById('flyerCropModal');
        const flyerImage = document.getElementById('flyerImage');
        modal.classList.remove('is-open');
        if (flyerImage) flyerImage.removeAttribute('src');
        document.getElementById('flyerUpload').value = '';
        currentFlyerFile = null;
      };

      window.applyFlyerCrop = async function() {
        const selection = document.getElementById('flyerSelection');
        if (!selection) return;

        try {
          const canvas = await selection.$toCanvas({
            width: 800,
            height: 800,
          });

          canvas.toBlob(function(blob) {
            if (!blob) return;

            const fileName = currentFlyerFile ? currentFlyerFile.name : 'flyer.jpg';
            const croppedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const preview = document.getElementById('flyerPreview');
            const overlay = document.getElementById('flyerOverlay');

            preview.innerHTML = '<img src="' + canvas.toDataURL('image/jpeg') + '" alt="Flyer preview" style="width: 100%; height: 100%; object-fit: cover;" />';
            preview.classList.remove('form__photo-placeholder');
            if (overlay) overlay.style.display = 'flex';

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            document.getElementById('flyerUpload').files = dataTransfer.files;

            closeFlyerCropModal();
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('Crop failed:', error);
        }
      };
    </script>
  `;

  return mainLayout({
    title: 'New Event',
    description: 'Create a new event',
    content,
    user,
    activeRoute: '/admin/events',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Events', url: '/admin/events' },
      { label: 'New Event', url: '/admin/events/new' }
    ]
  });
}

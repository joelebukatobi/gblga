// src/admin/templates/pages/board-members/new.js
// New Board Member Page

import { mainLayout } from '../../layouts/main.js';

export function boardMemberNewPage({ user, errors = {} }) {
  const content = `
    <div class="board-members">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">New Board Member</h1>
            <p class="page-header__subtitle">Create a new board member</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        <div class="card">
          <div class="card__header">
            <h2>Member Details</h2>
          </div>
          <div class="card__body">
            <form class="form" id="newBoardMemberForm" hx-post="/admin/board-members" hx-target="#form-response" hx-swap="innerHTML" hx-encoding="multipart/form-data">
              <div id="form-response"></div>

              <div class="form__row form__row--sidebar">
                <div class="form__group">
                  <label class="label">Photo</label>
                  <div class="form__photo" style="position: relative;">
                    <div id="photoPreview" class="form__photo-placeholder">
                      <i data-lucide="image" class="w-[4.8rem] h-[4.8rem] text-grey-500 stroke-1"></i>
                    </div>
                    <div class="form__photo-overlay" id="photoOverlay">
                      <span>Change Photo</span>
                      <span>JPG, PNG, WebP. Max 10MB.</span>
                    </div>
                    <input
                      type="file"
                      id="memberPhoto"
                      name="photo"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      style="opacity: 0; position: absolute; inset: 0; cursor: pointer; width: 100%; height: 100%; z-index: 10;"
                      onchange="handlePhotoSelect(this)"
                    />
                  </div>
                  <p class="form__hint">Click to upload a photo (optional)</p>
                </div>

                <div>
                  <div class="form__row form__row--2col">
                    <div class="form__group ${errors.name ? 'form__group--error' : ''}">
                      <label class="label label--required" for="memberName">Name</label>
                      <input type="text" class="input" id="memberName" name="name" placeholder="e.g. Alexandra Morales" required />
                    </div>
                    <div class="form__group ${errors.role ? 'form__group--error' : ''}">
                      <label class="label label--required" for="memberRole">Role</label>
                      <input type="text" class="input" id="memberRole" name="role" placeholder="e.g. President" required />
                    </div>
                  </div>

                  <div class="form__row form__row--2col">
                    <div class="form__group">
                      <label class="label" for="memberEmail">Email</label>
                      <input type="email" class="input" id="memberEmail" name="email" placeholder="e.g. alex@example.com" />
                    </div>
                    <div class="form__group">
                      <label class="label label--required" for="memberYear">Year</label>
                      <input type="number" class="input" id="memberYear" name="year" placeholder="e.g. 2026" required />
                    </div>
                  </div>

                  <div class="form__group form__group--ordered">
                    <label class="label" for="memberType">Type</label>
                    <select
                      name="type"
                      id="memberType"
                      data-hs-select='{
                        "placeholder": "Select type...",
                        "toggleClasses": "form__select-toggle",
                        "dropdownClasses": "form__select-dropdown",
                        "optionClasses": "form__select-option"
                      }'
                      class="hidden"
                    >
                      <option value="SENIOR" selected>Senior</option>
                      <option value="JUNIOR">Junior</option>
                    </select>
                  </div>

                  <div class="form__group form__group--last">
                    <label class="label" for="memberBio">Bio</label>
                    <textarea class="textarea" id="memberBio" name="bio" rows="4" placeholder="Enter member bio..."></textarea>
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
                Create Member
              </button>
              <a href="/admin/board-members" class="btn btn--outline btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Crop Modal -->
    <div id="cropModal" class="modal">
      <div class="modal__backdrop" onclick="closeCropModal()"></div>
      <div class="modal__panel modal__panel--large">
        <div class="modal__header" style="position: relative; flex-direction: row; justify-content: space-between; text-align: left;">
          <h3 class="modal__title">Crop Photo</h3>
          <button type="button" class="modal__close" onclick="closeCropModal()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal__body" style="padding: 0; overflow: hidden;">
          <div style="height: 40rem; background: #f5f5f5;">
            <cropper-canvas id="cropperCanvas" background style="height: 100%; width: 100%;">
              <cropper-image id="cropperImage" src="" alt="Picture" rotatable scalable translatable></cropper-image>
              <cropper-shade hidden></cropper-shade>
              <cropper-handle action="select" plain></cropper-handle>
              <cropper-selection id="cropperSelection" initial-coverage="0.8" aspect-ratio="1" movable resizable>
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
          <button type="button" class="btn btn--primary" onclick="applyCrop()">
            <i data-lucide="check"></i>
            Apply Crop
          </button>
          <button type="button" class="btn btn--outline" onclick="closeCropModal()">Cancel</button>
        </div>
      </div>
    </div>

    <script src="/vendor/cropperjs/cropper.min.js"></script>
    <script>
      let currentFile = null;

      window.submitForm = function() {
        htmx.trigger('#newBoardMemberForm', 'submit');
      };

      window.getInitials = function(name) {
        if (!name) return '';
        const parts = name.trim().split(/\\s+/);
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };

      window.handlePhotoSelect = function(input) {
        if (input.files && input.files[0]) {
          currentFile = input.files[0];
          const reader = new FileReader();
          reader.onload = function(e) {
            openCropModal(e.target.result);
          };
          reader.readAsDataURL(input.files[0]);
        }
      };

      window.openCropModal = function(imageSrc) {
        const modal = document.getElementById('cropModal');
        const cropperImage = document.getElementById('cropperImage');
        
        cropperImage.src = imageSrc;
        modal.classList.add('is-open');
        lucide.createIcons();
      };

      window.closeCropModal = function() {
        const modal = document.getElementById('cropModal');
        modal.classList.remove('is-open');
        
        // Reset file input if crop was cancelled
        const fileInput = document.getElementById('memberPhoto');
        if (fileInput && !fileInput.files.length) {
          fileInput.value = '';
          currentFile = null;
        }
      };

      window.applyCrop = async function() {
        const selection = document.getElementById('cropperSelection');
        
        if (!selection) return;
        
        try {
          const canvas = await selection.$toCanvas({
            width: 400,
            height: 400,
          });
          
          canvas.toBlob(function(blob) {
            if (!blob) return;
            
            // Create a new file from the blob
            const fileName = currentFile ? currentFile.name : 'photo.jpg';
            const croppedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            // Update preview
            const preview = document.getElementById('photoPreview');
            const overlay = document.getElementById('photoOverlay');
            
            preview.innerHTML = '<img src="' + canvas.toDataURL('image/jpeg') + '" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />';
            preview.classList.remove('form__photo-placeholder');
            if (overlay) overlay.style.display = 'flex';
            
            // Create a DataTransfer to update the file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            document.getElementById('memberPhoto').files = dataTransfer.files;
            
            closeCropModal();
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('Crop failed:', error);
        }
      };

      const photoPreview = document.getElementById('photoPreview');
      const defaultIcon = photoPreview.innerHTML;
      let hasUploadedImage = false;

      // Listen for photo upload to track state
      const originalPhotoSelect = window.handlePhotoSelect;
      window.handlePhotoSelect = function(input) {
        hasUploadedImage = true;
        return originalPhotoSelect(input);
      };

      document.getElementById('memberName').addEventListener('input', function() {
        // Don't overwrite an uploaded image preview
        if (hasUploadedImage) return;

        const initials = getInitials(this.value);
        if (initials) {
          photoPreview.innerHTML = initials;
        } else {
          photoPreview.innerHTML = defaultIcon;
          lucide.createIcons();
        }
      });
    </script>
  `;

  return mainLayout({
    title: 'New Board Member',
    description: 'Create a new board member',
    content,
    user,
    activeRoute: '/admin/board-members',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Board Members', url: '/admin/board-members' },
      { label: 'New Member', url: '/admin/board-members/new' }
    ]
  });
}

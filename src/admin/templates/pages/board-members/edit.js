// src/admin/templates/pages/board-members/edit.js
// Edit Board Member Page - Two column layout with photo upload

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml, getNameInitials } from '../../utils/helpers.js';

export function boardMemberEditPage({ member, user, errors = {} }) {
  const photoUrl = member.photoUrl || (member.photo?.path ? member.photo.path : null);
  const initials = getNameInitials(member.name);

  const content = `
    <div class="board-members">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">Edit Board Member</h1>
            <p class="page-header__subtitle">Update member details</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        <div class="card">
          <div class="card__header">
            <h2>Member Details</h2>
          </div>
          <div class="card__body">
            <form class="form" id="editBoardMemberForm" hx-put="/admin/board-members/${member.id}" hx-target="#form-response" hx-swap="innerHTML">
              <div id="form-response"></div>

              <div class="form__row form__row--sidebar">
                <!-- Left Column: Photo -->
                <div class="form__group">
                  <label class="label">Photo</label>
                  <div
                    class="form__photo"
                    onclick="document.getElementById('memberPhotoUpload').click()"
                  >
                    <div id="photoPreview" class="h-full">
                      ${photoUrl
                        ? `<img src="${photoUrl}" alt="${escapeHtml(member.name)}" />`
                        : `<div class="form__photo-placeholder">${initials}</div>`
                      }
                    </div>
                    <div class="form__photo-overlay">
                      <span>Change Photo</span>
                      <span>JPG, PNG, WebP. Max 10MB.</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="memberPhotoUpload"
                    name="photo"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    class="hidden"
                    onchange="handlePhotoUpload(this)"
                  />
                </div>

                <!-- Right Column: Form Fields -->
                <div>
                  <div class="form__row form__row--2col">
                    <div class="form__group ${errors.name ? 'form__group--error' : ''}">
                      <label class="label label--required" for="memberName">Name</label>
                      <input type="text" class="input" id="memberName" name="name" value="${escapeHtml(member.name)}" required />
                    </div>
                    <div class="form__group ${errors.role ? 'form__group--error' : ''}">
                      <label class="label label--required" for="memberRole">Role</label>
                      <input type="text" class="input" id="memberRole" name="role" value="${escapeHtml(member.role)}" required />
                    </div>
                  </div>

                  <div class="form__row form__row--2col">
                    <div class="form__group">
                      <label class="label" for="memberEmail">Email</label>
                      <input type="email" class="input" id="memberEmail" name="email" value="${escapeHtml(member.email || '')}" placeholder="e.g. alex@example.com" />
                    </div>
                    <div class="form__group">
                      <label class="label label--required" for="memberYear">Year</label>
                      <input type="number" class="input" id="memberYear" name="year" value="${member.year}" required />
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
                      <option value="SENIOR" ${member.type === 'SENIOR' ? 'selected' : ''}>Senior</option>
                      <option value="JUNIOR" ${member.type === 'JUNIOR' ? 'selected' : ''}>Junior</option>
                    </select>
                  </div>

                  <div class="form__group form__group--last">
                    <label class="label" for="memberBio">Bio</label>
                    <textarea class="textarea" id="memberBio" name="bio" rows="4" placeholder="Enter member bio...">${escapeHtml(member.bio || '')}</textarea>
                  </div>
                </div>
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
        htmx.trigger('#editBoardMemberForm', 'submit');
      };

      window.handlePhotoUpload = function(input) {
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
        document.getElementById('memberPhotoUpload').value = '';
        currentFile = null;
      };

      window.applyCrop = async function() {
        const selection = document.getElementById('cropperSelection');
        
        if (!selection) return;
        
        try {
          const canvas = await selection.$toCanvas({
            width: 400,
            height: 400,
          });
          
          canvas.toBlob(async function(blob) {
            if (!blob) return;
            
            const fileName = currentFile ? currentFile.name : 'photo.jpg';
            const croppedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            // Create form data and upload via fetch
            const formData = new FormData();
            formData.append('photo', croppedFile);
            
            const csrfToken = document.querySelector('input[name="_csrf"]')?.value;
            if (csrfToken) {
              formData.append('_csrf', csrfToken);
            }
            
            try {
              const response = await fetch('/admin/board-members/${member.id}/photo', {
                method: 'POST',
                body: formData,
                headers: {
                  'HX-Request': 'true'
                }
              });
              
              if (response.ok) {
                const html = await response.text();
                document.getElementById('photoPreview').innerHTML = html;
                
                // Show success toast
                document.body.dispatchEvent(new CustomEvent('htmx:toast', {
                  detail: { message: 'Photo updated successfully!', type: 'success' }
                }));
              } else {
                throw new Error('Upload failed');
              }
            } catch (error) {
              console.error('Upload failed:', error);
              document.body.dispatchEvent(new CustomEvent('htmx:toast', {
                detail: { message: 'Failed to upload photo', type: 'error' }
              }));
            }
            
            closeCropModal();
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('Crop failed:', error);
        }
      };
    </script>
  `;

  return mainLayout({
    title: 'Edit Board Member',
    description: 'Edit board member',
    content,
    user,
    activeRoute: '/admin/board-members',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Board Members', url: '/admin/board-members' },
      { label: escapeHtml(member.name), url: `/admin/board-members/${member.id}/edit` }
    ]
  });
}

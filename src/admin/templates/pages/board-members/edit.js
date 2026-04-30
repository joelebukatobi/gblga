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
                    hx-post="/admin/board-members/${member.id}/photo"
                    hx-target="#photoPreview"
                    hx-swap="innerHTML"
                    hx-encoding="multipart/form-data"
                    hx-trigger="change"
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

                  <div class="form__group">
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

    <script>
      function submitForm() {
        htmx.trigger('#editBoardMemberForm', 'submit');
      }
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

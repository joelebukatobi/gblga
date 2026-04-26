// src/admin/templates/pages/board-members/edit.js
// Edit Board Member Page

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml } from '../../utils/helpers.js';

export function boardMemberEditPage({ member, user, errors = {} }) {
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

              <div class="form__row form__row--2col">
                <div class="form__group ${errors.name ? 'form__group--error' : ''}">
                  <label class="label label--required">Name</label>
                  <input type="text" class="input" id="memberName" name="name" value="${escapeHtml(member.name)}" required />
                </div>
                <div class="form__group ${errors.role ? 'form__group--error' : ''}">
                  <label class="label label--required">Role</label>
                  <input type="text" class="input" id="memberRole" name="role" value="${escapeHtml(member.role)}" required />
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label">Email</label>
                  <input type="email" class="input" id="memberEmail" name="email" value="${escapeHtml(member.email || '')}" placeholder="e.g. alex@example.com" />
                </div>
                <div class="form__group">
                  <label class="label label--required">Year</label>
                  <input type="number" class="input" id="memberYear" name="year" value="${member.year}" required />
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label">Type</label>
                  <select class="input" id="memberType" name="type">
                    <option value="SENIOR" ${member.type === 'SENIOR' ? 'selected' : ''}>Senior</option>
                    <option value="JUNIOR" ${member.type === 'JUNIOR' ? 'selected' : ''}>Junior</option>
                  </select>
                </div>
                <div class="form__group">
                  <label class="label">Display Order</label>
                  <input type="number" class="input" id="memberOrder" name="order" value="${member.order}" />
                </div>
              </div>

              <div class="form__group">
                <label class="label">Bio</label>
                <textarea class="textarea" id="memberBio" name="bio" rows="4" placeholder="Enter member bio...">${escapeHtml(member.bio || '')}</textarea>
              </div>

              <div class="form__group">
                <label class="label flex items-center gap-[0.8rem] cursor-pointer">
                  <input type="checkbox" name="isActive" value="true" ${member.isActive ? 'checked' : ''} class="w-[1.6rem] h-[1.6rem]" />
                  <span>Active</span>
                </label>
              </div>

              <input type="hidden" name="_csrf" value="${user?.csrfToken || ''}" />
            </form>
          </div>
          <div class="card__footer">
            <div class="form__field-group">
              <button type="button" class="btn btn--primary" onclick="submitForm()">
                <i data-lucide="check"></i>
                Update Member
              </button>
              <a href="/admin/board-members" class="btn btn--ghost btn--cancel">Cancel</a>
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

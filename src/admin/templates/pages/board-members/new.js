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
            <form class="form" id="newBoardMemberForm" hx-post="/admin/board-members" hx-target="#form-response" hx-swap="innerHTML">
              <div id="form-response"></div>

              <div class="form__row form__row--2col">
                <div class="form__group ${errors.name ? 'form__group--error' : ''}">
                  <label class="label label--required">Name</label>
                  <input type="text" class="input" id="memberName" name="name" placeholder="e.g. Alexandra Morales" required />
                </div>
                <div class="form__group ${errors.role ? 'form__group--error' : ''}">
                  <label class="label label--required">Role</label>
                  <input type="text" class="input" id="memberRole" name="role" placeholder="e.g. President" required />
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label">Email</label>
                  <input type="email" class="input" id="memberEmail" name="email" placeholder="e.g. alex@example.com" />
                </div>
                <div class="form__group">
                  <label class="label label--required">Year</label>
                  <input type="number" class="input" id="memberYear" name="year" placeholder="e.g. 2026" required />
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label">Type</label>
                  <select class="input" id="memberType" name="type">
                    <option value="SENIOR">Senior</option>
                    <option value="JUNIOR">Junior</option>
                  </select>
                </div>
                <div class="form__group">
                  <label class="label">Display Order</label>
                  <input type="number" class="input" id="memberOrder" name="order" value="0" />
                </div>
              </div>

              <div class="form__group">
                <label class="label">Bio</label>
                <textarea class="textarea" id="memberBio" name="bio" rows="4" placeholder="Enter member bio..."></textarea>
              </div>

              <div class="form__group">
                <label class="label flex items-center gap-[0.8rem] cursor-pointer">
                  <input type="checkbox" name="isActive" value="true" checked class="w-[1.6rem] h-[1.6rem]" />
                  <span>Active</span>
                </label>
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
              <a href="/admin/board-members" class="btn btn--ghost btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function submitForm() {
        htmx.trigger('#newBoardMemberForm', 'submit');
      }
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

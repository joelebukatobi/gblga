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
            <form class="form" id="newEventForm" hx-post="/admin/events" hx-target="#form-response" hx-swap="innerHTML">
              <div id="form-response"></div>

              <div class="form__row form__row--2col">
                <div class="form__group ${errors.title ? 'form__group--error' : ''}">
                  <label class="label label--required">Title</label>
                  <input type="text" class="input" id="eventTitle" name="title" placeholder="e.g. Cultural Exchange Night" required />
                  ${errors.title ? `<p class="form-feedback form-feedback--error">${errors.title}</p>` : ''}
                </div>
                <div class="form__group ${errors.slug ? 'form__group--error' : ''}">
                  <label class="label">Slug</label>
                  <input type="text" class="input" id="eventSlug" name="slug" placeholder="e.g. cultural-exchange-night" />
                  <p class="form-feedback form-feedback--hint">Leave blank to generate from title</p>
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label">Event Date</label>
                  <input
                    type="text"
                    class="input"
                    id="eventDate"
                    name="eventDate"
                    placeholder="Select date..."
                    data-hs-datepicker='{
                      "placeholder": "Select date...",
                      "autoApply": true,
                      "mode": "single"
                    }'
                  />
                </div>
                <div class="form__group">
                  <label class="label">Event Time</label>
                  <input type="text" class="input" id="eventTime" name="eventTime" placeholder="e.g. 6:00 PM" />
                </div>
              </div>

              <div class="form__group">
                <label class="label">Location</label>
                <input type="text" class="input" id="eventLocation" name="location" placeholder="e.g. Gabelli Commons" />
              </div>

              <div class="form__group">
                <label class="label">Description</label>
                <textarea class="textarea" id="eventDescription" name="description" rows="4" placeholder="Enter event description..."></textarea>
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
              <a href="/admin/events" class="btn btn--ghost btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
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

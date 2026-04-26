// src/admin/templates/pages/events/edit.js
// Edit Event Page

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml } from '../../utils/helpers.js';

export function eventEditPage({ event, user, errors = {} }) {
  const eventDateValue = event.eventDate
    ? new Date(event.eventDate).toISOString().split('T')[0]
    : '';

  const content = `
    <div class="events">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">Edit Event</h1>
            <p class="page-header__subtitle">Update event details</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        <div class="card">
          <div class="card__header">
            <h2>Event Details</h2>
          </div>
          <div class="card__body">
            <form class="form" id="editEventForm" hx-put="/admin/events/${event.id}" hx-target="#form-response" hx-swap="innerHTML">
              <div id="form-response"></div>

              <div class="form__row form__row--2col">
                <div class="form__group ${errors.title ? 'form__group--error' : ''}">
                  <label class="label label--required" for="eventTitle">Title</label>
                  <input type="text" class="input" id="eventTitle" name="title" value="${escapeHtml(event.title)}" required />
                </div>
                <div class="form__group ${errors.slug ? 'form__group--error' : ''}">
                  <label class="label" for="eventSlug">Slug</label>
                  <input type="text" class="input" id="eventSlug" name="slug" value="${event.slug}" readonly />
                  <p class="form-feedback form-feedback--hint">Auto-generated from title</p>
                </div>
              </div>

              <div class="form__row form__row--2col">
                <div class="form__group">
                  <label class="label" for="eventDate">Event Date</label>
                  <input
                    type="text"
                    class="input"
                    id="eventDate"
                    name="eventDate"
                    placeholder="Select date..."
                    value="${eventDateValue}"
                    data-hs-datepicker='{
                      "placeholder": "Select date...",
                      "autoApply": true,
                      "mode": "single"
                    }'
                  />
                </div>
                <div class="form__group">
                  <label class="label" for="eventTime">Event Time</label>
                  <input type="text" class="input" id="eventTime" name="eventTime" value="${escapeHtml(event.eventTime || '')}" placeholder="e.g. 6:00 PM" />
                </div>
              </div>

              <div class="form__group">
                <label class="label" for="eventLocation">Location</label>
                <input type="text" class="input" id="eventLocation" name="location" value="${escapeHtml(event.location || '')}" placeholder="e.g. Gabelli Commons" />
              </div>

              <div class="form__group">
                <label class="label" for="eventDescription">Description</label>
                <textarea class="textarea" id="eventDescription" name="description" rows="4" placeholder="Enter event description...">${escapeHtml(event.description || '')}</textarea>
              </div>

              <input type="hidden" name="_csrf" value="${user?.csrfToken || ''}" />
            </form>
          </div>
          <div class="card__footer">
            <div class="form__field-group">
              <button type="button" class="btn btn--primary" onclick="submitForm()">
                <i data-lucide="check"></i>
                Update Event
              </button>
              <a href="/admin/events" class="btn btn--ghost btn--cancel">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function submitForm() {
        htmx.trigger('#editEventForm', 'submit');
      }
    </script>
  `;

  return mainLayout({
    title: 'Edit Event',
    description: 'Edit event',
    content,
    user,
    activeRoute: '/admin/events',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Events', url: '/admin/events' },
      { label: escapeHtml(event.title), url: `/admin/events/${event.id}/edit` }
    ]
  });
}

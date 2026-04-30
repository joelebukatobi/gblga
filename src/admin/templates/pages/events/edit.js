// src/admin/templates/pages/events/edit.js
// Edit Event Page

import { mainLayout } from '../../layouts/main.js';
import { escapeHtml } from '../../utils/helpers.js';

export function eventEditPage({ event, user, errors = {} }) {
  const eventDateValue = event.eventDate
    ? new Date(event.eventDate).toISOString().split('T')[0]
    : '';

  const flyerUrl = event.featuredImage?.path
    ? `/${event.featuredImage.path}`
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

              <div class="form__row form__row--sidebar">
                <div class="form__group">
                  <label class="label">Flyer</label>
                  <div
                    class="form__photo"
                    onclick="document.getElementById('flyerUpload').click()"
                  >
                    <div id="flyerPreview" class="h-full">
                      ${flyerUrl
                        ? `<img src="${escapeHtml(flyerUrl)}" alt="${escapeHtml(event.title)}" />`
                        : `<div class="form__photo-placeholder"><i data-lucide="image" class="w-[4.8rem] h-[4.8rem] text-grey-500 stroke-1"></i></div>`
                      }
                    </div>
                    <div class="form__photo-overlay">
                      <span>${flyerUrl ? 'Change Flyer' : 'Upload Flyer'}</span>
                      <span>JPG, PNG, WebP. Max 10MB.</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="flyerUpload"
                    name="flyer"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    class="hidden"
                    hx-post="/admin/events/${event.id}/upload-flyer"
                    hx-target="#flyerPreview"
                    hx-swap="innerHTML"
                    hx-encoding="multipart/form-data"
                    hx-trigger="change"
                  />
                </div>

                <div>
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
                      <input type="date" class="input" id="eventDate" name="eventDate" value="${eventDateValue}" />
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

                  <div class="form__group form__group--last">
                    <label class="label" for="eventDescription">Description</label>
                    <textarea class="textarea" id="eventDescription" name="description" rows="4" placeholder="Enter event description...">${escapeHtml(event.description || '')}</textarea>
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
              <a href="/admin/events" class="btn btn--outline btn--cancel">Cancel</a>
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

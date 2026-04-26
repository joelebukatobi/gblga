// src/admin/templates/pages/events/list.js
// Events List Page

import { mainLayout } from '../../layouts/main.js';
import { DeleteModal } from '../../components/delete-modal.js';
import { listToolbar } from '../../partials/list-toolbar.js';
import { escapeHtml, formatDate } from '../../utils/helpers.js';

export function eventsListPage({ events, total, page, totalPages, filters, user, toast }) {
  const toastScript = toast ? `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const toastMessages = { deleted: 'Event deleted successfully!' };
        const message = toastMessages['${toast}'] || '${toast}';
        document.body.dispatchEvent(new CustomEvent('htmx:toast', {
          detail: { message: message, type: 'success' }
        }));
        const url = new URL(window.location);
        url.searchParams.delete('toast');
        window.history.replaceState({}, '', url);
      });
    </script>
  ` : '';

  const deleteModal = new DeleteModal({
    entityName: 'Event',
    entityLabel: 'name',
    deleteUrlPath: '/admin/events',
    csrfToken: user?.csrfToken || '',
  });

  const content = `
    <div class="events">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">Events</h1>
            <p class="page-header__subtitle">Manage your events</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        ${listToolbar({
          searchUrl: '/admin/events',
          searchTarget: '#events-table-container',
          searchPlaceholder: 'Search events...',
          searchValue: filters.search || '',
          filters: [],
          hasAddButton: true,
          addButtonUrl: '/admin/events/new',
          addButtonText: events.length === 0 ? 'Create First Event' : 'New Event',
        })}

        <div id="events-table-container" class="events__table-content">
        ${events.length === 0 ? emptyState() : `
          <table class="table">
            <thead class="table__thead">
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="table__tbody">
              ${events.map((event) => {
                const date = event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '-';
                const statusClass = {
                  UPCOMING: 'badge--info',
                  ONGOING: 'badge--warning',
                  COMPLETED: 'badge--success',
                  CANCELLED: 'badge--error',
                }[event.status] || 'badge--neutral';

                return `
                  <tr class="table__tr">
                    <td class="table__td">
                      <span class="table__label">Title</span>
                      <div class="table__title">
                        <a href="/admin/events/${event.id}/edit">${escapeHtml(event.title)}</a>
                      </div>
                    </td>
                    <td class="table__td">
                      <span class="table__label">Date</span>
                      ${date}
                      ${event.eventTime ? `<span class="text-gray-500"> at ${event.eventTime}</span>` : ''}
                    </td>
                    <td class="table__td">
                      <span class="table__label">Location</span>
                      ${event.location || '-'}
                    </td>
                    <td class="table__td">
                      <span class="table__label">Status</span>
                      <span class="badge ${statusClass}">${event.status}</span>
                    </td>
                    <td class="table__td table__td--actions">
                      <div class="row-actions">
                        <a href="/admin/events/${event.id}/edit" class="btn btn--ghost row-action row-action--edit">
                          <i data-lucide="pencil"></i>
                          <span>Edit</span>
                        </a>
                        <button type="button" class="btn btn--ghost row-action row-action--delete"
                          data-event-id="${event.id}" data-event-name="${escapeHtml(event.title)}"
                          onclick="openDeleteModal(this)">
                          <i data-lucide="trash-2"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
        </div>

        ${totalPages > 1 ? paginationHtml({ page, totalPages, filters }) : ''}
      </div>
    </div>

    ${toastScript}
  `;

  return mainLayout({
    title: 'Events',
    description: 'Manage your events',
    content: content + deleteModal.render(),
    user,
    activeRoute: '/admin/events',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Events', url: '/admin/events' },
    ],
  });
}

function emptyState() {
  return `
    <div class="empty">
      <h3>No events yet</h3>
      <p>Create your first event to get started</p>
    </div>
  `;
}

function paginationHtml({ page, totalPages, filters }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);

  const baseQuery = params.toString();
  const queryPrefix = baseQuery ? `&${baseQuery}` : '';

  let links = '';
  const prevDisabled = page <= 1 ? 'pagination__item--disabled' : '';
  const prevHref = page > 1 ? `/admin/events?page=${page - 1}${queryPrefix}` : '#';
  links += `<a href="${prevHref}" class="pagination__item ${prevDisabled}"><i data-lucide="chevron-left"></i></a>`;

  let pageNumbers = [];
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page <= 3) {
    pageNumbers = [1, 2, 3, 4, '...', totalPages];
  } else if (page >= totalPages - 2) {
    pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    pageNumbers = [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  pageNumbers.forEach((p) => {
    if (p === '...') {
      links += '<span class="pagination__ellipsis">...</span>';
    } else {
      const active = p === page ? 'pagination__item--active' : '';
      links += `<a href="/admin/events?page=${p}${queryPrefix}" class="pagination__item ${active}">${p}</a>`;
    }
  });

  const nextDisabled = page >= totalPages ? 'pagination__item--disabled' : '';
  const nextHref = page < totalPages ? `/admin/events?page=${page + 1}${queryPrefix}` : '#';
  links += `<a href="${nextHref}" class="pagination__item ${nextDisabled}"><i data-lucide="chevron-right"></i></a>`;

  return `
    <footer class="page-footer">
      <div class="pagination">${links}</div>
    </footer>
  `;
}

// src/admin/templates/pages/board-members/list.js
// Board Members List Page

import { mainLayout } from '../../layouts/main.js';
import { DeleteModal } from '../../components/delete-modal.js';
import { listToolbar } from '../../partials/list-toolbar.js';
import { escapeHtml, formatDate } from '../../utils/helpers.js';

export function boardMembersListPage({ members, total, page, totalPages, filters, user, toast }) {
  const toastScript = toast ? `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const toastMessages = { deleted: 'Board member deleted successfully!' };
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
    entityName: 'Board Member',
    entityLabel: 'name',
    deleteUrlPath: '/admin/board-members',
    csrfToken: user?.csrfToken || '',
  });

  const content = `
    <div class="board-members">
      <div class="content">
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">Board Members</h1>
            <p class="page-header__subtitle">Manage your board members</p>
          </div>
          <div class="page-header__toast-container"></div>
        </div>

        ${listToolbar({
          searchPlaceholder: 'Search board members...',
          searchValue: filters.search || '',
          filters: [],
          hasAddButton: true,
          addButtonUrl: '/admin/board-members/new',
          addButtonText: members.length === 0 ? 'Create First Member' : 'New Member',
        })}

        <div class="board-members__table-content">
        ${members.length === 0 ? emptyState() : `
          <table class="table">
            <thead class="table__thead">
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Type</th>
                <th>Year</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="table__tbody">
              ${members.map((member) => {
                const typeClass = member.type === 'SENIOR' ? 'badge--primary' : 'badge--info';
                const photoPreview = member.photo?.thumbnailPath
                  ? `<img src="${member.photo.thumbnailPath}" alt="" class="w-[3.2rem] h-[3.2rem] rounded-full object-cover">`
                  : `<div class="w-[3.2rem] h-[3.2rem] rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><i data-lucide="user" class="h-[1.6rem] w-[1.6rem]"></i></div>`;

                return `
                  <tr class="table__tr">
                    <td class="table__td">
                      <span class="table__label">Name</span>
                      <div class="flex items-center gap-[1.2rem]">
                        ${photoPreview}
                        <div class="table__title">
                          <a href="/admin/board-members/${member.id}/edit">${escapeHtml(member.name)}</a>
                        </div>
                      </div>
                    </td>
                    <td class="table__td">
                      <span class="table__label">Role</span>
                      ${escapeHtml(member.role)}
                    </td>
                    <td class="table__td">
                      <span class="table__label">Type</span>
                      <span class="badge ${typeClass}">${member.type}</span>
                    </td>
                    <td class="table__td">
                      <span class="table__label">Year</span>
                      ${member.year}
                    </td>
                    <td class="table__td">
                      <span class="table__label">Active</span>
                      ${member.isActive ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--neutral">No</span>'}
                    </td>
                    <td class="table__td table__td--actions">
                      <div class="row-actions">
                        <a href="/admin/board-members/${member.id}/edit" class="btn btn--ghost row-action row-action--edit">
                          <i data-lucide="pencil"></i>
                          <span>Edit</span>
                        </a>
                        <button type="button" class="btn btn--ghost row-action row-action--delete"
                          data-member-id="${member.id}" data-member-name="${escapeHtml(member.name)}"
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
    title: 'Board Members',
    description: 'Manage your board members',
    content: content + deleteModal.render(),
    user,
    activeRoute: '/admin/board-members',
    breadcrumbs: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Board Members', url: '/admin/board-members' },
    ],
  });
}

function emptyState() {
  return `
    <div class="empty">
      <h3>No board members yet</h3>
      <p>Create your first board member to get started</p>
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
  const prevHref = page > 1 ? `/admin/board-members?page=${page - 1}${queryPrefix}` : '#';
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
      links += `<a href="/admin/board-members?page=${p}${queryPrefix}" class="pagination__item ${active}">${p}</a>`;
    }
  });

  const nextDisabled = page >= totalPages ? 'pagination__item--disabled' : '';
  const nextHref = page < totalPages ? `/admin/board-members?page=${page + 1}${queryPrefix}` : '#';
  links += `<a href="${nextHref}" class="pagination__item ${nextDisabled}"><i data-lucide="chevron-right"></i></a>`;

  return `
    <footer class="page-footer">
      <div class="pagination">${links}</div>
    </footer>
  `;
}

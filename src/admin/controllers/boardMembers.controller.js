// src/admin/controllers/boardMembers.controller.js
// Board Members controller

import { boardMembersService } from '../../services/boardMembers.service.js';

/**
 * Board Members Controller
 */
class BoardMembersController {
  async list(request, reply) {
    try {
      const user = request.user;
      const {
        search,
        type,
        year,
        sortBy = 'order',
        sortOrder = 'asc',
        page = 1,
        toast,
      } = request.query;

      const { data: members, pagination } = await boardMembersService.getAll({
        search,
        type,
        year,
        sortBy,
        sortOrder,
        page: parseInt(page, 10) || 1,
        limit: 10,
      });

      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply.type('text/html').send(membersTableFragment({ members, pagination }));
      }

      const { boardMembersListPage } = await import('../templates/pages/board-members/index.js');

      return reply.type('text/html').send(
        boardMembersListPage({
          user,
          members,
          total: pagination.total,
          page: pagination.page,
          totalPages: pagination.totalPages,
          filters: { search, type, year },
          toast,
        })
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load board members.' }));
    }
  }

  async showNewForm(request, reply) {
    try {
      const user = request.user;
      const { boardMemberNewPage } = await import('../templates/pages/board-members/index.js');
      return reply.type('text/html').send(boardMemberNewPage({ user }));
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load form.' }));
    }
  }

  async create(request, reply) {
    try {
      const user = request.user;

      // Parse multipart form data
      const parts = request.parts();
      const fields = {};
      let photoFile = null;

      for await (const part of parts) {
        if (part.file) {
          // It's a file
          photoFile = part;
        } else {
          // It's a field
          fields[part.fieldname] = await part.value;
        }
      }

      const { name, role, email, bio, type, year } = fields;

      if (!name || !role || !year) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'Name, role and year are required.' }));
      }

      // Create the member
      const member = await boardMembersService.create({
        name,
        role,
        email,
        bio,
        type: type || 'SENIOR',
        year,
      }, user.id);

      // Handle photo upload if present
      if (photoFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(photoFile.mimetype)) {
          const photoUrl = await boardMembersService.uploadPhoto(member.id, photoFile);
          await boardMembersService.updatePhoto(member.id, photoUrl);
        }
      }

      reply.header('HX-Location', `/admin/board-members/${member.id}/edit`);
      reply.header('HX-Trigger', JSON.stringify({ "htmx:toast": { message: 'Board member created successfully!', type: 'success' } }));
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to create board member.' }));
    }
  }

  async showEditForm(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      const member = await boardMembersService.getById(id);
      if (!member) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Board member not found.' }));
      }

      const { boardMemberEditPage } = await import('../templates/pages/board-members/index.js');
      return reply.type('text/html').send(boardMemberEditPage({ user, member }));
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load board member.' }));
    }
  }

  async update(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      // Parse multipart form data
      const parts = request.parts();
      const fields = {};
      let photoFile = null;

      for await (const part of parts) {
        if (part.file) {
          // It's a file
          photoFile = part;
        } else {
          // It's a field
          fields[part.fieldname] = await part.value;
        }
      }

      const { name, role, email, bio, type, year } = fields;

      const existing = await boardMembersService.getById(id);
      if (!existing) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Board member not found.' }));
      }

      await boardMembersService.update(id, {
        name,
        role,
        email,
        bio,
        type,
        year,
      }, user.id);

      // Handle photo upload if present
      if (photoFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(photoFile.mimetype)) {
          const photoUrl = await boardMembersService.uploadPhoto(id, photoFile);
          await boardMembersService.updatePhoto(id, photoUrl);
        }
      }

      reply.header('HX-Trigger', JSON.stringify({ "htmx:toast": { message: 'Board member updated successfully!', type: 'success' } }));
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to update board member.' }));
    }
  }

  async uploadPhoto(request, reply) {
    try {
      const { id } = request.params;

      const member = await boardMembersService.getById(id);
      if (!member) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Board member not found.' }));
      }

      const data = await request.file();
      if (!data) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'No file uploaded.' }));
      }

      const { mimetype } = data;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(mimetype)) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' }));
      }

      const photoUrl = await boardMembersService.uploadPhoto(id, data);
      const updatedMember = await boardMembersService.updatePhoto(id, photoUrl);

      return reply.type('text/html').send(`
        <div id="photoPreview">
          <img src="${photoUrl}?t=${Date.now()}" alt="${updatedMember.name}" />
        </div>
        <div id="photo-toast"></div>
        <script>
          document.body.dispatchEvent(new CustomEvent('htmx:toast', {
            detail: { message: 'Photo updated successfully!', type: 'success' }
          }));
        </script>
      `);
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to upload photo.' }));
    }
  }

  async delete(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      await boardMembersService.delete(id, user.id);
      reply.header('HX-Redirect', '/admin/board-members?toast=deleted');
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to delete board member.' }));
    }
  }
}

function membersTableFragment({ members, pagination }) {
  if (!members || members.length === 0) {
    return `
      <div class="empty">
        <h3>No board members found</h3>
        <p>Get started by creating your first board member.</p>
      </div>
    `;
  }

  const rows = members.map((member) => {
    const typeClass = member.type === 'SENIOR' ? 'badge--primary' : 'badge--info';
    return `
      <tr class="table__tr">
        <td class="table__td">
          <span class="table__label">Name</span>
          <div class="table__title">
            <a href="/admin/board-members/${member.id}/edit">${member.name}</a>
          </div>
        </td>
        <td class="table__td">
          <span class="table__label">Role</span>
          ${member.role}
        </td>
        <td class="table__td">
          <span class="table__label">Type</span>
          <span class="badge ${typeClass}">${member.type}</span>
        </td>
        <td class="table__td">
          <span class="table__label">Year</span>
          ${member.year}
        </td>
        <td class="table__td table__td--actions">
          <div class="row-actions">
            <a href="/admin/board-members/${member.id}/edit" class="btn btn--ghost row-action row-action--edit">
              <i data-lucide="pencil"></i>
              <span>Edit</span>
            </a>
            <button type="button" class="btn btn--ghost row-action row-action--delete"
              data-member-id="${member.id}" data-member-name="${member.name}"
              onclick="openDeleteModal(this)">
              <i data-lucide="trash-2"></i>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const paginationFragment = pagination && pagination.totalPages > 1
    ? fragmentPaginationHtml({ page: pagination.page, totalPages: pagination.totalPages, filters: {} })
    : '';

  return `
    <table class="table">
      <thead class="table__thead">
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Type</th>
          <th>Year</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody class="table__tbody">${rows}</tbody>
    </table>
    ${paginationFragment}
  `;
}

function fragmentPaginationHtml({ page, totalPages, filters }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.year) params.set('year', filters.year);

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

function errorFragment({ message }) {
  return `
    <div class="alert alert--error" role="alert">
      <i data-lucide="alert-circle" class="alert__icon"></i>
      <span class="alert__message">${message}</span>
    </div>
  `;
}

export const boardMembersController = new BoardMembersController();
export default boardMembersController;

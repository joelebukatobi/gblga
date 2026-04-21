// src/admin/controllers/users.controller.js
// Users controller - handles user HTTP requests

import { usersService } from '../../services/users.service.js';
import { successToast, errorToast } from '../templates/partials/alerts.js';

/**
 * Users Controller
 * Handles user-related HTTP requests
 */
class UsersController {
  /**
   * GET /admin/users
   * List all users
   */
  async list(request, reply) {
    try {
      const user = request.user;
      const {
        role,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        toast,
      } = request.query;

      // Get users with pagination
      const { users, total, totalPages, limit } = await usersService.getAllUsers({
        role,
        status,
        search,
        sortBy,
        sortOrder,
        page: parseInt(page, 10) || 1,
        limit: 10,
      });

      // Get counts for filter tabs
      const roleCounts = await usersService.countByRole();
      const statusCounts = await usersService.countByStatus();

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        // Return only table fragment
        return reply.type('text/html').send(usersTableFragment({
          users,
          total,
          page: parseInt(page, 10) || 1,
          totalPages,
          limit,
        }));
      }

      // Import users list template
      const { usersListPage } = await import('../templates/pages/users/index.js');

      return reply.type('text/html').send(
        usersListPage({
          user,
          users,
          pagination: { total, page: parseInt(page, 10) || 1, totalPages, limit },
          counts: { roleCounts, statusCounts },
          filters: { role, status, search },
          toast,
        })
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to load users.',
      }));
    }
  }

  /**
   * GET /admin/users/new
   * Show new user form
   */
  async showNewForm(request, reply) {
    try {
      const user = request.user;

      // Import new user template
      const { usersNewPage } = await import('../templates/pages/users/index.js');

      return reply.type('text/html').send(
        usersNewPage({ user })
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to load form.',
      }));
    }
  }

  /**
   * POST /admin/users
   * Create a new user
   */
  async create(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { firstName, lastName, email, role, sendInvite } = request.body;

      // Validation
      if (!firstName || !lastName || !email || !role) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'All fields are required.',
        }));
      }

      // Check if email already exists
      const existingUser = await usersService.getUserByEmail(email);
      if (existingUser) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'A user with this email already exists.',
        }));
      }

      // Create user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      const newUser = await usersService.createUser(userData, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply
          .header('HX-Redirect', '/admin/users?toast=created')
          .type('text/html')
          .send(successToast({ message: 'User created successfully.' }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=created').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to create user.',
      }));
    }
  }

  /**
   * GET /admin/users/:id/edit
   * Show edit user form
   */
  async showEditForm(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      // Get user
      const editUser = await usersService.getUserById(id);

      if (!editUser) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Get user stats
      const userStats = await usersService.getUserStats(id);

      // Import edit user template
      const { usersEditPage } = await import('../templates/pages/users/index.js');

      return reply.type('text/html').send(
        usersEditPage({ user, editUser, userStats })
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to load user.',
      }));
    }
  }

  /**
   * PUT /admin/users/:id
   * Update a user
   */
  async update(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { id } = request.params;
      const { firstName, lastName, email, role } = request.body;

      // Get user
      const existingUser = await usersService.getUserById(id);
      if (!existingUser) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Prevent self-role change if last admin
      if (id === currentUserId && role && role !== existingUser.role) {
        const isLastAdmin = await usersService.isLastAdmin(id);
        if (isLastAdmin && existingUser.role === 'ADMIN') {
          reply.code(400);
          return reply.type('text/html').send(errorToast({
            message: 'Cannot change role. You are the last admin.',
          }));
        }
      }

      // Check if email already exists (if changing email)
      if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
        const userWithEmail = await usersService.getUserByEmail(email);
        if (userWithEmail && userWithEmail.id !== id) {
          reply.code(400);
          return reply.type('text/html').send(errorToast({
            message: 'A user with this email already exists.',
          }));
        }
      }

      // Update user
      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName) updateData.lastName = lastName.trim();
      if (email) updateData.email = email.trim().toLowerCase();
      if (role) updateData.role = role;

      await usersService.updateUser(id, updateData, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply
          .header('HX-Redirect', '/admin/users?toast=updated')
          .type('text/html')
          .send(successToast({ message: 'User updated successfully.' }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=updated').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to update user.',
      }));
    }
  }

  /**
   * DELETE /admin/users/:id
   * Delete a user
   */
  async delete(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { id } = request.params;

      // Get user
      const userToDelete = await usersService.getUserById(id);
      if (!userToDelete) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Prevent self-deletion
      if (id === currentUserId) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'You cannot delete your own account.',
        }));
      }

      // Prevent deleting last admin
      if (userToDelete.role === 'ADMIN' && userToDelete.status === 'ACTIVE') {
        const isLastAdmin = await usersService.isLastAdmin(id);
        if (isLastAdmin) {
          reply.code(400);
          return reply.type('text/html').send(errorToast({
            message: 'Cannot delete the last admin user.',
          }));
        }
      }

      // Delete user
      await usersService.deleteUser(id, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply
          .header('HX-Redirect', '/admin/users?toast=deleted')
          .type('text/html')
          .send(successToast({ message: 'User deleted successfully.' }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=deleted').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to delete user.',
      }));
    }
  }

  /**
   * POST /admin/users/:id/suspend
   * Suspend a user
   */
  async suspend(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { id } = request.params;

      // Get user
      const userToSuspend = await usersService.getUserById(id);
      if (!userToSuspend) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Prevent self-suspension
      if (id === currentUserId) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'You cannot suspend your own account.',
        }));
      }

      // Prevent suspending last admin
      if (userToSuspend.role === 'ADMIN') {
        const isLastAdmin = await usersService.isLastAdmin(id);
        if (isLastAdmin) {
          reply.code(400);
          return reply.type('text/html').send(errorToast({
            message: 'Cannot suspend the last admin user.',
          }));
        }
      }

      // Suspend user
      await usersService.suspendUser(id, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply.type('text/html').send(successToast({
          message: 'User suspended successfully.',
        }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=suspended').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to suspend user.',
      }));
    }
  }

  /**
   * POST /admin/users/:id/activate
   * Activate a suspended user
   */
  async activate(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { id } = request.params;

      // Get user
      const userToActivate = await usersService.getUserById(id);
      if (!userToActivate) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Activate user
      await usersService.activateUser(id, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply.type('text/html').send(successToast({
          message: 'User activated successfully.',
        }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=activated').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to activate user.',
      }));
    }
  }

  /**
   * POST /admin/users/:id/resend-invite
   * Resend invitation to a user
   */
  async resendInvite(request, reply) {
    try {
      const currentUserId = request.user?.id;
      const { id } = request.params;

      // Get user
      const userToInvite = await usersService.getUserById(id);
      if (!userToInvite) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Only invited users can have invitation resent
      if (userToInvite.status !== 'INVITED') {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'Invitation can only be resent for users with invited status.',
        }));
      }

      // Resend invite
      await usersService.resendInvite(id, currentUserId);

      // Check if HTMX request
      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply.type('text/html').send(successToast({
          message: 'Invitation resent successfully.',
        }));
      }

      return reply.header('HX-Redirect', '/admin/users?toast=invite-resent').send();
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to resend invitation.',
      }));
    }
  }

  /**
   * POST /admin/users/:id/avatar
   * Upload avatar for user
   */
  async uploadAvatar(request, reply) {
    try {
      const { id } = request.params;

      // Get user
      const user = await usersService.getUserById(id);
      if (!user) {
        reply.code(404);
        return reply.type('text/html').send(errorToast({
          message: 'User not found.',
        }));
      }

      // Get file from multipart
      const data = await request.file();
      if (!data) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'No file provided.',
        }));
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(data.mimetype)) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'Invalid file type. Only JPG and PNG allowed.',
        }));
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const buffer = await data.toBuffer();
      if (buffer.length > maxSize) {
        reply.code(400);
        return reply.type('text/html').send(errorToast({
          message: 'File too large. Maximum size is 10MB.',
        }));
      }

      // Upload avatar
      const avatarUrl = await usersService.uploadAvatar(id, { toBuffer: () => Promise.resolve(buffer), mimetype: data.mimetype });

      // Update user's avatar URL
      await usersService.updateAvatar(id, avatarUrl);

      // Return success for HTMX
      return reply.type('text/html').send(`
        <div class="flex flex-col items-center">
          <img src="${avatarUrl}?t=${Date.now()}" alt="${user.firstName}" class="h-24 w-24 rounded-full object-cover mb-4" />
          <p class="text-sm text-green-600">Avatar updated successfully!</p>
        </div>
      `);
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorToast({
        message: 'Failed to upload avatar.',
      }));
    }
  }
}

/**
 * Generate users table HTML fragment for HTMX updates
 */
function usersTableFragment({ users, total, page, totalPages, limit }) {
  // This will be replaced when we create the actual templates
  // For now, return a simple table
  const rows = users.map(user => `
    <tr class="table__tr">
      <td class="table__td">
        <span class="table__label">User</span>
        <div class="flex items-center gap-3">
          ${user.avatarUrl 
            ? `<img src="${user.avatarUrl}" alt="${user.firstName}" class="w-10 h-10 rounded-full object-cover" />`
            : `<div class="avatar avatar--placeholder"><i data-lucide="user" class="size-5 text-grey-400"></i></div>`
          }
          <div>
            <div class="table__title">
              <a href="/admin/users/${user.id}/edit">${user.firstName} ${user.lastName}</a>
            </div>
            <span class="table__subtitle">${user.email}</span>
          </div>
        </div>
      </td>
      <td class="table__td">
        <span class="table__label">Role</span>
        <span class="badge badge--${getRoleBadgeClass(user.role)}">${user.role}</span>
      </td>
      <td class="table__td">
        <span class="table__label">Status</span>
        <span class="status status--${getStatusClass(user.status)}">
          <span class="status__dot"></span>
          ${user.status}
        </span>
      </td>
      <td class="table__td table__td--actions">
        <div class="btn-group__actions">
          <a href="/admin/users/${user.id}/edit" class="btn--action btn--action--edit">
            <i data-lucide="pencil"></i>
            <span class="btn--action__text">Edit</span>
          </a>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <tbody class="table__tbody" id="users-table-body">
      ${rows}
    </tbody>
  `;
}

function getRoleBadgeClass(role) {
  const classes = {
    'ADMIN': 'primary',
    'EDITOR': 'purple',
    'AUTHOR': 'info',
    'VIEWER': 'warning'
  };
  return classes[role] || 'default';
}

function getStatusClass(status) {
  const classes = {
    'ACTIVE': 'success',
    'INVITED': 'warning',
    'SUSPENDED': 'danger'
  };
  return classes[status] || 'default';
}

export const usersController = new UsersController();

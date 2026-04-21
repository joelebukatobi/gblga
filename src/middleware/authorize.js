// src/middleware/authorize.js

/**
 * Authorization Middleware
 * Role-based access control (RBAC)
 * Following Single Responsibility Principle
 */

// Role hierarchy - higher roles have more permissions
const ROLE_HIERARCHY = {
  'VIEWER': 1,
  'AUTHOR': 2,
  'EDITOR': 3,
  'ADMIN': 4
};

/**
 * Check if user's role meets minimum required role
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Minimum role required
 * @returns {boolean} - Whether user has sufficient permissions
 */
function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Authorization middleware factory
 * Returns middleware that checks if user has required role
 * @param {...string} allowedRoles - Roles that can access this resource
 * @returns {Function} - Fastify middleware
 */
export function authorize(...allowedRoles) {
  return async function authorizeMiddleware(request, reply) {
    // Ensure user is authenticated first
    if (!request.user) {
      reply.code(401);
      throw new Error('Authentication required');
    }
    
    const userRole = request.user.role;
    
    // Check if user has any of the allowed roles
    const hasPermission = allowedRoles.some(role => hasRole(userRole, role));
    
    if (!hasPermission) {
      reply.code(403);
      throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }
  };
}

/**
 * Check if user owns the resource or is admin
 * Factory function that creates ownership checker middleware
 * @param {Function} getResourceOwnerId - Async function to get resource owner ID
 */
export function authorizeOwnerOrAdmin(getResourceOwnerId) {
  return async function ownershipMiddleware(request, reply) {
    if (!request.user) {
      reply.code(401);
      throw new Error('Authentication required');
    }
    
    // Admins can access everything
    if (request.user.role === 'ADMIN') {
      return;
    }
    
    // Get resource owner
    const resourceId = request.params.id;
    const ownerId = await getResourceOwnerId(resourceId);
    
    // Check ownership
    if (ownerId !== request.user.id) {
      reply.code(403);
      throw new Error('Access denied. You do not own this resource.');
    }
  };
}

/**
 * Check if user owns resource OR has specific role
 * More flexible than authorizeOwnerOrAdmin
 */
export function authorizeOwnerOrRoles(getResourceOwnerId, ...allowedRoles) {
  return async function flexibleAuthMiddleware(request, reply) {
    if (!request.user) {
      reply.code(401);
      throw new Error('Authentication required');
    }
    
    // Check if user has allowed role
    const hasAllowedRole = allowedRoles.some(role => hasRole(request.user.role, role));
    
    if (hasAllowedRole) {
      return;
    }
    
    // Check ownership
    const resourceId = request.params.id;
    const ownerId = await getResourceOwnerId(resourceId);
    
    if (ownerId !== request.user.id) {
      reply.code(403);
      throw new Error('Access denied');
    }
  };
}

/**
 * Require specific permission (for fine-grained control)
 * @param {string} permission - Required permission
 */
export function requirePermission(permission) {
  return async function permissionMiddleware(request, reply) {
    if (!request.user) {
      reply.code(401);
      throw new Error('Authentication required');
    }
    
    // Define permissions per role
    const PERMISSIONS = {
      'ADMIN': ['*'], // Admin has all permissions
      'EDITOR': [
        'posts:read', 'posts:create', 'posts:update', 'posts:delete', 'posts:publish',
        'categories:read', 'categories:create', 'categories:update', 'categories:delete',
        'tags:read', 'tags:create', 'tags:update', 'tags:delete',
        'images:read', 'images:create', 'images:update', 'images:delete',
        'videos:read', 'videos:create', 'videos:update', 'videos:delete',
        'users:read'
      ],
      'AUTHOR': [
        'posts:read', 'posts:create', 'posts:update', 'posts:delete_own',
        'images:read', 'images:create',
        'videos:read', 'videos:create'
      ],
      'VIEWER': [
        'posts:read'
      ]
    };
    
    const userPermissions = PERMISSIONS[request.user.role] || [];
    
    // Check if user has permission or wildcard
    const hasPermission = userPermissions.includes('*') || 
                         userPermissions.includes(permission);
    
    if (!hasPermission) {
      reply.code(403);
      throw new Error(`Permission denied: ${permission}`);
    }
  };
}

// Convenience exports for common role checks
export const requireAdmin = authorize('ADMIN');
export const requireEditor = authorize('EDITOR', 'ADMIN');
export const requireAuthor = authorize('AUTHOR', 'EDITOR', 'ADMIN');
export const requireAuthenticated = authorize('VIEWER', 'AUTHOR', 'EDITOR', 'ADMIN');

export default {
  authorize,
  authorizeOwnerOrAdmin,
  authorizeOwnerOrRoles,
  requirePermission,
  requireAdmin,
  requireEditor,
  requireAuthor,
  requireAuthenticated
};

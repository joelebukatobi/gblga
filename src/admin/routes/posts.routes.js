// src/admin/routes/posts.routes.js
import { postsController } from '../controllers/posts.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Posts Routes
 * Defines all post-related endpoints
 */
export default async function postsRoutes(fastify) {

  // GET /admin/posts
  // List all posts with filters
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.listPosts.bind(postsController)
  });

  // GET /admin/posts/new
  // Show new post form
  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.showNewPostForm.bind(postsController)
  });

  // POST /admin/posts
  // Create new post
  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.createPost.bind(postsController)
  });

  // GET /admin/posts/:id/edit
  // Show edit post form
  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.showEditPostForm.bind(postsController)
  });

  // PUT /admin/posts/:id
  // Update post
  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.updatePost.bind(postsController)
  });

  // DELETE /admin/posts/:id
  // Delete post
  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.deletePost.bind(postsController)
  });

  // POST /admin/posts/:id/publish
  // Quick publish
  fastify.post('/:id/publish', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.publishPost.bind(postsController)
  });

  // POST /admin/posts/:id/unpublish
  // Quick unpublish
  fastify.post('/:id/unpublish', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.unpublishPost.bind(postsController)
  });

  // GET /admin/posts/check-slug
  // Check slug availability
  fastify.get('/check-slug', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.checkSlug.bind(postsController)
  });

  // POST /admin/posts/upload-image
  // Upload featured image
  fastify.post('/upload-image', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.uploadImage.bind(postsController)
  });

  // POST /admin/posts/upload-video
  // Upload inline video for editor
  fastify.post('/upload-video', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.uploadVideo.bind(postsController)
  });

  // GET /admin/posts/media/images
  // List media library images for editor picker
  fastify.get('/media/images', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.listEditorImages.bind(postsController)
  });

  // GET /admin/posts/media/videos
  // List media library videos for editor picker
  fastify.get('/media/videos', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: postsController.listEditorVideos.bind(postsController)
  });

  // POST /admin/posts/:id/view
  // Increment post view count (public endpoint for blog tracking)
  fastify.post('/:id/view', {
    handler: postsController.incrementViewCount.bind(postsController)
  });
}

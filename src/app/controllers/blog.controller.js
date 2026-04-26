import { appBlogIndexPage, appBlogPartial } from '../templates/pages/blog/index.js';
import { appBlogPostPage, appBlogPostPartial } from '../templates/pages/blog/post.js';

class BlogController {
  async index(request, reply) {
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;
    const tag = request.query?.tag || '';
    const category = request.query?.category || '';
    const isHtmxRequest = request.headers['hx-request'] === 'true';

    // Build API URL with filters if provided
    let apiUrl = `/api/v1/posts?page=${page}&limit=9`;
    if (tag) {
      apiUrl += `&tag=${encodeURIComponent(tag)}`;
    }
    if (category) {
      apiUrl += `&category=${encodeURIComponent(category)}`;
    }

    // Fetch posts, tags, and categories in parallel
    const [apiResponse, tagsResponse, categoriesResponse] = await Promise.all([
      request.server.inject({
        method: 'GET',
        url: apiUrl,
      }),
      request.server.inject({
        method: 'GET',
        url: '/api/v1/tags',
      }),
      request.server.inject({
        method: 'GET',
        url: '/api/v1/categories',
      }),
    ]);

    // Get tags from API or use empty array
    let tags = [];
    if (tagsResponse.statusCode === 200) {
      const tagsPayload = tagsResponse.json();
      tags = tagsPayload?.data || [];
    }

    // Get categories from API or use empty array
    let categories = [];
    if (categoriesResponse.statusCode === 200) {
      const categoriesPayload = categoriesResponse.json();
      categories = categoriesPayload?.data || [];
    }

    // Handle API errors
    if (apiResponse.statusCode !== 200) {
      reply.code(500);
      return reply.type('text/html').send('<h1>Error loading posts</h1>');
    }

    const payload = apiResponse.json();
    const posts = payload?.data || [];
    const currentPage = payload?.meta?.current_page || page;
    const totalPages = payload?.meta?.last_page || 1;
    const totalPosts = payload?.meta?.total || posts.length;

    // Return partial content for HTMX requests
    if (isHtmxRequest) {
      return reply.type('text/html').send(appBlogPartial({ 
        posts, 
        page: currentPage, 
        totalPages, 
        totalPosts,
        tags,
        categories,
        activeTag: tag,
        activeCategory: category 
      }));
    }

    // Return full page
    return reply.type('text/html').send(
      appBlogIndexPage({
        posts,
        page: currentPage,
        totalPages,
        totalPosts,
        tags,
        categories,
        activeTag: tag,
        activeCategory: category,
      }),
    );
  }

  async show(request, reply) {
    const { slug } = request.params;
    const isHtmxRequest = request.headers['hx-request'] === 'true';

    const postResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/posts/${encodeURIComponent(slug)}`,
    });

    if (postResponse.statusCode === 404) {
      reply.code(404);
      return reply.type('text/html').send('<h1>Post not found</h1>');
    }

    if (postResponse.statusCode !== 200) {
      reply.code(500);
      return reply.type('text/html').send('<h1>Server error</h1>');
    }

    const commentsResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/posts/${encodeURIComponent(slug)}/comments?limit=50`,
    });

    const post = postResponse.json();
    const commentsPayload = commentsResponse.statusCode === 200 ? commentsResponse.json() : { data: [] };

    // Fetch related posts (same category, excluding current post)
    let relatedPosts = [];
    if (post.category?.slug) {
      const relatedResponse = await request.server.inject({
        method: 'GET',
        url: `/api/v1/posts?category=${post.category.slug}&limit=3&exclude=${post.id}`,
      });
      if (relatedResponse.statusCode === 200) {
        const relatedPayload = relatedResponse.json();
        relatedPosts = relatedPayload?.data || [];
      }
    }

    // Return partial content for HTMX requests
    if (isHtmxRequest) {
      return reply.type('text/html').send(
        appBlogPostPartial({
          post,
          comments: commentsPayload?.data || [],
          relatedPosts,
        }),
      );
    }

    // Return full page
    return reply.type('text/html').send(
      appBlogPostPage({
        post,
        comments: commentsPayload?.data || [],
        relatedPosts,
      }),
    );
  }
}

export const blogController = new BlogController();

import { appBlogIndexPage } from '../templates/pages/blog/index.js';
import { appBlogPostPage } from '../templates/pages/blog/post.js';

class BlogController {
  async index(request, reply) {
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;

    const apiResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/posts?page=${page}&limit=10`,
    });

    if (apiResponse.statusCode !== 200) {
      request.log.error({ statusCode: apiResponse.statusCode }, 'Failed to load blog posts from API');
      return reply.type('text/html').send(appBlogIndexPage({ posts: [], page, totalPages: 1 }));
    }

    const payload = apiResponse.json();
    const posts = payload?.data || [];
    const currentPage = payload?.meta?.current_page || page;
    const totalPages = payload?.meta?.last_page || 1;

    return reply.type('text/html').send(
      appBlogIndexPage({
        posts,
        page: currentPage,
        totalPages,
      }),
    );
  }

  async show(request, reply) {
    const { slug } = request.params;

    const postResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/posts/${encodeURIComponent(slug)}`,
    });

    if (postResponse.statusCode !== 200) {
      reply.code(postResponse.statusCode === 404 ? 404 : 500);
      return reply.type('text/html').send('<h1>Post not found</h1>');
    }

    const commentsResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/posts/${encodeURIComponent(slug)}/comments?limit=50`,
    });

    const post = postResponse.json();
    const commentsPayload = commentsResponse.statusCode === 200 ? commentsResponse.json() : { data: [] };

    return reply.type('text/html').send(
      appBlogPostPage({
        post,
        comments: commentsPayload?.data || [],
      }),
    );
  }
}

export const blogController = new BlogController();

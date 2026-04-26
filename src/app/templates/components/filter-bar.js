/**
 * Shared filter components for list pages
 * DRY: Single source of truth for filter bar, tag buttons, and dropdowns
 */

/**
 * Render a filter bar wrapper with optional left/right sections
 * @param {Object} options
 * @param {string} options.page - CSS prefix (e.g., 'blog', 'events')
 * @param {string} [options.left=''] - Left-side content (tag buttons)
 * @param {string} [options.right=''] - Right-side content (dropdown)
 * @returns {string}
 */
export function renderFilterBar({ page, left = '', right = '' } = {}) {
  return `
    <div class="${page}-page__filters">
      ${left ? `<div class="${page}-page__tags">${left}</div>` : ''}
      ${right ? `<div class="${page}-page__dropdown hs-dropdown">${right}</div>` : ''}
    </div>
  `;
}

/**
 * Render a single filter tag button
 * @param {Object} options
 * @param {string} options.label - Button text
 * @param {string} options.href - URL for non-HTMX fallback
 * @param {string} options.hxGet - HTMX endpoint
 * @param {boolean} [options.active=false] - Active state
 * @param {string} options.page - CSS prefix for active class
 * @returns {string}
 */
export function renderFilterTag({ label, href, hxGet, active = false, page } = {}) {
  const activeClass = active ? `${page}-page__tag--active` : '';
  return `
    <button type="button" class="btn btn--outline btn--sm ${activeClass}" hx-get="${hxGet}" hx-target=".app__main" hx-push-url="true">
      ${label}
    </button>
  `;
}

/**
 * Render a Preline dropdown filter
 * @param {Object} options
 * @param {string} options.page - CSS prefix
 * @param {string} options.label - Trigger button label
 * @param {Array} options.options - Menu items [{ label, href, hxGet, active }]
 * @returns {string}
 */
export function renderFilterDropdown({ page, label, options = [] } = {}) {
  const menuItems = options.map((opt) => {
    const activeClass = opt.active ? `${page}-page__dropdown-item--active` : '';
    return `
      <a href="${opt.href}" class="${activeClass}" hx-get="${opt.hxGet}" hx-target=".app__main" hx-push-url="true">
        ${opt.label}
      </a>
    `;
  }).join('');

  return `
    <button type="button" class="btn btn--outline btn--sm ${page}-page__dropdown-trigger hs-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
      ${label}
      <i class="ph ph-caret-down" aria-hidden="true"></i>
    </button>
    <div class="${page}-page__dropdown-menu hs-dropdown-menu" role="menu">
      ${menuItems}
    </div>
  `;
}

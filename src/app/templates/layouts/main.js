import { nav } from '../partials/nav.js';
import { footer } from '../partials/footer.js';

export function renderAppLayout({ title = 'GBLGA', bodyClass = '', content = '', activeRoute = '/', meta = {} } = {}) {
  const {
    description = 'Gabelli Black and LatinX Graduate Association — Building community, driving change.',
    ogImage = '/dist/images/gblga-logo.svg',
    ogType = 'website',
    ogUrl = '',
  } = meta;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="icon" type="image/png" href="/dist/images/favicon.png" />

    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:image" content="${ogImage}" />
    ${ogUrl ? `<meta property="og:url" content="${ogUrl}" />` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Forum&family=Lato:wght@300;400;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
    <link rel="stylesheet" href="/dist/css/app.css" />
    <script src="/vendor/htmx/htmx.min.js"></script>
    <script src="/vendor/preline/preline.js"></script>
    <script src="/vendor/fslightbox/index.js"></script>
    <script>
      function initPlugins() {
        if (typeof HSAccordion !== 'undefined' && HSAccordion.autoInit) {
          HSAccordion.autoInit();
        }
        if (typeof HSDropdown !== 'undefined' && HSDropdown.autoInit) {
          HSDropdown.autoInit();
        }
        if (typeof refreshFsLightbox === 'function') {
          refreshFsLightbox();
        }
      }

      // Navbar scroll effect
      document.addEventListener('DOMContentLoaded', function() {
        const nav = document.querySelector('.site-nav');
        if (nav) {
          window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
              nav.classList.add('site-nav--scrolled');
            } else {
              nav.classList.remove('site-nav--scrolled');
            }
          });
        }

        // Initialize plugins on page load
        initPlugins();
      });

      // Reinitialize plugins after HTMX content swaps
      document.addEventListener('htmx:afterSwap', function() {
        initPlugins();
      });
    </script>
  </head>
  <body class="app ${bodyClass}">
    ${nav(activeRoute)}
    <main class="app__main">
      ${content}
    </main>
    ${footer()}
  </body>
</html>`;
}

import { nav } from '../partials/nav.js';
import { footer } from '../partials/footer.js';

export function renderAppLayout({ title = 'GBLGA', bodyClass = '', content = '', activeRoute = '/' } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="icon" type="image/png" href="/dist/images/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Forum&family=Lato:wght@300;400;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
    <link rel="stylesheet" href="/dist/css/app.css" />
    <script>
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

import { renderLogo } from '../components/logo.js';

export function footer() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__top">
          <div class="site-footer__brand">
            <a class="site-footer__logo" href="/">${renderLogo()}</a>
          </div>
          <div class="site-footer__right">
            <div class="site-footer__section">
              <h3 class="site-footer__social-title">Follow Us</h3>
              <ul class="site-footer__social" aria-label="Follow Us">
                <li>
                  <a class="site-footer__social-link" href="https://www.instagram.com/blacklatinxgsb" aria-label="Instagram">
                    <i class="ph ph-instagram-logo" aria-hidden="true"></i>
                  </a>
                </li>
                <li>
                  <a class="site-footer__social-link" href="https://www.linkedin.com/in/gblga/" aria-label="LinkedIn">
                    <i class="ph ph-linkedin-logo" aria-hidden="true"></i>
                  </a>
                </li>
              </ul>
            </div>
            <div class="site-footer__section">
              <h3 class="site-footer__social-title">Contact Us</h3>
              <ul class="site-footer__social" aria-label="Contact Us">
                <li>
                  <a class="site-footer__social-link" href="mailto:gsbblacklatinx@fordham.edu" aria-label="Email">
                    <i class="ph ph-envelope-simple" aria-hidden="true"></i>
                  </a>
                </li>
                <li>
                  <a class="site-footer__social-link" href="#" aria-label="Phone">
                    <i class="ph ph-phone" aria-hidden="true"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr class="site-footer__divider" />
        <div class="site-footer__bottom">
          <div class="site-footer__bottom-inner">
            <p class="site-footer__credit">Designed and Developed by Joel Onwuanaku</p>
            <p class="site-footer__copyright">© Gabelli Black and LatinX Graduate Association ${year}</p>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function pageHero({ title = 'Page Title', subtitle = '', meta = '' } = {}) {
  return `
    <section class="page-hero" aria-label="${title}">
      <div class="page-hero__inner">
        <div class="page-hero__bg" aria-hidden="true">
          <img src="/dist/images/gblga-logo-icon-beige.svg" alt="" />
        </div>
        <div class="page-hero__content">
          <h1 class="page-hero__title">${title}</h1>
          ${subtitle ? `<p class="page-hero__subtitle">${subtitle}</p>` : ''}
          ${meta ? `<div class="page-hero__meta">${meta}</div>` : ''}
        </div>
      </div>
    </section>
  `;
}

export function renderLogo({ variant = '' } = {}) {
  const modifier = variant ? ` logo--${variant}` : '';
  return `
    <span class="logo${modifier}" aria-label="GBLGA">
      <img class="logo__image" src="/dist/images/gblga-logo.svg" alt="GBLGA Logo" />
    </span>
  `;
}


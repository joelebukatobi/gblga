# Modern Blogging CMS Dashboard

A modern, responsive blogging CMS dashboard built with **Atomic Design methodology**, **BEM naming convention**, and **SCSS + Tailwind CSS** integration.

![Dashboard Preview](https://via.placeholder.com/1200x630/1e3a8a/ffffff?text=Modern+Blogging+CMS+Dashboard)

## ✨ Features

- **Atomic Design Architecture** - Components organized into atoms, molecules, organisms, templates, and pages
- **BEM Methodology** - Clean, maintainable CSS class naming (no Tailwind classes in HTML)
- **SCSS + Tailwind Integration** - Tailwind utilities applied via `@apply` in SCSS files
- **Dark/Light Mode** - Full theme support with smooth transitions
- **Responsive Design** - Mobile-first approach with 4 breakpoints
- **Accessible** - ARIA labels, keyboard navigation, and semantic HTML
- **Modern UI Components** - Cards, tables, charts, modals, forms, and more

## 🎨 Design System

### Color Palette

**Primary (Navy Blue)**
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | `#eff6ff` | Backgrounds |
| `--color-primary-100` | `#dbeafe` | Hover states |
| `--color-primary-500` | `#2563eb` | Primary actions |
| `--color-primary-600` | `#1d4ed8` | Hover on primary |
| `--color-primary-900` | `#1e3a8a` | Dark accents |

**Neutral (Grey)**
| Token | Value | Usage |
|-------|-------|-------|
| `--color-grey-50` | `#f9fafb` | Page backgrounds |
| `--color-grey-200` | `#e5e7eb` | Borders |
| `--color-grey-600` | `#4b5563` | Body text |
| `--color-grey-900` | `#111827` | Headings |

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: 700 weight, tracked tighter
- **Body**: 400-500 weight, optimized line height

### Breakpoints

| Name  | Min Width | Target        |
| ----- | --------- | ------------- |
| `sm`  | 320px     | Mobile        |
| `md`  | 768px     | Tablet        |
| `lg`  | 1024px    | Laptop        |
| `xl`  | 1280px    | Desktop       |
| `2xl` | 1536px    | Large Desktop |

## 📁 Project Structure

```
html-dashboard/
├── dist/                    # Compiled output
│   └── css/
│       └── main.css
├── scss/
│   ├── base/               # Foundation styles
│   │   ├── _variables.scss    # CSS custom properties
│   │   ├── _reset.scss        # Modern CSS reset
│   │   ├── _typography.scss   # Type styles
│   │   └── _utilities.scss    # Helper classes
│   ├── atoms/              # Smallest components
│   │   ├── _buttons.scss
│   │   ├── _inputs.scss
│   │   ├── _labels.scss
│   │   ├── _badges.scss
│   │   ├── _icons.scss
│   │   ├── _avatars.scss
│   │   ├── _spinners.scss
│   │   ├── _toggles.scss
│   │   └── _tooltips.scss
│   ├── molecules/          # Simple component combinations
│   │   ├── _search-bar.scss
│   │   ├── _form-group.scss
│   │   ├── _card-header.scss
│   │   ├── _nav-item.scss
│   │   ├── _dropdown.scss
│   │   ├── _stat-card.scss
│   │   ├── _breadcrumb.scss
│   │   ├── _pagination.scss
│   │   ├── _tab-group.scss
│   │   └── _alert.scss
│   ├── organisms/          # Complex components
│   │   ├── _sidebar.scss
│   │   ├── _header.scss
│   │   ├── _data-table.scss
│   │   ├── _chart-container.scss
│   │   ├── _post-editor.scss
│   │   ├── _media-library.scss
│   │   ├── _comment-list.scss
│   │   ├── _user-card.scss
│   │   ├── _seo-preview.scss
│   │   └── _modal.scss
│   ├── templates/          # Page layouts
│   │   ├── _dashboard-layout.scss
│   │   ├── _post-layout.scss
│   │   ├── _settings-layout.scss
│   │   └── _auth-layout.scss
│   ├── pages/              # Page-specific styles
│   │   ├── _dashboard.scss
│   │   ├── _posts.scss
│   │   ├── _media.scss
│   │   ├── _analytics.scss
│   │   ├── _users.scss
│   │   └── _settings.scss
│   └── main.scss           # Main entry point
├── index.html              # Dashboard HTML
├── sample_data.js          # Mock data
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone or download the project**

   ```bash
   cd html-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build CSS**

   ```bash
   npm run build
   ```

4. **Watch for changes (development)**

   ```bash
   npm run watch
   ```

5. **Open in browser**
   - Open `index.html` directly in your browser
   - Or use a local server like Live Server

### Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run build` | Compile SCSS to CSS          |
| `npm run watch` | Watch and compile on changes |
| `npm run dev`   | Alias for watch              |

## 🧱 Component Library

### Atoms

#### Buttons

```html
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>
```

#### Inputs

```html
<input type="text" class="input" placeholder="Default input" />
<input type="text" class="input input--error" placeholder="Error state" />
<input type="text" class="input input--success" placeholder="Success state" />
```

#### Badges

```html
<span class="badge">Default</span>
<span class="badge badge--primary">Primary</span>
<span class="badge badge--success">Success</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--danger">Danger</span>
```

#### Avatars

```html
<div class="avatar avatar--sm">
  <img src="avatar.jpg" alt="User" />
</div>
<div class="avatar avatar--md avatar--status">
  <img src="avatar.jpg" alt="User" />
  <span class="avatar__status avatar__status--online"></span>
</div>
<div class="avatar avatar--lg avatar--initials">JD</div>
```

### Molecules

#### Search Bar

```html
<div class="search-bar">
  <div class="search-bar__icon">
    <i data-lucide="search"></i>
  </div>
  <input type="text" class="search-bar__input" placeholder="Search..." />
</div>
```

#### Stat Card

```html
<div class="stat-card">
  <div class="stat-card__icon stat-card__icon--primary">
    <i data-lucide="file-text"></i>
  </div>
  <div class="stat-card__content">
    <span class="stat-card__label">Total Posts</span>
    <span class="stat-card__value">248</span>
  </div>
</div>
```

### Organisms

#### Sidebar

```html
<aside class="sidebar">
  <div class="sidebar__header">...</div>
  <nav class="sidebar__nav">
    <div class="sidebar__group">
      <div class="sidebar__group-title">Menu</div>
      <ul class="sidebar__menu">
        <li>
          <a href="#" class="sidebar__item sidebar__item--active">
            <span class="sidebar__item-icon"><i data-lucide="home"></i></span>
            <span class="sidebar__item-text">Dashboard</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</aside>
```

#### Data Table

```html
<div class="data-table">
  <div class="data-table__header">
    <input type="checkbox" class="data-table__checkbox" />
    <span>Title</span>
    <span>Status</span>
    <span>Actions</span>
  </div>
  <div class="data-table__body">
    <div class="data-table__row">
      <input type="checkbox" class="data-table__checkbox" />
      <span>Post Title</span>
      <span class="badge badge--success">Published</span>
      <button class="btn btn--ghost btn--sm">Edit</button>
    </div>
  </div>
</div>
```

## 🌙 Dark Mode

Dark mode is implemented using CSS custom properties and a `.dark` class on the `<html>` element.

### Toggle Theme (JavaScript)

```javascript
const html = document.documentElement;
html.classList.toggle('dark');
localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
```

### System Preference Detection

```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) {
  document.documentElement.classList.add('dark');
}
```

## 📐 BEM Methodology

This project follows strict BEM naming conventions:

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

### Examples

```scss
// Block
.sidebar {
}

// Element
.sidebar__item {
}
.sidebar__item-icon {
}

// Modifier
.sidebar--collapsed {
}
.sidebar__item--active {
}
```

## 🛠️ Tailwind + SCSS Integration

Tailwind utilities are applied using `@apply` directives in SCSS, keeping HTML clean with only BEM classes:

```scss
// atoms/_buttons.scss
.btn {
  @apply inline-flex items-center justify-center;
  @apply px-4 py-2 rounded-lg font-medium;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;

  &--primary {
    @apply bg-primary-600 text-white;
    @apply hover:bg-primary-700;
    @apply focus:ring-primary-500;
  }
}
```

## 📱 Responsive Design

Mobile-first breakpoints using Tailwind's responsive prefixes in SCSS:

```scss
.sidebar {
  @apply fixed inset-y-0 left-0;
  @apply w-64 transform -translate-x-full;

  @screen md {
    @apply translate-x-0;
  }

  @screen lg {
    @apply relative;
  }
}
```

## 🧪 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Dependencies

| Package        | Version  | Purpose                     |
| -------------- | -------- | --------------------------- |
| `tailwindcss`  | ^3.4.0   | Utility-first CSS framework |
| `sass`         | ^1.69.0  | SCSS preprocessor           |
| `postcss`      | ^8.4.32  | CSS processing              |
| `autoprefixer` | ^10.4.16 | Vendor prefixes             |
| `preline`      | ^2.0.3   | UI component library        |

## 🎯 Roadmap

- [ ] Add more page templates (Posts, Media, Analytics)
- [ ] Implement full Chart.js integration
- [ ] Add form validation
- [ ] Create additional color themes
- [ ] Add animation library integration
- [ ] Build component documentation site

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

---

Built with ❤️ using Atomic Design, BEM, SCSS, and Tailwind CSS

# BookStoreEcommerce Frontend

![BookStoreEcommerce Logo](./src/assets/img/home/logo.svg)

Bookstore e-commerce frontend featuring product browsing, shopping flow (cart/checkout), user authentication, order management, and an admin portal for products, categories, and orders. Built with a focus on: standalone components, signals-based state, strict typing, accessibility, and maintainability.

---

## Table of Contents

1. Overview
2. Tech Stack
3. Features
4. Project Structure
5. Getting Started
6. Environment Configuration
7. Available Scripts
8. Architecture & Conventions
9. State & Data Flow
10. Authentication & Authorization
11. Internationalization (i18n)
12. Admin Functionality
13. Testing
14. Styling & Theming
15. Performance Techniques
16. Challenges & Solutions
17. Future Improvements
18. License

---

## 1. Overview

This frontend consumes a RESTful backend (base URL configured in `environment.ts`). It provides public product views, secure user operations (orders & checkout), and restricted admin management of products, categories, and order statuses.

## 2. Tech Stack

- Angular 20 (standalone APIs, signals, new control flow `@if`, `@for`)
- TypeScript (strict mode)
- RxJS for async streams (minimal usage; signals preferred for component state)
- SCSS modular styles
- Jasmine/Karma for unit tests
- Gameball widget integration (loyalty/engagement) via config keys

## 3. Features

User:

- Browse products & view details
- Register / Login / Persisted auth (JWT via interceptor)
- Place orders (checkout flow)
- View personal orders with detail modal

Admin:

- Manage products (CRUD)
- Manage categories (CRUD)
- View all orders & update status (Pending | Completed | Cancelled)

Cross-cutting:

- Auth guards (`authGuard`, `adminGuard`)
- HTTP interceptor attaches JWT automatically
- Responsive layout & accessible form controls

## 4. Project Structure

```text
src/
  app/
    core/              # guards, interceptors, models, services
    features/          # feature grouped UI
      products/        # product list & details
      orders/          # user orders list
      checkout/        # checkout flow
      auth/            # login/register
      admin/           # admin dashboard + products/categories/orders
    shared/            # shared components (e.g., navbar)
  assets/              # images, fonts
  environments/        # environment.ts (dev) (add prod variants as needed)
```

## 5. Getting Started

### Prerequisites

- Node.js LTS (>= 18 recommended)
- npm (comes with Node)

### Install Dependencies

```powershell
npm install
```

### Run Dev Server

```powershell
npm start

# or
ng serve
```

Navigate to: <http://localhost:4200/>

The backend API should be running (default assumed: `http://localhost:5268/api`). Adjust in `src/environments/environment.ts` if different.

## 6. Environment Configuration

`src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5268/api',
  gameballPublicKey: '...key...',
  gameballLang: 'en',
  showGameballForGuests: true,
};
```

For production: create `environment.prod.ts` and configure `fileReplacements` in `angular.json`.

## 7. Available Scripts

| Script          | Description                            |
| --------------- | -------------------------------------- |
| `npm start`     | Run dev server with live reload        |
| `npm run build` | Production build (outputs to `dist/`)  |
| `npm test`      | Run unit tests via Karma/Jasmine       |
| `npm run watch` | Rebuild on change (development config) |

## 8. Architecture & Conventions

Principles:

- Standalone components (no NgModules) – Angular 20 default.
- Signals for local component state; RxJS only when dealing with streams from services.
- Services are stateless bridges to the backend.
- Use `inject()` instead of constructor DI for brevity.
- Avoid `@HostBinding` / `@HostListener`; use `host` metadata if needed.
- Lean templates: minimal logic; prefer computed state in TS.
- Consistent naming: `feature-name` directory with `feature-name.ts/html/scss/spec.ts`.

## 9. State & Data Flow

- Transient UI state (loading/error/selection) managed via Angular signals.
- Derived state uses `computed()` where necessary.
- Backend entities modeled in `core/models/*`.
- No global store library: complexity is low; signals suffice.

## 10. Authentication & Authorization

- `AuthService` handles token storage & current user observable.
- `authInterceptor` attaches `Authorization: Bearer <token>` if present.
- `authGuard` redirects unauthenticated users to `/login` with `returnUrl`.
- `adminGuard` verifies user role equals `admin` (case-insensitive) before granting access to `/admin/*`.

## 11. Internationalization (i18n)

- Static JSON resource files in `assets/i18n/` (English, French, Arabic).
- (Integration layer for switching languages can be extended; currently file presence indicates readiness.)

## 12. Admin Functionality

Routes under `/admin` (protected):

- Products management – create, edit, delete, list.
- Categories management – create, edit, delete, list.
- Orders management – list all orders, update status via PUT `/orders/{id}/status` sending `{ status }` where status ∈ `Pending | Completed | Cancelled`.

## 13. Testing

### Unit Tests

Create specs adjacent to components/services (`*.spec.ts`). Run:

```powershell
npm test
```

Karma auto-watches files in dev mode.

### Suggested Additional Tests (TODO)

- Admin order status update service call (mock HttpClient)
- Guards redirection logic
- AuthService token persistence

## 14. Styling & Theming

- Global SCSS entry: `src/styles.scss` importing modular partials under `styles/`.
- Utility layers: variables (`_variables.scss`), mixins (`_mixins.scss`), libs overrides (`_libs.scss`).
- Component-scoped styles kept minimal; rely on global design tokens.

## 15. Performance Techniques

- Standalone + lazy loaded feature routes reduce initial bundle.
- OnPush change detection everywhere to minimize checks.
- Signals reduce unnecessary RxJS subscription churn.
- Selective dynamic imports for admin sections.

## 16. Challenges & Solutions

| Challenge                                                  | Solution                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Aligning frontend status values with evolving backend enum | Centralized statuses array and updated user orders filter to the new enum values.        |
| Avoiding state management bloat                            | Adopted Angular signals over external store libraries for clarity & performance.         |
| Minimizing template complexity                             | Moved logic into TS (signals/computed) and used new control flow syntax for readability. |
| Secure admin-only access                                   | Implemented `adminGuard` checking role case-insensitively before route activation.       |
| Auth header injection without repetition                   | Added functional `authInterceptor` using `inject(AuthService)`.                          |
| Keeping components lean while loading related entities     | Service layer isolates HTTP; components only orchestrate and map data.                   |

## 17. Future Improvements

- Add cart persistence (localStorage) & cart preview component.
- Add pagination & searching for products and orders.
- Integrate proper i18n service & runtime language switch with directionality (LTR/RTL) handling.
- Introduce e2e testing (e.g., Cypress or Playwright) for checkout + admin flows.
- Implement optimistic UI updates when changing order status.
- Add skeleton loaders for perceived performance.
- Add accessibility audits (ARIA roles for complex components).
- Add production environment file & CI pipeline (build, lint, test).

## 18. License

Proprietary / Internal (update this section if you intend to open-source the project).

---

### Quick Reference

```powershell
# Install
npm install

# Run dev
npm start

# Run tests
npm test

# Build prod
npm run build
```

---